/* ============================================================================
   types.ts — the row shapes for the curation workspace (Stage A, Task 1).
   ----------------------------------------------------------------------------
   These mirror the five tables created in
   supabase/migrations/0001_curation_workspace.sql, one TypeScript type per
   table. They keep the app and the database speaking the same language, and
   they reuse the app's own vocabulary where it already exists:

     - CoverageStatus / DraftStatus / VerificationOutcome are the status words
       the database check constraints enforce.
     - AgendaItemType and VoteEntry come straight from the town data contract
       (data/towns/schema.ts), so an agenda item captured here has the same
       shape as one shown on the resident-facing site.

   This phase builds the database and the types only. The screens that read and
   write these rows are Tasks 2 and 3.
   ========================================================================== */

import type { AgendaItemType, VoteEntry } from "@/data/towns/schema";

/** A meeting's coverage walks these steps, in order, one at a time. */
export type CoverageStatus =
  | "not_started"
  | "agenda_captured"
  | "minutes_captured"
  | "summary_drafted"
  | "summary_reviewed"
  | "published";

/** Who wrote a draft. Only "human" is written in this phase. */
export type DraftedBy = "human" | "ai";

/** Where a draft sits in review. */
export type DraftStatus = "pending_review" | "approved" | "rejected";

/** How a draft was reviewed. */
export type ReviewType = "independent" | "self";

/** What a flag check decided. */
export type VerificationOutcome = "corrected" | "stands";

/** A person on the team, and the role they hold. */
export type TeamRole = "scout" | "curator" | "admin";

export interface MeetingRow {
  id: string;
  body_id: string;
  title: string;
  date: string | null;
  time: string | null;
  coverage_status: CoverageStatus;
  submitted_by: string | null;
  created_at: string;
}

export interface AgendaItemRow {
  id: string;
  meeting_id: string | null;
  title: string;
  type: AgendaItemType | null;
  raw_source_text: string | null;
  video_timestamp: string | null;
  vote_result: string | null;
  vote_roll: VoteEntry[] | null;
  thread_id: string | null;
  submitted_by: string | null;
  created_at: string;
}

export interface SummaryDraftRow {
  id: string;
  agenda_item_id: string | null;
  draft_text: string | null;
  drafted_by: DraftedBy | null;
  drafter_name: string | null;
  status: DraftStatus;
  review_type: ReviewType | null;
  reviewer_name: string | null;
  reviewed_at: string | null;
  rejection_note: string | null;
  created_at: string;
}

export interface VerificationLogEntryRow {
  id: string;
  claim_text: string;
  outcome: VerificationOutcome | null;
  source_reference: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface TeamMemberRow {
  id: string;
  name: string;
  role: TeamRole | null;
  email: string | null;
  created_at: string;
}
