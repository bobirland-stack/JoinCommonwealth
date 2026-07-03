"use client";

/* ============================================================================
   Scout submission form (Stage A, Task 2, Part 1 and Part 2).
   ----------------------------------------------------------------------------
   A scout picks a meeting and sends in what they gathered: agenda text, minutes
   text, a recording link, and their name. Agenda and minutes are each optional
   on their own, so a scout can send the agenda before the meeting and the
   minutes after. Saving writes the material to the meeting's source item and
   advances its coverage_status, then opens a GitHub Issue to tell the curator
   team, reusing the same serverless pattern as the Phase 7 flag flow.

   If the notify function is not deployed yet, the submission still saves. We
   just say plainly that no notice was sent, rather than pretending one was.
   ========================================================================== */

import { useEffect, useState } from "react";
import { listMeetings, submitScoutMaterial } from "@/src/curation/workspace";
import type { MeetingRow } from "@/src/curation/types";
import { niceDate } from "@/src/lib/dates";
import { SUBMISSION_ENDPOINT } from "@/src/config";
import styles from "../workspace.module.css";

type Notice =
  | { kind: "saved_and_sent" }
  | { kind: "saved_not_sent" }
  | { kind: "error"; message: string };

export default function SubmitPage() {
  const [meetings, setMeetings] = useState<MeetingRow[] | null>(null);
  const [meetingId, setMeetingId] = useState("");
  const [agenda, setAgenda] = useState("");
  const [minutes, setMinutes] = useState("");
  const [recording, setRecording] = useState("");
  const [name, setName] = useState("");
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    listMeetings()
      .then((rows) => setMeetings(rows))
      .catch((e: unknown) =>
        setLoadError(
          e instanceof Error ? e.message : "Could not load meetings.",
        ),
      );
  }, []);

  const hasContent =
    agenda.trim().length > 0 ||
    minutes.trim().length > 0 ||
    recording.trim().length > 0;
  const canSubmit =
    meetingId.length > 0 && name.trim().length > 0 && hasContent && !working;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setWorking(true);
    setNotice(null);

    let meeting: MeetingRow;
    try {
      meeting = await submitScoutMaterial({
        meetingId,
        agendaText: agenda,
        minutesText: minutes,
        recordingLink: recording,
        submittedBy: name,
      });
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

    // The material is saved. Now try to notify the curator team. A failure to
    // notify does not undo the save; the ledger already reflects it.
    let sent = false;
    if (SUBMISSION_ENDPOINT) {
      try {
        const res = await fetch(SUBMISSION_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meeting: meeting.title,
            submittedBy: name.trim(),
            hasAgenda: agenda.trim().length > 0,
            hasMinutes: minutes.trim().length > 0,
            recording: recording.trim(),
          }),
        });
        sent = res.ok;
      } catch {
        sent = false;
      }
    }

    setWorking(false);
    setNotice(sent ? { kind: "saved_and_sent" } : { kind: "saved_not_sent" });
    // Clear the material so the same submission is not sent twice. Keep the
    // meeting and name, since a scout often sends minutes right after agenda.
    setAgenda("");
    setMinutes("");
    setRecording("");
    // Reflect the advanced status in the picker without a full reload.
    setMeetings((prev) =>
      prev
        ? prev.map((m) =>
            m.id === meeting.id
              ? { ...m, coverage_status: meeting.coverage_status }
              : m,
          )
        : prev,
    );
  }

  return (
    <>
      <div className={styles.pageHead}>
        <p className={styles.eyebrow}>Curation workspace</p>
        <h1 className={styles.title}>Submit material</h1>
        <p className={styles.lede}>
          Send in what you gathered for a meeting. You can send the agenda before
          the meeting and the minutes after. Anything you leave blank is left as
          it was.
        </p>
      </div>

      {loadError ? (
        <p className={styles.error} role="alert">
          {loadError}
        </p>
      ) : null}

      {notice?.kind === "saved_and_sent" ? (
        <p className={styles.notice} role="status">
          Saved. The curator team has been notified.
        </p>
      ) : null}
      {notice?.kind === "saved_not_sent" ? (
        <p className={styles.notice} role="status">
          Saved to the ledger. No notice was sent, because the notify function is
          not connected yet. The submission is safe either way.
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
            <span className={styles.label}>Which meeting</span>
            <select
              className={styles.select}
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              required
            >
              <option value="">Pick a meeting</option>
              {(meetings ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                  {m.date ? ` · ${niceDate(m.date)}` : ""}
                </option>
              ))}
            </select>
            {meetings !== null && meetings.length === 0 ? (
              <p className={styles.hint}>
                There are no meetings yet. An admin adds them in Supabase.
              </p>
            ) : null}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Agenda text</span>
            <span className={styles.hint}>
              Optional. Paste the agenda as it was posted.
            </span>
            <textarea
              className={styles.textarea}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Minutes text</span>
            <span className={styles.hint}>
              Optional. Paste the minutes once they are out.
            </span>
            <textarea
              className={styles.textarea}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Recording link</span>
            <span className={styles.hint}>Optional. A link to the video.</span>
            <input
              className={styles.input}
              type="url"
              placeholder="https://"
              value={recording}
              onChange={(e) => setRecording(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Your name</span>
            <span className={styles.hint}>
              So we can record who sent this in.
            </span>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <button className={styles.primary} type="submit" disabled={!canSubmit}>
            {working ? "Sending" : "Send submission"}
          </button>
          {!hasContent ? (
            <p className={styles.hint}>
              Add an agenda, minutes, or a recording link before sending.
            </p>
          ) : null}
        </form>
      </div>
    </>
  );
}
