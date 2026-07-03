"use client";

/* ============================================================================
   SourceMarker + SourcePanel — "From the record" (Phase 3).
   ----------------------------------------------------------------------------
   Every content item carries a `source`. The marker is the quiet, tappable
   "From the record" chip (or the honey "Happening" variant); tapping it opens
   the "Where this comes from" panel built from that source: the Source label,
   the Dated row, the "Drafted" row when the item was software-drafted, and the
   Checked row. When a source is `selfReviewed`, the Checked row is replaced by
   an honest "Reviewed" row: reviewed by the same person who drafted it, with
   independent review coming as the team grows. From the panel a resident can
   view the original, open How this works, or flag a specific point that looks
   wrong.

   Coordination lives in the shell (useAppShell): opening one panel closes any
   other, Escape closes, and an outside click closes. aria-expanded on the chip
   tracks the open state.

   The generic marker (no specific label) reads "{town} public record" from the
   data seam, never a hardcoded town.
   ========================================================================== */

import { useId, useState } from "react";
import Link from "next/link";
import type { Source } from "@/data/towns/schema";
import { town } from "@/src/town";
import { FLAG_ENDPOINT } from "@/src/config";
import { useAppShell } from "./AppShell";
import {
  IconChevronDown,
  IconCheck,
  IconClock,
  IconDoc,
  IconExternal,
  IconInfo,
} from "./icons";

interface SourceMarkerProps {
  source: Source;
  /** Honey "Happening" variant instead of the moss "From the record" chip. */
  happening?: boolean;
  /** Adds the "Drafted" row to the panel (software-drafted summaries). */
  drafted?: boolean;
  /** The item text, split into points for the flag flow. */
  text?: string;
}

/** Split a blob of text into flaggable points (sentence-ish), like the reference. */
function toPoints(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
    .slice(0, 6);
  return parts.length ? parts : ["The information shown for this item."];
}

export default function SourceMarker({
  source,
  happening,
  drafted,
  text,
}: SourceMarkerProps) {
  const id = useId();
  const { openSourceId, setOpenSourceId, openHow, showToast } = useAppShell();
  const open = openSourceId === id;

  const label = source.label || `${town.town.name} public record`;

  return (
    <>
      <button
        className={happening ? "prov happening" : "prov"}
        aria-expanded={open}
        aria-label="Where this comes from"
        onClick={(e) => {
          e.stopPropagation();
          setOpenSourceId(open ? null : id);
        }}
      >
        {happening ? <IconClock /> : <IconCheck />}
        <span className="provtxt">{happening ? "Happening" : "From the record"}</span>
        <IconChevronDown />
      </button>

      {!source.real && <span className="sample">Sample</span>}

      {open && (
        <SourcePanel
          label={label}
          date={source.date}
          drafted={!!drafted}
          selfReviewed={!!source.selfReviewed}
          text={text ?? ""}
          onViewOriginal={() => showToast("Opens the official source")}
          onHow={() => {
            setOpenSourceId(null);
            openHow();
          }}
          onFlagged={() => showToast("Sent for checking against the source")}
        />
      )}
    </>
  );
}

/* --- the panel (with the point-level flag flow) --------------------------- */

type FlagState =
  | { mode: "panel" }
  | { mode: "points" }
  | { mode: "picked"; index: number }
  | { mode: "sent" };

/** Build the source line and page path sent to the flag function. */
function flagContext(label: string, date: string) {
  return {
    source: date ? `${label} · ${date}` : label,
    page: typeof window !== "undefined" ? window.location.pathname : "",
  };
}

