"use client";

/* ============================================================================
   Verification log entry (Stage A, Task 3, Part 3).
   ----------------------------------------------------------------------------
   The light connection to the verification log, kept as its own small,
   standalone action rather than bundled into the meeting publish. That keeps the
   audit trail "one commit, one meeting" (ADR-002): a meeting publish is one pull
   request, and a verification-log entry is a separate one.

   When a flagged point has been checked against its source, a curator records
   what the document decided here: the claim, whether the recap was corrected or
   stands, the date, and the source that decided it. Recording it does two
   things: it saves a verification_log_entries row in Supabase, and it exports
   the same entry into data/verification-log.json through the publish worker, as
   its own pull request.

   If the publish function is not connected yet, the row still saves. We say
   plainly that it was not exported, rather than pretending a pull request was
   opened.
   ========================================================================== */

import { useState } from "react";
import {
  addVerificationLogEntry,
  buildVerificationEntry,
  type VerificationInput,
} from "@/src/curation/publish";
import type { VerificationOutcome } from "@/src/curation/types";
import { PUBLISH_ENDPOINT } from "@/src/config";
import styles from "../workspace.module.css";

type Notice =
  | { kind: "saved_and_exported"; url: string }
  | { kind: "saved_not_exported" }
  | { kind: "error"; message: string };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function VerifyLogPage() {
  const [claim, setClaim] = useState("");
  const [outcome, setOutcome] = useState<VerificationOutcome>("stands");
  const [dateChecked, setDateChecked] = useState(today());
  const [sourceLabel, setSourceLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const canSubmit =
    claim.trim().length > 0 &&
    dateChecked.trim().length > 0 &&
    sourceLabel.trim().length > 0 &&
    sourceUrl.trim().length > 0 &&
    !working;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setWorking(true);
    setNotice(null);

    const input: VerificationInput = {
      claim,
      outcome,
      dateChecked,
      sourceLabel,
      sourceUrl,
    };

    // 1. Save the row first. It is the true record of the check that happened,
    //    whether or not the export step runs.
    try {
      await addVerificationLogEntry(input);
    } catch (err) {
      setWorking(false);
      setNotice({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong, and nothing was saved. Please try again.",
      });
      return;
    }

    // 2. Export it into the public log, if the publish function is connected.
    if (!PUBLISH_ENDPOINT) {
      setWorking(false);
      setNotice({ kind: "saved_not_exported" });
      clearForm();
      return;
    }
    try {
      const entry = buildVerificationEntry(input);
      const res = await fetch(PUBLISH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "verification",
          entries: [entry],
          commitTitle: `Verification log: ${entry.claim.slice(0, 60)}`,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "The export did not open a pull request.");
      }
      setWorking(false);
      setNotice({ kind: "saved_and_exported", url: data.url });
      clearForm();
    } catch (err) {
      setWorking(false);
      setNotice({
        kind: "error",
        message:
          (err instanceof Error ? err.message : "The export failed.") +
          " The entry is saved in the ledger; only the pull request did not open.",
      });
    }
  }

  function clearForm() {
    setClaim("");
    setSourceLabel("");
    setSourceUrl("");
    setOutcome("stands");
    setDateChecked(today());
  }

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>Curation workspace</p>
        <h1 className={styles.title}>Verification log</h1>
        <p className={styles.lede}>
          Record what happened after a flagged point was checked against its
          source. The document decides. Both outcomes are logged publicly.
        </p>
      </div>

      {notice?.kind === "saved_and_exported" ? (
        <p className={styles.notice} role="status">
          Recorded. A pull request is open to add it to the public log.{" "}
          <a href={notice.url} target="_blank" rel="noreferrer">
            Open the pull request
          </a>
          .
        </p>
      ) : null}
      {notice?.kind === "saved_not_exported" ? (
        <p className={styles.notice} role="status">
          Recorded in the ledger. It was not exported to the public log yet,
          because the publish function is not connected. The entry is safe either
          way.
        </p>
      ) : null}
      {notice?.kind === "error" ? (
        <p className={styles.error} role="alert">
          {notice.message}
        </p>
      ) : null}

      <div className={styles.panel}>
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>The claim that was flagged</span>
            <span className={styles.hint}>
              The specific point, in plain language, as a resident would read it.
            </span>
            <textarea
              className={styles.textarea}
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>What the check found</span>
            <select
              className={styles.select}
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as VerificationOutcome)}
            >
              <option value="stands">
                Stands. The recap matched the source.
              </option>
              <option value="corrected">
                Corrected. The recap did not match, and was fixed.
              </option>
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Date checked</span>
            <input
              className={styles.input}
              type="date"
              value={dateChecked}
              onChange={(e) => setDateChecked(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Source name</span>
            <span className={styles.hint}>
              The document that decided it, e.g. the adopted minutes.
            </span>
            <input
              className={styles.input}
              type="text"
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Source link</span>
            <input
              className={styles.input}
              type="url"
              placeholder="https://"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
            />
          </label>

          <button className={styles.primary} type="submit" disabled={!canSubmit}>
            {working ? "Recording" : "Record and publish to the log"}
          </button>
        </form>
      </div>
    </>
  );
}
