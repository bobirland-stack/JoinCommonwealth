/* ============================================================================
   Your Town — the resident app home tab (Phase 3).
   ----------------------------------------------------------------------------
   The greeting, a feature card drawn from the calendar, the digest feed (each
   entry a sourced card with its follow button), and the showcase thread for
   340 N. Main. Everything reads from the data seam (src/town.ts); nothing is
   hardcoded to Clawson, so the tab reskins for any town.
   ========================================================================== */

import Link from "next/link";
import { town } from "@/src/town";
import { niceDate } from "@/src/lib/dates";
import RecordCard from "@/src/components/RecordCard";
import Thread from "@/src/components/Thread";
import { IconArrow, IconInfo } from "@/src/components/icons";

export default function YourTownPage() {
  const { name, stateAbbr } = town.town;

  // Feature card: the first non-body civic event, else the first event.
  const feature = town.events.find((e) => !e.body) ?? town.events[0];
  const featureWhen = feature
    ? niceDate(feature.date) +
      (feature.time && feature.time !== "All day" ? ` · ${feature.time}` : "")
    : "";

  const thread = town.threads[0];

  return (
    <main className="view">
      <div className="hi">
        {name}, {stateAbbr}
      </div>
      <div className="h1 serif">Your {name}.</div>
      <div className="sub">
        What&apos;s alive in your community right now, and what&apos;s new in the
        parts you keep up with.
      </div>

      {/* feature card, from the calendar */}
      {feature && (
        <div className="feature">
          <div className="fimg">
            <span className="ph">Sample image placeholder</span>
            <div className="houses">
              <span style={{ height: 42 }} />
              <span style={{ height: 60 }} />
              <span style={{ height: 34 }} />
              <span style={{ height: 52 }} />
              <span style={{ height: 40 }} />
            </div>
            <h3>{feature.title}</h3>
          </div>
          <div className="fbody">
            <div className="fl">
              <div className="fwhen">{featureWhen}</div>
            </div>
            <span className="fact">
              Add &amp; remind
              <IconArrow />
            </span>
          </div>
        </div>
      )}

      {/* digest */}
      <div className="section-h">
        <h2>Your digest</h2>
        <span className="ln" />
        <span className="see">{town.digest.length} new</span>
      </div>
      <div className="aihonest">
        <IconInfo />
        <span>
          <b>How this works:</b> every item is drawn from {name}&apos;s public
          record and links back to its source. A person checks every
          plain-language recap before it goes out. Nothing is published on a
          machine&apos;s say-so.
        </span>
      </div>
      {town.digest.map((d) => (
        <RecordCard
          key={d.id}
          source={d.source}
          title={d.title}
          body={d.note}
          topic={d.topic}
          happening={d.tag === "Happening"}
        />
      ))}

      {/* showcase thread */}
      {thread && (
        <>
          <div className="section-h">
            <h2>Followed closely</h2>
            <span className="ln" />
          </div>
          <Thread thread={thread} />
        </>
      )}

      {/* town institutions — a link to the standalone page, not a sixth tab */}
      {town.institutions.length > 0 && (
        <>
          <div className="section-h">
            <h2>Town institutions</h2>
            <span className="ln" />
          </div>
          <Link className="linkrow" href="/institutions">
            <svg className="li" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
            </svg>
            <div className="lt">
              <b>The library, historical society, and more</b>
              <span>
                Follow just the parts you care about, one stream at a time
              </span>
            </div>
            <svg className="ch" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </>
      )}
    </main>
  );
}
