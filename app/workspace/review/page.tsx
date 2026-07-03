"use client";

/* ============================================================================
   Review screen (Stage A, Task 2, Part 5).
   ----------------------------------------------------------------------------
   For one meeting, show each draft that is waiting for review side by side with
   the raw source text it was written from, so a reviewer can compare them
   without leaving the screen. Two actions per draft: approve, or reject with a
   note.

   The honest-labeling rule: before approving, the reviewer confirms their name.
   If it matches the drafter's name, the approval is recorded as a self review;
   if it differs, as an independent review. This is what keeps every published
   claim on the live site true, so it is shown plainly here before the reviewer
   commits.

   A rejected draft is kept, not deleted, and its note travels back to the
   drafting screen. Once every item has an approved draft, the meeting advances
   to summary_reviewed (handled in the seam).
   ========================================================================== */

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  approveDraft,
  getAgendaItems,
  getDraftsForItems,
  getMeeting,
  rejectDraft,
  reviewTypeFor,
  COVERAGE_LABEL,
} from "@/src/curation/workspace";
import type {
  AgendaItemRow,
  MeetingRow,
  SummaryDraftRow,
} from "@/src/curation/types";
import styles from "../workspace.module.css";
import { StatusPill } from "../StatusPill";

export default function ReviewPage() {
  return (
    <Suspense fallback={<p className={styles.empty}>Loading.</p>}>
      <ReviewScreen />
    </Suspense>
  );
}

function ReviewScreen() {
  const meetingId = useSearchParams().get("meeting") ?? "";
  const [meeting, setMeeting] = useState<MeetingRow | null>(null);
  const [items, setItems] = useState<AgendaItemRow[]>([]);
  const [drafts, setDrafts] = useState<SummaryDraftRow[]>([]);
  const [reviewerName, setReviewerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!meetingId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const m = await getMeeting(meetingId);
      setMeeting(m);
      const its = await getAgendaItems(meetingId);
      setItems(its);
      setDrafts(await getDraftsForItems(its.map((i) => i.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this meeting.");
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!meetingId) {
    return (
      <p className={styles.empty}>
        No meeting was chosen. Open one from the{" "}
        <Link href="/workspace">coverage ledger</Link>.
      </p>
    );
  }
  if (loading) return <p className={styles.empty}>Loading the meeting.</p>;
  if (error)
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  if (!meeting)
    return <p className={styles.empty}>That meeting could not be found.</p>;

  const itemById = new Map(items.map((i) => [i.id, i]));
  const pending = drafts.filter((d) => d.status === "pending_review");

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>
          <Link href="/workspace">Coverage ledger</Link> · Review
        </p>
        <h1 className={styles.title}>{meeting.title}</h1>
        <div className={styles.rowActions}>
          <StatusPill
            status={meeting.coverage_status}
            label={COVERAGE_LABEL[meeting.coverage_status]}
          />
          <Link
            href={`/workspace/draft?meeting=${meeting.id}`}
            className={styles.smallLink}
          >
            Go to drafting
          </Link>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.field}>
          <span className={styles.label}>Your name</span>
          <span className={styles.hint}>
            Confirm your name before you approve. It sets whether an approval is
            recorded as a self review or an independent one.
          </span>
          <input
            className={styles.input}
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
          />
        </label>
      </div>

      {pending.length === 0 ? (
        <p className={styles.notice} role="status">
          No drafts are waiting for review on this meeting.
        </p>
      ) : null}

      {pending.map((draft) => {
        const item = draft.agenda_item_id
          ? itemById.get(draft.agenda_item_id)
          : undefined;
        return (
          <ReviewItem
            key={draft.id}
            draft={draft}
            source={item?.raw_source_text ?? null}
            itemTitle={item?.title ?? "Agenda item"}
            meetingId={meeting.id}
            reviewerName={reviewerName}
            onDone={load}
          />
        );
      })}
    </>
  );
}

function ReviewItem({
  draft,
  source,
  itemTitle,
  meetingId,
  reviewerName,
  onDone,
}: {
  draft: SummaryDraftRow;
  source: string | null;
  itemTitle: string;
  meetingId: string;
  reviewerName: string;
  onDone: () => Promise<void>;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const nameReady = reviewerName.trim().length > 0;
  const reviewType = nameReady
    ? reviewTypeFor(draft.drafter_name, reviewerName)
    : null;

  async function onApprove() {
    if (!nameReady) return;
    setWorking(true);
    setErr(null);
    try {
      await approveDraft({
        draftId: draft.id,
        meetingId,
        drafterName: draft.drafter_name,
        reviewerName,
        reviewedAtIso: new Date().toISOString(),
      });
      await onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not approve the draft.");
      setWorking(false);
    }
  }

  async function onReject() {
    if (!note.trim()) return;
    setWorking(true);
    setErr(null);
    try {
      await rejectDraft({ draftId: draft.id, meetingId, note });
      await onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not reject the draft.");
      setWorking(false);
    }
  }

  return (
    <div className={styles.item}>
      <p className={styles.itemTitle}>{itemTitle}</p>

      <div className={styles.compare}>
        <div className={styles.compareCol}>
          <p className={styles.sourceLabel}>From the record</p>
          <pre className={styles.source}>
            {source?.trim() || "No source text was submitted."}
          </pre>
        </div>
        <div className={styles.compareCol}>
          <p className={styles.draftLabel}>Draft summary</p>
          <p className={styles.draftText}>
            {draft.draft_text?.trim() || "(empty draft)"}
          </p>
          <p className={styles.byline}>
            Drafted by {draft.drafter_name?.trim() || "an unnamed drafter"}
          </p>
        </div>
      </div>

      {reviewType ? (
        <p className={styles.byline}>
          Approving now is recorded as{" "}
          {reviewType === "self"
            ? "a self review, because your name matches the drafter's."
            : "an independent review, because your name differs from the drafter's."}
        </p>
      ) : (
        <p className={styles.byline}>
          Add your name above to approve.
        </p>
      )}

      {err ? (
        <p className={styles.error} role="alert">
          {err}
        </p>
      ) : null}

      {rejecting ? (
        <div className={styles.rejectBox}>
          <label className={styles.field}>
            <span className={styles.draftLabel}>Note back to the drafter</span>
            <textarea
              className={styles.textarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className={styles.rowActions}>
            <button
              className={styles.reject}
              type="button"
              onClick={onReject}
              disabled={working || !note.trim()}
            >
              {working ? "Sending back" : "Send back with this note"}
            </button>
            <button
              className={styles.ghost}
              type="button"
              style={{ color: "var(--mut)", borderColor: "var(--line)" }}
              onClick={() => setRejecting(false)}
              disabled={working}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.rowActions} style={{ marginTop: 12 }}>
          <button
            className={styles.primary}
            type="button"
            onClick={onApprove}
            disabled={working || !nameReady}
          >
            {working ? "Approving" : "Approve"}
          </button>
          <button
            className={styles.reject}
            type="button"
            onClick={() => setRejecting(true)}
            disabled={working}
          >
            Reject with a note
          </button>
        </div>
      )}
    </div>
  );
}
