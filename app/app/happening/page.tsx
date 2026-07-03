/* ============================================================================
   Happening — the resident app calendar tab (Phase 4).
   ----------------------------------------------------------------------------
   The town calendar as one list, sorted by date: each row a date chip (month
   abbreviation over the day number), the event title, its time and location,
   and any note. Body events carry a follow button for the body's topic.

   One deliberate difference from every other surface, straight from the
   reference: a calendar row shows a PLAIN source line, not the full tappable
   "From the record" marker. A full marker on every row is heavier than a
   calendar needs. Sample-vs-real labeling still holds — a row whose source is
   not yet a verified fact shows the Sample badge.

   Everything reads through the data seam (src/town.ts); nothing is hardcoded to
   Clawson.
   ========================================================================== */

import { town, bodyById } from "@/src/town";
import { monthAbbr, dayNum } from "@/src/lib/dates";
import FollowButton from "@/src/components/FollowButton";

export default function HappeningPage() {
  // A copy, sorted ascending by ISO date (string compare is date-correct here).
  const events = [...town.events].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <main className="view">
      <div className="hi">Upcoming</div>
      <div className="h1 serif">Happening.</div>
      <div className="sub">
        Meetings, hearings, and events worth showing up for, on one calendar.
      </div>

      {events.map((e) => {
        const topic = e.body ? bodyById(e.body)?.topic : undefined;
        return (
          <div className="calday" key={e.id}>
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
      })}
    </main>
  );
}