function SourcePanel({
  label,
  date,
  drafted,
  selfReviewed,
  text,
  onViewOriginal,
  onHow,
  onFlagged,
}: {
  label: string;
  date: string;
  drafted: boolean;
  selfReviewed: boolean;
  text: string;
  onViewOriginal: () => void;
  onHow: () => void;
  onFlagged: () => void;
}) {
  const [flag, setFlag] = useState<FlagState>({ mode: "panel" });
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const points = toPoints(text);

  // Clicks inside the panel must not bubble to the card or the outside-close
  // handler.
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  // Send the flagged point to the serverless function, which opens a GitHub
  // Issue. On success we show the plain confirmation. On failure we say so
  // honestly and let the resident try again; we never fake a success.
  async function submit(index: number) {
    setSending(true);
    setError(null);
    try {
      if (!FLAG_ENDPOINT) throw new Error("not-configured");
      const { source, page } = flagContext(label, date);
      const res = await fetch(FLAG_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: points[index],
          detail: note.trim(),
          source,
          page,
        }),
      });
      if (!res.ok) throw new Error("bad-status");
      setFlag({ mode: "sent" });
      onFlagged();
    } catch {
      setError(
        "Something went wrong, and nothing was sent. Please try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  }

  if (flag.mode === "points") {
    return (
      <div className="srcpanel" onClick={stop}>
        <div className="ff-title">Which point looks wrong?</div>
        <div className="ff-sub">
          Pick the specific point. We check it against the source document. The
          document decides, and both outcomes are logged publicly.
        </div>
        <div className="ff-points">
          {points.map((p, i) => (
            <button
              key={i}
              className="ff-pt"
              onClick={() => setFlag({ mode: "picked", index: i })}
            >
              <span className="n">{i + 1}</span>
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (flag.mode === "picked") {
    return (
      <div className="srcpanel" onClick={stop}>
        <div className="ff-title">Point {flag.index + 1}: tell us what looks wrong</div>
        <div className="ff-chosen">{points[flag.index]}</div>
        <div className="ff-srcref">
          <IconDoc />
          <span>
            This point comes from: <b>{label}</b>
            {date ? ` · ${date}` : ""}. If you can, check it there first. The
            document is what decides.
          </span>
        </div>
        <textarea
          className="ff-ta"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What doesn't match? (e.g., the vote count, a name, a date)"
        />
        {error && (
          <div className="ff-sub" style={{ color: "var(--rust)" }} role="alert">
            {error}
          </div>
        )}
        <div className="ff-actions">
          <button
            className="sp-act primary"
            disabled={sending}
            onClick={() => submit(flag.index)}
          >
            {sending ? "Sending…" : "Send for checking"}
          </button>
          <button
            className="sp-act"
            disabled={sending}
            onClick={() => {
              setError(null);
              setFlag({ mode: "panel" });
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (flag.mode === "sent") {
    return (
      <div className="srcpanel" onClick={stop}>
        <div className="ff-done">
          <IconCheck />
          <p>
            <b>Sent. Someone will check this against the source.</b> If it
            doesn&apos;t match, we correct it. If it does, it stands. Either way
            the outcome is logged in the{" "}
            <Link href="/verification-log">verification log</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="srcpanel" onClick={stop}>
      <div className="sp-head">
        <IconDoc />
        Where this comes from
      </div>
      <div className="sp-body">
        <div className="sp-row">
          <span className="sp-k">Source</span>
          <span className="sp-v">
            <b>{label}</b>
          </span>
        </div>
        {date && (
          <div className="sp-row">
            <span className="sp-k">Dated</span>
            <span className="sp-v">{date}</span>
          </div>
        )}
        {drafted && (
          <div className="sp-row">
            <span className="sp-k">Drafted</span>
            <span className="sp-v">
              Plain-language summary, drafted by software from this document
              under fixed rules.
            </span>
          </div>
        )}
        {selfReviewed ? (
          <div className="sp-row">
            <span className="sp-k">Reviewed</span>
            <span className="sp-v">
              Reviewed by the same person who drafted it. Independent review is
              coming as the team grows.
            </span>
          </div>
        ) : (
          <div className="sp-row">
            <span className="sp-k">Checked</span>
            <span className="sp-v">
              <span className="sp-ok">
                <IconCheck />
                A person checked this against the source
              </span>
            </span>
          </div>
        )}
      </div>
      <div className="sp-actions">
        <button className="sp-act primary" onClick={onViewOriginal}>
          <IconExternal />
          View original
        </button>
        <button className="sp-act" onClick={onHow}>
          <IconInfo />
          How this works
        </button>
        <button className="sp-act flag" onClick={() => setFlag({ mode: "points" })}>
          Something look wrong?
        </button>
      </div>
    </div>
  );
}
