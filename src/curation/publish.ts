/* ============================================================================
   publish.ts — the publish seam for the curation workspace (Stage A, Task 3).
   ----------------------------------------------------------------------------
   This is the one place that turns approved, reviewed content in Supabase into
   the exact objects data/towns/clawson.json already expects. Everything the
   publish screen needs runs through here, the same way every resident-facing
   component reads town facts through src/town.ts and every workspace screen
   reads the database through src/curation/workspace.ts.

   Two jobs, kept separate and honest:

     1. Build a schema-shaped Meeting (data/towns/schema.ts) from a meeting's
        approved agenda items and their approved drafts. Pure functions, no
        database and no network, so what gets published is easy to read and
        easy to check. The commit itself is done by the small publish worker
        (serverless/publish-worker.js), which holds the GitHub token; a token
        can never live in code that ships to a browser.

     2. Move a meeting's coverage_status to "published" in Supabase, but only
        after the clawson.json commit genuinely succeeds. Never before.

   The honest-labeling rule from Task 2 is carried straight through: a draft
   whose review_type is "self" publishes a source marked selfReviewed, so the
   resident-facing panel shows "reviewed by the same person who drafted it"
   rather than "a person checked this against the source".
   ========================================================================== */

import { getSupabase } from "@/src/supabase";
import { town } from "@/src/town";
import {
  getAgendaItems,
  getDraftsForItems,
  getMeeting,
} from "@/src/curation/workspace";
import type {
  AgendaItemRow,
  MeetingRow,
  ReviewType,
  SummaryDraftRow,
  VerificationOutcome,
} from "@/src/curation/types";
import type {
  AgendaItem,
  AgendaItemType,
  Meeting,
  MeetingStatus,
  Source,
  Vote,
} from "@/data/towns/schema";
import type { VerificationEntry } from "@/data/verification-log.schema";

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
   Building the published Meeting.
   ---------------------------------------------------------------------------- */

/** The approved draft for an item, newest first if there is more than one. */
export function approvedDraftFor(
  itemId: string,
  drafts: SummaryDraftRow[],
): SummaryDraftRow | null {
  const approved = drafts
    .filter((d) => d.agenda_item_id === itemId && d.status === "approved")
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return approved[0] ?? null;
}

/** A plain, curator-facing view of one item's review, shown before publishing. */
export interface ItemReview {
  title: string;
  summary: string;
  reviewType: ReviewType;
  drafterName: string | null;
  reviewerName: string | null;
}

export interface BuiltPublish {
  /** The schema-shaped Meeting that will be written into clawson.json. */
  meeting: Meeting;
  /** One row per published item, for the publish screen's summary. */
  reviews: ItemReview[];
  /** The PR title: "Publish: {meeting title}, {date}". */
  commitTitle: string;
}

/**
 * Build the source object for one published item, honestly.
 *
 * - `real` is always true; this is a verified, sourced fact from the record.
 * - `drafted` is set only when the draft was written by software (drafted_by
 *   "ai"). The "Drafted" line in the source panel reads "drafted by software",
 *   so we never set it for a human curator's draft; that would claim something
 *   untrue. Human drafts stay unmarked here, which is the honest default.
 * - `selfReviewed` is set when the review was a self review, so the panel
 *   shows the honest self-review line instead of the independent-check line.
 */
function buildSource(
  meeting: MeetingRow,
  draft: SummaryDraftRow,
): Source {
  const date =
    meeting.date ??
    (draft.reviewed_at ? draft.reviewed_at.slice(0, 10) : "");
  const source: Source = {
    label: `City of ${town.town.name}`,
    date,
    real: true,
  };
  if (draft.drafted_by === "ai") source.drafted = true;
  if (draft.review_type === "self") source.selfReviewed = true;
  return source;
}

/** A readable, stable id for the published meeting, e.g. "planning-2026-02-24". */
export function publishedMeetingId(meeting: MeetingRow): string {
  return meeting.date ? `${meeting.body_id}-${meeting.date}` : meeting.id;
}

/**
 * Turn a reviewed meeting and its approved drafts into the exact Meeting object
 * clawson.json expects. Only items that carry an approved draft are published;
 * a meeting reaches summary_reviewed only once every item is approved, so in
 * practice that is all of them. Pure: no database, no network.
 */
