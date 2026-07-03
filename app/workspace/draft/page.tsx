"use client";

/* ============================================================================
   Drafting screen (Stage A, Task 2, Part 4).
   ----------------------------------------------------------------------------
   For one meeting, list its agenda items. For each item that has no approved
   summary yet, show the raw source text and a box to write a plain-language
   summary. Saving writes a pending_review draft by a person; once every item
   has a draft waiting, the meeting advances to summary_drafted (handled in the
   seam, from the drafts themselves).

   The meeting id comes from the ?meeting= query string. On a static export a
   route with a live id in the path cannot be prerendered, so the id rides in
   the query string, and this page reads it at runtime. useSearchParams needs a
   Suspense boundary, which the default export provides.
   ========================================================================== */

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getAgendaItems,
  getDraftsForItems,
  getMeeting,
  itemState,
  saveDraft,
  COVERAGE_LABEL,
} from "@/src/curation/workspace";
import type {
  AgendaItemRow,
  MeetingRow,
  SummaryDraftRow,
} from "@/src/curation/types";
import styles from "../workspace.module.css";
import { StatusPill } from "../StatusPill";

export default function DraftPage() {
  return (
    <Suspense fallback={<p className={styles.empty}>Loading.</p>}>
      <DraftScreen />
    </Suspense>
  );
}

function DraftScreen() {
  const meetingId = useSearchParams().get("meeting") ?? "";
  const [meeting, setMeeting] = useState<MeetingRow | null>(null);
  const [items, setItems] = useState<AgendaItemRow[]>([]);
  const [drafts, setDrafts] = useState<SummaryDraftRow[]>([]);
  const [drafterName, setDrafterName] = useState("");
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

  const draftsFor = (itemId: string) =>
    drafts.filter((d) => d.agenda_item_id === itemId);
  const open = items.filter((i) => itemState(draftsFor(i.id)) !== "approved");
  const approvedCount = items.length - open.length;

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>
          <Link href="/workspace">Coverage ledger</Link> · Draft
        </p>
        <h1 className={styles.title}>{meeting.title}</h1>
        <div className={styles.rowActions}>
          <StatusPill
            status={meeting.coverage_status}
            label={COVERAGE_LABEL[meeting.coverage_status]}
          />
          <Link
            href={`/workspace/review?meeting=${meeting.id}`}
            className={styles.smallLink}
          >
            Go to review
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>
          There is nothing to draft yet. This meeting has no source material.
        </p>
      ) : null}

      {open.length === 0 && items.length > 0 ? (
        <p className={styles.notice} role="status">
          Every item on this meeting has an approved summary. There is nothing
          left to draft.
        </p>
      ) : null}

      {approvedCount > 0 && open.length > 0 ? (
        <p className={styles.hint} style={{ marginBottom: 12 }}>
          {approvedCount} of {items.length} items are approved already.
        </p>
      ) : null}

      <div className={styles.field}>
        <label className={styles.field}>
          <span className={styles.label}>Your name</span>
          <span className={styles.hint}>
            Recorded as the drafter on each summary you save.
          </span>
          <input
            className={styles.input}
            type="text"
            value={drafterName}
            onChange={(e) => setDrafterName(e.target.value)}
          />
        </label>
      </div>

      {open.map((item) => (
        <DraftItem
          key={item.id}
          item={item}
          drafts={draftsFor(item.id)}
          meetingId={meeting.id}
          drafterName={drafterName}
          onSaved={load}
        />
      ))}
    </>
  );
}

function DraftItem({
  item,
  drafts,
  meetingId,
  drafterName,
  onSaved,
}: {
  item: AgendaItemRow;
  drafts: SummaryDraftRow[];
  meetingId: string;
  drafterName: string;
  onSaved: () => Promise<void>;
}) {
  const state = itemState(drafts);
  const [text, setText] = useState("");
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // The newest draft, so a rejection note or a pending draft can be shown.
  const newest = [...drafts].sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  )[0];

  async function onSave() {
    if (!text.trim() || !drafterName.trim()) return;
    setWorking(true);
    setErr(null);
    try {
      await saveDraft({
        agendaItemId: item.id,
        meetingId,
        draftText: text,
        drafterName,
      });
      setText("");
      await onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save the draft.");
      setWorking(false);
    }
  }

  return (
    <div className={styles.item}>
      <p className={styles.itemTitle}>{item.title}</p>

      <p className={styles.sourceLabel}>From the record</p>
      <pre className={styles.source}>
        {item.raw_source_text?.trim() || "No source text was submitted."}
      </pre>

      {state === "pending" ? (
        <div style={{ marginTop: 12 }}>
          <p className={styles.waiting} role="status">
            A draft is written and waiting for review.
          </p>
          {newest?.draft_text ? (
            <>
              <p className={styles.draftLabel} style={{ marginTop: 12 }}>
                Draft waiting
              </p>
              <p className={styles.draftText}>{newest.draft_text}</p>
            </>
          ) : null}
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {state === "needs_draft" && newest?.status === "rejected" ? (
            <p className={styles.rejected}>
              A reviewer sent this back. Note:{" "}
              {newest.rejection_note?.trim() || "(no note left)"}
            </p>
          ) : null}
          <label className={styles.field}>
            <span className={styles.draftLabel}>Write a plain summary</span>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          {err ? (
            <p className={styles.error} role="alert">
              {err}
            </p>
          ) : null}
          <div className={styles.rowActions} style={{ marginTop: 10 }}>
            <button
              className={styles.primary}
              type="button"
              onClick={onSave}
              disabled={working || !text.trim() || !drafterName.trim()}
            >
              {working ? "Saving" : "Save draft"}
            </button>
            {!drafterName.trim() ? (
              <span className={styles.hint}>Add your name above to save.</span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
