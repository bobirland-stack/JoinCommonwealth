/* ============================================================================
   Happening — the resident app calendar tab (Phase 4, extended Phase 8).
   ----------------------------------------------------------------------------
   The town calendar, offered two ways: a List of every event sorted by date,
   and a Calendar view of the current month. Both read the SAME data
   (town.events) through the data seam — a second view, not a second data model.
   The header lives here; the toggle and both views live in HappeningView, the
   client component that holds the "List vs Calendar" choice for the session.

   One deliberate difference from every other surface, straight from the
   reference: a calendar row shows a PLAIN source line, not the full tappable
   "From the record" marker. A full marker on every row is heavier than a
   calendar needs. Sample-vs-real labeling still holds — a row whose source is
   not yet a verified fact shows the Sample badge.

   Nothing is hardcoded to Clawson; everything flows from src/town.ts.
   ========================================================================== */

import HappeningView from "./HappeningView";

export default function HappeningPage() {
  return (
    <main className="view">
      <div className="hi">Upcoming</div>
      <div className="h1 serif">Happening.</div>
      <div className="sub">
        Meetings, hearings, and events worth showing up for, on one calendar.
      </div>

      <HappeningView />
    </main>
  );
}
