/* ============================================================================
   workspace.ts — the data seam for the curation workspace (Stage A, Task 2).
   ----------------------------------------------------------------------------
   Every workspace screen reads and writes the database through this one module,
   the same way every resident-facing component reads town facts through
   src/town.ts. The screens never touch the Supabase client directly; they call
   the plain functions here, which speak in the row types from
   src/curation/types.ts.

   The whole database is locked behind row-level security (Task 1): only a
   signed-in Supabase collaborator can read or write. The workspace signs the
   collaborator in with Supabase Auth (see app/workspace/WorkspaceShell.tsx), so
   by the time these functions run there is an authenticated session and the
   policies allow the work.

   Two rules keep this file honest and small:
   - A meeting's coverage_status only ever moves forward. Re-submitting an
     agenda after minutes are in does not walk the meeting backward.
   - The summary stages (drafted, reviewed) are derived from the drafts on a
     meeting's items, not set by hand, so the coverage ledger always tells the
     truth about where a meeting really stands.
   ========================================================================== */

import { getSupabase } from "@/src/supabase";
import type {
  AgendaItemRow,
  CoverageStatus,
  MeetingRow,
  SummaryDraftRow,
} from "@/src/curation/types";

/** The ordered walk a meeting takes. Index is used to compare two statuses. */
export const COVERAGE_ORDER: CoverageStatus[] = [
  "not_started",
  "agenda_captured",
  "minutes_captured",
  "summary_drafted",
  "summary_reviewed",
  "published",
];

/** A short, plainspoken label for each status, for the coverage ledger. */
export const COVERAGE_LABEL: Record<CoverageStatus, string> = {
  not_started: "Not started",
  agenda_captured: "Agenda in",
  minutes_captured: "Minutes in",
  summary_drafted: "Draft written",
  summary_reviewed: "Reviewed",
  published: "Published",
};

/** The later of two statuses, so a meeting never moves backward. */
function laterStatus(a: CoverageStatus, b: CoverageStatus): CoverageStatus {
  return COVERAGE_ORDER.indexOf(a) >= COVERAGE_ORDER.indexOf(b) ? a : b;
}

/** The Supabase client, or a clear error if the workspace is not connected. */
function client() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(
      "The workspace is not connected to its database yet. Set the two " +
        "Supabase variables and redeploy.",
    );
  }
  return supabase;
}

/* ----------------------------------------------------------------------------
   The source document for a meeting.

   A scout submits an agenda, minutes, and a recording link as plain text. We
   keep all three together in one agenda_items row per meeting, in its
   raw_source_text, under three labeled sections. Storing them under fixed
   headers means we can merge submissions: a scout can send the agenda before
   the meeting and the minutes after, and neither one wipes the other.
   ---------------------------------------------------------------------------- */

const AGENDA_HEADER = "AGENDA";
const MINUTES_HEADER = "MINUTES";
const RECORDING_HEADER = "RECORDING";

export interface SourceParts {
  agenda: string;
  minutes: string;
  recording: string;
}

/** Fold three sections into one raw_source_text, dropping any that are empty. */
export function composeSource(parts: SourceParts): string {
  const blocks: string[] = [];
  if (parts.agenda.trim()) {
    blocks.push(`${AGENDA_HEADER}\n${parts.agenda.trim()}`);
  }
  if (parts.minutes.trim()) {
    blocks.push(`${MINUTES_HEADER}\n${parts.minutes.trim()}`);
  }
  if (parts.recording.trim()) {
    blocks.push(`${RECORDING_HEADER}\n${parts.recording.trim()}`);
  }
  return blocks.join("\n\n");
}

/** Split a raw_source_text back into its three sections. */
export function parseSource(text: string | null): SourceParts {
  const empty: SourceParts = { agenda: "", minutes: "", recording: "" };
  if (!text) return empty;
  const headers = [AGENDA_HEADER, MINUTES_HEADER, RECORDING_HEADER];
  const result = { ...empty };
  // Walk line by line, routing each line to whichever section is open.
  let current: keyof SourceParts | null = null;
  const buckets: Record<keyof SourceParts, string[]> = {
    agenda: [],
    minutes: [],
    recording: [],
  };
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === AGENDA_HEADER) {
      current = "agenda";
      continue;
    }
    if (trimmed === MINUTES_HEADER) {
      current = "minutes";
      continue;
    }
    if (trimmed === RECORDING_HEADER) {
      current = "recording";
      continue;
    }
    if (current) buckets[current].push(line);
  }
  void headers;
  result.agenda = buckets.agenda.join("\n").trim();
  result.minutes = buckets.minutes.join("\n").trim();
  result.recording = buckets.recording.join("\n").trim();
  return result;
}