export function buildPublishedMeeting(
  meeting: MeetingRow,
  items: AgendaItemRow[],
  drafts: SummaryDraftRow[],
): BuiltPublish {
  const ordered = [...items].sort((a, b) =>
    a.created_at < b.created_at ? -1 : 1,
  );

  const built: { item: AgendaItem; review: ItemReview }[] = [];
  ordered.forEach((row) => {
    const draft = approvedDraftFor(row.id, drafts);
    if (!draft) return; // not approved yet; not publishable
    const n = built.length + 1;

    const type: AgendaItemType = row.type ?? "discussion";
    const summary = (draft.draft_text ?? "").trim();

    const item: AgendaItem = {
      id: `i${n}`,
      n,
      title: row.title,
      type,
      summary,
      source: buildSource(meeting, draft),
    };
    if (row.thread_id) item.threadId = row.thread_id;
    if (row.video_timestamp) item.videoTimestamp = row.video_timestamp;
    if (row.vote_result) {
      const vote: Vote = {
        result: row.vote_result,
        roll: row.vote_roll ?? [],
      };
      item.vote = vote;
    }

    built.push({
      item,
      review: {
        title: row.title,
        summary,
        reviewType: draft.review_type ?? "independent",
        drafterName: draft.drafter_name,
        reviewerName: draft.reviewer_name,
      },
    });
  });

  // Itemized minutes with a video timestamp are the "close-out" shape; a plain
  // held meeting otherwise.
  const status: MeetingStatus = built.some((b) => b.item.videoTimestamp)
    ? "closed-out"
    : "held";

  const meetingObject: Meeting = {
    id: publishedMeetingId(meeting),
    body: meeting.body_id,
    title: meeting.title,
    date: meeting.date ?? "",
    time: meeting.time ?? "",
    status,
    items: built.map((b) => b.item),
  };

  const dateLabel = meeting.date ?? "no date";
  return {
    meeting: meetingObject,
    reviews: built.map((b) => b.review),
    commitTitle: `Publish: ${meeting.title}, ${dateLabel}`,
  };
}

/**
 * Load a meeting and build its publish preview in one call. Returns null if the
 * meeting is not there. Throws if it is not ready to publish or has nothing
 * approved to publish, so the screen can be honest about why.
 */
export async function getPublishPreview(
  meetingId: string,
): Promise<{ meeting: MeetingRow; built: BuiltPublish } | null> {
  const meeting = await getMeeting(meetingId);
  if (!meeting) return null;
  if (meeting.coverage_status !== "summary_reviewed") {
    throw new Error(
      meeting.coverage_status === "published"
        ? "This meeting has already been published."
        : "This meeting is not reviewed yet, so there is nothing to publish. " +
          "Finish reviewing every item first.",
    );
  }
  const items = await getAgendaItems(meetingId);
  const drafts = await getDraftsForItems(items.map((i) => i.id));
  const built = buildPublishedMeeting(meeting, items, drafts);
  if (built.meeting.items.length === 0) {
    throw new Error("There are no approved items to publish on this meeting.");
  }
  return { meeting, built };
}

/* ----------------------------------------------------------------------------
   Recording the publish in Supabase.
   ---------------------------------------------------------------------------- */

/**
 * Move a meeting to published, but only from summary_reviewed. This is called
 * only after the clawson.json commit has genuinely succeeded, so the ledger can
 * never say "published" for a meeting whose record was not actually written.
 */
export async function markMeetingPublished(meetingId: string): Promise<void> {
  const { error } = await client()
    .from("meetings")
    .update({ coverage_status: "published" })
    .eq("id", meetingId)
    .eq("coverage_status", "summary_reviewed");
  if (error) throw new Error(error.message);
}

/* ----------------------------------------------------------------------------
   The light verification-log connection (Part 3).

   Kept as its own small, standalone action rather than bundled into the meeting
   publish, so the audit trail stays "one commit, one meeting" (ADR-002). A
   curator records what a checked flag decided, which both saves a
   verification_log_entries row and exports it into data/verification-log.json
   through the same publish worker, on its own branch and PR.
   ---------------------------------------------------------------------------- */

export interface VerificationInput {
  claim: string;
  outcome: VerificationOutcome;
  dateChecked: string; // YYYY-MM-DD
  sourceLabel: string;
  sourceUrl: string;
}

/** Build the data/verification-log.json entry from a curator's input. */
export function buildVerificationEntry(
  input: VerificationInput,
): VerificationEntry {
  return {
    claim: input.claim.trim(),
    outcome: input.outcome,
    dateChecked: input.dateChecked,
    source: {
      label: input.sourceLabel.trim(),
      url: input.sourceUrl.trim(),
    },
  };
}

/**
 * Save a verification_log_entries row. Records the resolved date so the row and
 * the exported entry agree. Called before the export; if the export fails, the
 * row is still a true record of the check that happened.
 */
export async function addVerificationLogEntry(
  input: VerificationInput,
): Promise<void> {
  const { error } = await client().from("verification_log_entries").insert({
    claim_text: input.claim.trim(),
    outcome: input.outcome,
    source_reference: `${input.sourceLabel.trim()} | ${input.sourceUrl.trim()}`,
    resolved_at: `${input.dateChecked}T00:00:00Z`,
  });
  if (error) throw new Error(error.message);
}
