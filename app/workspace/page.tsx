"use client";

/* ============================================================================
   Coverage ledger — the workspace home (Stage A, Task 2, Part 3).
   ----------------------------------------------------------------------------
   Every meeting, in one plain list, with its coverage_status shown plainly. It
   is the direct answer to "what's missing": a curator opens this page and sees
   the real state of every meeting at a glance, and where to go next on each.
   ========================================================================== */

import { useEffect, useState } from "react";
import Link from "next/link";
import { listMeetings, COVERAGE_LABEL } from "@/src/curation/workspace";
import type { MeetingRow } from "@/src/curation/types";
import { niceDate } from "@/src/lib/dates";
import styles from "./workspace.module.css";
import { StatusPill } from "./StatusPill";

export default function CoverageLedgerPage() {
  const [meetings, setMeetings] = useState<MeetingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMeetings()
      .then(setMeetings)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Could not load meetings."),
      );
  }, []);

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>Curation workspace</p>
        <h1 className={styles.title}>Coverage ledger</h1>
        <p className={styles.lede}>
          Every meeting the team is covering, and where each one really stands.
        </p>
      </div>

      <div className={styles.rowActions} style={{ marginBottom: 18 }}>
        <Link href="/workspace/submit" className={styles.linkButton}>
          Submit new material
        </Link>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {meetings === null && !error ? (
        <p className={styles.empty}>Loading the ledger.</p>
      ) : null}

      {meetings !== null && meetings.length === 0 ? (
        <div className={styles.panel}>
          <p className={styles.empty} style={{ padding: 0 }}>
            There are no meetings yet. An admin adds meetings in Supabase, and
            they show up here.
          </p>
        </div>
      ) : null}

      {meetings && meetings.length > 0 ? (
        <div className={styles.ledger}>
          {meetings.map((m) => (
            <LedgerRow key={m.id} meeting={m} />
          ))}
        </div>
      ) : null}
    </>
  );
}

function LedgerRow({ meeting }: { meeting: MeetingRow }) {
  const status = meeting.coverage_status;

  // A meeting is draftable once its source is in and before every item is
  // approved. It is reviewable once at least one draft has been written.
  const canDraft =
    status === "agenda_captured" ||
    status === "minutes_captured" ||
    status === "summary_drafted";
  const canReview = status === "summary_drafted" || status === "summary_reviewed";

  const meta = [
    meeting.body_id,
    meeting.date ? niceDate(meeting.date) : "no date set",
  ].join(" · ");

  return (
    <div className={styles.ledgerRow}>
      <div className={styles.ledgerMain}>
        <p className={styles.ledgerTitle}>{meeting.title}</p>
        <span className={styles.ledgerMeta}>{meta}</span>
      </div>
      <StatusPill status={status} label={COVERAGE_LABEL[status]} />
      <div className={styles.ledgerActions}>
        {canDraft ? (
          <Link
            href={`/workspace/draft?meeting=${meeting.id}`}
            className={styles.smallLink}
          >
            Draft
          </Link>
        ) : null}
        {canReview ? (
          <Link
            href={`/workspace/review?meeting=${meeting.id}`}
            className={styles.smallLink}
          >
            Review
          </Link>
        ) : null}
      </div>
    </div>
  );
}
