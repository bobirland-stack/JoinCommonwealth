"use client";

/* ============================================================================
   Publish screen (Stage A, Task 3, Part 1).
   ----------------------------------------------------------------------------
   The one action that turns approved, reviewed content into a real, published
   entry in data/towns/clawson.json, the same file the whole live app reads
   from. Nothing before this step is visible to a resident.

   This screen is only useful for a meeting whose coverage_status is
   summary_reviewed. It shows exactly what is about to be published: the meeting,
   its approved items, and for each item whether its review was independent or a
   self review, labeled plainly so the curator sees it before committing, not
   after. One button publishes.

   Publishing commits the built objects to clawson.json on a new branch and opens
   a small pull request (through the publish worker, which holds the GitHub
   token). Only after that commit genuinely succeeds does the meeting move to
   published in Supabase. If anything fails partway, nothing is marked published
   and the curator sees a clear, honest error.

   The meeting id rides in the ?meeting= query string, the same as the drafting
   and review screens: a static export cannot prerender a route with a live id
   in its path, so the id is read at runtime, which useSearchParams needs a
   Suspense boundary for.
   ========================================================================== */

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMeeting, COVERAGE_LABEL } from "@/src/curation/workspace";
import {
  getPublishPreview,
  markMeetingPublished,
  type BuiltPublish,
} from "@/src/curation/publish";
import type { MeetingRow } from "@/src/curation/types";
import { PUBLISH_ENDPOINT } from "@/src/config";
import { niceDate } from "@/src/lib/dates";
import styles from "../workspace.module.css";
import { StatusPill } from "../StatusPill";

export default function PublishPage() {
  return (
    <Suspense fallback={<p className={styles.empty}>Loading.</p>}>
      <PublishScreen />
    </Suspense>
  );
}

type Result =
  | { kind: "published"; url: string }
  | { kind: "error"; message: string };

function PublishScreen() {
  const meetingId = useSearchParams().get("meeting") ?? "";
  const [meeting, setMeeting] = useState<MeetingRow | null>(null);
  const [built, setBuilt] = useState<BuiltPublish | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const load = useCallback(async () => {
    if (!meetingId) {
      setLoading(false);
      return;
    }
    setLoadError(null);
    try {
      const preview = await getPublishPreview(meetingId);
      if (!preview) {
        setMeeting(null);
        setBuilt(null);
      } else {
        setMeeting(preview.meeting);
        setBuilt(preview.built);
      }
    } catch (e) {
      // A meeting that is not ready (or already published) still loads its row
      // so we can show the header; the reason rides in loadError.
      setMeeting(await getMeeting(meetingId).catch(() => null));
      setBuilt(null);
      setLoadError(
        e instanceof Error ? e.message : "Could not prepare this meeting.",
      );
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onPublish() {
    if (!built || !meeting) return;
    if (!PUBLISH_ENDPOINT) return;
    setWorking(true);
    setResult(null);

    // 1. Commit clawson.json and open the pull request. This is the real work;
    //    if it does not return ok, nothing is marked published.
    let prUrl: string;
    try {
      const res = await fetch(PUBLISH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "meeting",
          meeting: built.meeting,
          commitTitle: built.commitTitle,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !data?.url) {
        throw new Error(
          data?.error ||
            "The publish could not be committed, and nothing was published.",
        );
      }
      prUrl = data.url;
    } catch (e) {
      setWorking(false);
      setResult({
        kind: "error",
        message:
          e instanceof Error
            ? e.message
            : "The publish could not be committed, and nothing was published.",
      });
      return;
    }

    // 2. Only now, after the commit genuinely succeeded, move the meeting to
    //    published. If this last step fails, the record is already committed;
    //    we say so honestly and point at the pull request.
    try {
      await markMeetingPublished(meeting.id);
    } catch {
      setWorking(false);
      setResult({
        kind: "error",
        message:
          "The record was committed and its pull request is open, but the " +
          "meeting could not be marked published in the ledger. Open the pull " +
          `request to confirm, then set it by hand if needed: ${prUrl}`,
      });
      return;
    }

    setWorking(false);
    setResult({ kind: "published", url: prUrl });
  }

  if (!meetingId) {
    return (
      <p className={styles.empty}>
        No meeting was chosen. Open one from the{" "}
        <Link href="/workspace">coverage ledger</Link>.
      </p>
    );
  }
  if (loading) return <p className={styles.empty}>Loading the meeting.</p>;
  if (!meeting)
    return <p className={styles.empty}>That meeting could not be found.</p>;

  // Published for real: show the pull request and stop.
  if (result?.kind === "published") {
    return (
      <>
        <div className={styles.pageHead}>
          <p className={styles.eyebrow}>
            <Link href="/workspace">Coverage ledger</Link> · Publish
          </p>
          <h1 className={styles.title}>{meeting.title}</h1>
        </div>
        <p className={styles.notice} role="status">
          Published. A pull request is open with this meeting&apos;s record. Once
          a person reviews and merges it, residents see it on the live site.{" "}
          <a href={result.url} target="_blank" rel="noreferrer">
            Open the pull request
          </a>
          .
        </p>
      </>
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>
          <Link href="/workspace">Coverage ledger</Link> · Publish
        </p>
        <h1 className={styles.title}>{meeting.title}</h1>
        <div className={styles.rowActions}>
          <StatusPill
            status={meeting.coverage_status}
            label={COVERAGE_LABEL[meeting.coverage_status]}
          />
          <span className={styles.ledgerMeta}>
            {meeting.body_id}
            {meeting.date ? ` · ${niceDate(meeting.date)}` : ""}
          </span>
        </div>
      </div>

      {loadError ? (
        <p className={styles.notice} role="status">
          {loadError}
        </p>
      ) : null}

      {built ? (
        <>
          <p className={styles.lede}>
            This is exactly what will be published to the public record. Read it
            once more before you commit. Each item shows whether it had an
            independent review or a self review.
          </p>

          {built.reviews.map((r, i) => (
            <div className={styles.item} key={i}>
              <p className={styles.itemTitle}>{r.title}</p>
              <p className={styles.draftText}>{r.summary}</p>
              {r.reviewType === "self" ? (
                <p className={styles.byline}>
                  Self review. Drafted and reviewed by{" "}
                  {r.reviewerName?.trim() || "the same person"}. On the live
                  site this item will say it was reviewed by the same person who
                  drafted it, with independent review coming as the team grows.
                </p>
              ) : (
                <p className={styles.byline}>
                  Independent review. Drafted by{" "}
                  {r.drafterName?.trim() || "an unnamed drafter"}, reviewed by{" "}
                  {r.reviewerName?.trim() || "another person"}. On the live site
                  this item will say a person checked it against the source.
                </p>
              )}
            </div>
          ))}

          {result?.kind === "error" ? (
            <p className={styles.error} role="alert">
              {result.message}
            </p>
          ) : null}

          {PUBLISH_ENDPOINT ? (
            <div className={styles.rowActions} style={{ marginTop: 18 }}>
              <button
                className={styles.primary}
                type="button"
                onClick={onPublish}
                disabled={working}
              >
                {working ? "Publishing" : "Publish this meeting"}
              </button>
            </div>
          ) : (
            <p className={styles.notice} role="status" style={{ marginTop: 18 }}>
              The publish function is not connected yet, so nothing can be
              published from here. Set the publish endpoint in the deploy
              settings and redeploy. Until then, the meeting stays reviewed and
              safe.
            </p>
          )}
        </>
      ) : null}
    </>
  );
}
