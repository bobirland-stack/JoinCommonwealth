"use client";

/* ============================================================================
   HappeningView — List / Calendar views of the town calendar (Phase 8).
   ----------------------------------------------------------------------------
   Two views of the SAME data (town.events), never a second data model:

     - List: every event, sorted by date, each an event row (the Phase 4 view).
     - Calendar: the current month as a grid, one marker per day with an event,
       today highlighted. Tapping a day shows that day's events using the same
       event row styling.

   A small segmented toggle at the top switches between them and remembers the
   choice for the session (component state; no cross-visit persistence needed).
   The two toggle controls are buttons, so they are keyboard reachable and
   operable with Enter or Space.

   Dates are compared as plain "YYYY-MM-DD" strings (as everywhere in the app).
   The current month and today's highlight read the client clock in an effect
   after mount, so the statically prerendered page (which shows the List view
   first) never depends on the render-time date.
   ========================================================================== */

import { useEffect, useMemo, useState } from "react";
import type { CivicEvent } from "@/data/towns/schema";
import { town, bodyById } from "@/src/town";
import { monthAbbr, dayNum } from "@/src/lib/dates";
import FollowButton from "@/src/components/FollowButton";

type View = "list" | "calendar";

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Zero-padded "YYYY-MM-DD" for a year, 0-indexed month, and day. */
function isoOf(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** One shared event row — the Phase 4 list row, reused by both views. */
function EventRow({ e }: { e: CivicEvent }) {
  const topic = e.body ? bodyById(e.body)?.topic : undefined;
  return (
    <div className="calday">
      <div className="cd">
        <div className="mo">{monthAbbr(e.date)}</div>
        <div className="dy">{dayNum(e.date)}</div>
      </div>
      <div className="ce">
        <h4>{e.title}</h4>
        <div className="cm">
          {e.time && <span>{e.time}</span>}
          {e.location && <span>{e.location}</span>}
        </div>
        {e.note && <div className="cnote">{e.note}</div>}
        <div className="cmeta">
          {topic && <FollowButton topic={topic} />}
          {/* plain source line — not the full marker (reference choice) */}
          <span className="csrc">{e.source.label}</span>
          {!e.source.real && <span className="sample">Sample</span>}
        </div>
      </div>
    </div>
  );
}

export default function HappeningView() {
  const [view, setView] = useState<View>("list");

  // Current month cursor + today, read from the client clock after mount.
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [today, setToday] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
    setToday(isoOf(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  // List view: a copy sorted ascending (string compare is date-correct here).
  const listed = useMemo(
    () => [...town.events].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [],
  );

  // Events grouped by their ISO date, for the calendar markers and day panel.
  const byDate = useMemo(() => {
    const map = new Map<string, CivicEvent[]>();
    for (const e of town.events) {
      const rows = map.get(e.date) ?? [];
      rows.push(e);
      map.set(e.date, rows);
    }
    return map;
  }, []);

  function stepMonth(delta: number) {
    setSelected(null);
    setCursor((c) => {
      if (!c) return c;
      const next = c.m + delta;
      const y = c.y + Math.floor(next / 12);
      const m = ((next % 12) + 12) % 12;
      return { y, m };
    });
  }

  const selectedEvents = selected ? byDate.get(selected) ?? [] : [];

  return (
    <>
      {/* view toggle — two buttons, keyboard reachable and operable */}
      <div className="viewtoggle" role="group" aria-label="Choose calendar view">
        <button
          type="button"
          className={view === "list" ? "on" : ""}
          aria-pressed={view === "list"}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          type="button"
          className={view === "calendar" ? "on" : ""}
          aria-pressed={view === "calendar"}
          onClick={() => setView("calendar")}
        >
          Calendar
        </button>
      </div>

      {view === "list" && (
        <div>
          {listed.map((e) => (
            <EventRow key={e.id} e={e} />
          ))}
        </div>
      )}

      {view === "calendar" && cursor && (
        <div className="cal">
          <div className="calhead">
            <button
              type="button"
              className="calnav"
              aria-label="Previous month"
              onClick={() => stepMonth(-1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <div className="calmonth" aria-live="polite">
              {FULL_MONTHS[cursor.m]} {cursor.y}
            </div>
            <button
              type="button"
              className="calnav"
              aria-label="Next month"
              onClick={() => stepMonth(1)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <div className="caldow" aria-hidden="true">
            {DOW.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="calgrid">
            {(() => {
              const first = new Date(cursor.y, cursor.m, 1).getDay();
              const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
              const cells = [];
              for (let i = 0; i < first; i++) {
                cells.push(<span className="calpad" key={`p${i}`} />);
              }
              for (let d = 1; d <= days; d++) {
                const iso = isoOf(cursor.y, cursor.m, d);
                const has = byDate.has(iso);
                const classes = ["calcell"];
                if (iso === today) classes.push("today");
                if (iso === selected) classes.push("sel");
                cells.push(
                  <button
                    type="button"
                    key={iso}
                    className={classes.join(" ")}
                    aria-pressed={iso === selected}
                    aria-label={`${FULL_MONTHS[cursor.m]} ${d}${
                      has ? `, ${byDate.get(iso)!.length} event${byDate.get(iso)!.length > 1 ? "s" : ""}` : ""
                    }`}
                    onClick={() => setSelected(iso)}
                  >
                    <span className="cn">{d}</span>
                    {has && <span className="caldot" aria-hidden="true" />}
                  </button>,
                );
              }
              return cells;
            })()}
          </div>

          <div className="calsel">
            {selected ? (
              selectedEvents.length > 0 ? (
                selectedEvents.map((e) => <EventRow key={e.id} e={e} />)
              ) : (
                <div className="calnote">Nothing on the calendar for this day.</div>
              )
            ) : (
              <div className="calnote">Tap a day with a marker to see what&apos;s happening.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
