"use client";

/* ============================================================================
   Thread + VideoTimestamp — the followed-closely timeline (Phase 3).
   ----------------------------------------------------------------------------
   A thread is the unit a resident follows: one issue tracked across meetings.
   The card shows the title and follow button, a status line, a plain-language
   summary with its source marker, then a dated timeline. Each step names the
   body, the date, and what happened; a step with a recorded vote shows the
   roll call with yes votes in moss and no votes in rust.

   The video-timestamp chip is illustrative in V1: tapping it shows a toast
   saying video links arrive later, exactly as the reference treats it. We do
   not fake a working deep link.
   ========================================================================== */

import type { Thread as ThreadType } from "@/data/towns/schema";
import { bodyById } from "@/src/town";
import { niceDate } from "@/src/lib/dates";
import { useAppShell } from "./AppShell";
import SourceMarker from "./SourceMarker";
import FollowButton from "./FollowButton";
import { IconPlay } from "./icons";

function VideoTimestamp({ stamp }: { stamp: string }) {
  const { showToast } = useAppShell();
  return (
    <button
      className="vts"
      onClick={() => showToast("Video links arrive in a later update.")}
    >
      <IconPlay />
      in the video: {stamp}
    </button>
  );
}

export default function Thread({ thread }: { thread: ThreadType }) {
  const steps = thread.timeline;
  const firstSource = steps[0]?.source;

  return (
    <div className="thread">
      <div className="th-top">
        <h3>{thread.title}</h3>
        <FollowButton topic={thread.topic} />
      </div>
      <div className="status">{thread.status}</div>
      <div className="th-sum">{thread.summary}</div>
      {firstSource && (
        <div className="th-src">
          <SourceMarker source={firstSource} drafted text={thread.summary} />
        </div>
      )}
      <div className="timeline">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          const isDeny = /denies|denied/i.test(step.event);
          const cls = last ? "tstep now" : isDeny ? "tstep deny" : "tstep";
          return (
            <div className={cls} key={i}>
              <div className="tbody">{bodyById(step.body)?.name ?? ""}</div>
              <div className="td">{niceDate(step.date)}</div>
              <div className="te">{step.event}</div>
              {step.vote && (
                <div className="vote">
                  <div className="vh">{step.vote.result}</div>
                  <div className="roll">
                    {step.vote.roll.map((r, j) => (
                      <span
                        key={j}
                        className={r.vote === "yes" ? "rc yes" : "rc no"}
                      >
                        {r.name}: {r.vote}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="src">
                {step.source.label}
                {step.videoTimestamp && (
                  <VideoTimestamp stamp={step.videoTimestamp} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