/* ----------------------------------------------------------------------------
   Reads
   ---------------------------------------------------------------------------- */

/** Every meeting, soonest or most recent first. */
export async function listMeetings(): Promise<MeetingRow[]> {
  const { data, error } = await client()
    .from("meetings")
    .select("*")
    .order("date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MeetingRow[];
}

/** One meeting by id, or null if it is not there. */
export async function getMeeting(id: string): Promise<MeetingRow | null> {
  const { data, error } = await client()
    .from("meetings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as MeetingRow | null) ?? null;
}

/** The agenda items on a meeting, oldest first. */
export async function getAgendaItems(
  meetingId: string,
): Promise<AgendaItemRow[]> {
  const { data, error } = await client()
    .from("agenda_items")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AgendaItemRow[];
}

/** Every draft written for a set of agenda items, oldest first. */
export async function getDraftsForItems(
  itemIds: string[],
): Promise<SummaryDraftRow[]> {
  if (itemIds.length === 0) return [];
  const { data, error } = await client()
    .from("summary_drafts")
    .select("*")
    .in("agenda_item_id", itemIds)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as SummaryDraftRow[];
}

/* ----------------------------------------------------------------------------
   How a single item stands, read from its drafts.
   ---------------------------------------------------------------------------- */

export type ItemState = "needs_draft" | "pending" | "approved";

/** The state of one item: approved if any draft is approved; otherwise it
 *  follows the newest draft (pending if that one waits for review, needs a
 *  draft if the newest was rejected or there is no draft at all). */
export function itemState(drafts: SummaryDraftRow[]): ItemState {
  if (drafts.some((d) => d.status === "approved")) return "approved";
  const newest = [...drafts].sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  )[0];
  if (newest && newest.status === "pending_review") return "pending";
  return "needs_draft";
}

/* ----------------------------------------------------------------------------
   Writes
   ---------------------------------------------------------------------------- */

/**
 * Recompute a meeting's coverage_status from the drafts on its items, and save
 * it if it changed. The summary stages are always derived here, never set by
 * hand, so the ledger cannot drift from the real state.
 *
 * - Every item approved  -> summary_reviewed
 * - Every item drafted or approved (none still needs a draft) -> summary_drafted
 * - Otherwise the meeting falls back to its capture stage (minutes or agenda),
 *   which is where a rejected draft correctly sends it: back to draftable.
 */
async function recomputeCoverage(meetingId: string): Promise<void> {
  const supabase = client();
  const meeting = await getMeeting(meetingId);
  if (!meeting) return;

  const items = await getAgendaItems(meetingId);
  const drafts = await getDraftsForItems(items.map((i) => i.id));

  // The capture stage the source material earns on its own, ignoring drafts.
  const source = parseSource(items[0]?.raw_source_text ?? null);
  const captureStage: CoverageStatus = source.minutes
    ? "minutes_captured"
    : source.agenda
      ? "agenda_captured"
      : "not_started";

  let target: CoverageStatus = captureStage;
  if (items.length > 0) {
    const states = items.map((item) =>
      itemState(drafts.filter((d) => d.agenda_item_id === item.id)),
    );
    if (states.every((s) => s === "approved")) {
      target = "summary_reviewed";
    } else if (states.every((s) => s === "approved" || s === "pending")) {
      target = "summary_drafted";
    }
  }

  // Published is a Task 3 step; never touch a meeting that already got there.
  if (meeting.coverage_status === "published") return;
  if (meeting.coverage_status === target) return;

  const { error } = await supabase
    .from("meetings")
    .update({ coverage_status: target })
    .eq("id", meetingId);
  if (error) throw new Error(error.message);
}

export interface ScoutSubmission {
  meetingId: string;
  agendaText: string;
  minutesText: string;
  recordingLink: string;
  submittedBy: string;
}

/**
 * Save a scout submission. Merges the new agenda, minutes, and recording into
 * the meeting's single source item (creating it the first time), records who
 * sent it, and advances the meeting's coverage_status to agenda_captured or
 * minutes_captured, whichever the material now earns. Returns the meeting so
 * the caller can build the notice.
 */
export async function submitScoutMaterial(
  submission: ScoutSubmission,
): Promise<MeetingRow> {
  const supabase = client();
  const meeting = await getMeeting(submission.meetingId);
  if (!meeting) {
    throw new Error("That meeting could not be found.");
  }

  const items = await getAgendaItems(submission.meetingId);
  const existing = items[0] ?? null;
  const before = parseSource(existing?.raw_source_text ?? null);

  // Merge: keep whatever is already there for any field left blank this time.
  const merged: SourceParts = {
    agenda: submission.agendaText.trim() || before.agenda,
    minutes: submission.minutesText.trim() || before.minutes,
    recording: submission.recordingLink.trim() || before.recording,
  };
  const rawSourceText = composeSource(merged);

  if (existing) {
    const { error } = await supabase
      .from("agenda_items")
      .update({
        raw_source_text: rawSourceText,
        submitted_by: submission.submittedBy.trim() || existing.submitted_by,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("agenda_items").insert({
      meeting_id: submission.meetingId,
      title: meeting.title,
      raw_source_text: rawSourceText,
      submitted_by: submission.submittedBy.trim() || null,
    });
    if (error) throw new Error(error.message);
  }

  // The capture stage this submission earns, never walking the meeting back.
  const captureStage: CoverageStatus = merged.minutes
    ? "minutes_captured"
    : merged.agenda
      ? "agenda_captured"
      : "not_started";
  const nextStatus = laterStatus(meeting.coverage_status, captureStage);

  const { error: mErr } = await supabase
    .from("meetings")
    .update({
      coverage_status: nextStatus,
      submitted_by: submission.submittedBy.trim() || meeting.submitted_by,
    })
    .eq("id", submission.meetingId);
  if (mErr) throw new Error(mErr.message);

  return { ...meeting, coverage_status: nextStatus };
}

export interface DraftInput {
  agendaItemId: string;
  meetingId: string;
  draftText: string;
  drafterName: string;
}

/**
 * Write a pending draft for one item, by a person. Then recompute the meeting,
 * which moves it to summary_drafted once every item has a draft waiting.
 */
export async function saveDraft(input: DraftInput): Promise<void> {
  const { error } = await client().from("summary_drafts").insert({
    agenda_item_id: input.agendaItemId,
    draft_text: input.draftText.trim(),
    drafted_by: "human",
    drafter_name: input.drafterName.trim() || null,
    status: "pending_review",
  });
  if (error) throw new Error(error.message);
  await recomputeCoverage(input.meetingId);
}

/** Whether a reviewer approving their own work counts as a self review. */
export function reviewTypeFor(
  drafterName: string | null,
  reviewerName: string,
): "self" | "independent" {
  const a = (drafterName ?? "").trim().toLowerCase();
  const b = reviewerName.trim().toLowerCase();
  return a.length > 0 && a === b ? "self" : "independent";
}

export interface ApproveInput {
  draftId: string;
  meetingId: string;
  drafterName: string | null;
  reviewerName: string;
  reviewedAtIso: string;
}

/**
 * Approve a draft. Labels the review "self" when the reviewer's name matches
 * the drafter's, "independent" when it differs. This is the honest-labeling
 * rule from the design document: it is what keeps every published claim true.
 */
export async function approveDraft(input: ApproveInput): Promise<void> {
  const reviewType = reviewTypeFor(input.drafterName, input.reviewerName);
  const { error } = await client()
    .from("summary_drafts")
    .update({
      status: "approved",
      review_type: reviewType,
      reviewer_name: input.reviewerName.trim(),
      reviewed_at: input.reviewedAtIso,
    })
    .eq("id", input.draftId);
  if (error) throw new Error(error.message);
  await recomputeCoverage(input.meetingId);
}

export interface RejectInput {
  draftId: string;
  meetingId: string;
  note: string;
}

/**
 * Reject a draft with a note. The draft is kept, not deleted, so its history
 * and the note stay visible; the item returns to draftable on the recompute.
 */
export async function rejectDraft(input: RejectInput): Promise<void> {
  const { error } = await client()
    .from("summary_drafts")
    .update({
      status: "rejected",
      rejection_note: input.note.trim(),
    })
    .eq("id", input.draftId);
  if (error) throw new Error(error.message);
  await recomputeCoverage(input.meetingId);
}
