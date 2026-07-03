/* ============================================================================
   Take part — the resident app "get involved" tab (Phase 4).
   ----------------------------------------------------------------------------
   The three concrete ways a resident can be heard: show up, send a comment, or
   take a seat. Ported from the reference's in-app "way" cards.

   The meeting specifics are read from the data seam, never hardcoded: the
   council's cadence comes from town.bodies (the legislative body), and the hall
   address comes from town.town.hall. The closing link points at the real
   /get-involved route.
   ========================================================================== */

import Link from "next/link";
import { town } from "@/src/town";
import { IconCheck } from "@/src/components/icons";

export default function TakePartPage() {
  const { name, hall } = town.town;
  // The council generically: the legislative body. Falls back to the first body.
  const council =
    town.bodies.find((b) => b.kind === "legislative") ?? town.bodies[0];

  return (
    <main className="view">
      <div className="hi">Get involved</div>
      <div className="h1 serif">Three ways to be heard.</div>
      <div className="sub">
        Having a say is more concrete than it sounds. Here&apos;s how.
      </div>

      {/* Show up */}
      <div className="way">
        <span className="wn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </span>
        <div className="wc">
          <h4>Show up</h4>
          <p>
            Most bodies keep public comment open to any resident. There&apos;s
            no sign-up, and you don&apos;t need to be an expert.
          </p>
          {council && (
            <div className="wd">
              {council.name} meets {council.cadence}, at {hall.address}.
            </div>
          )}
        </div>
      </div>

      {/* Send a comment */}
      <div className="way">
        <span className="wn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            <path d="m22 6-10 7L2 6" />
          </svg>
        </span>
        <div className="wc">
          <h4>Send a comment</h4>
          <p>
            Can&apos;t make it? Send written comment to the body through the City
            Clerk before the meeting. It becomes part of the record.
          </p>
          <div className="wd">
            Address it to the body, care of the Clerk, and name the agenda item.
          </div>
        </div>
      </div>

      {/* Take a seat */}
      <div className="way">
        <span className="wn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M10 21v-4h4v4" />
          </svg>
        </span>
        <div className="wc">
          <h4>Take a seat</h4>
          <p>
            Boards and commissions are volunteer, and the city fills seats as
            they open. Submit an application to the City Clerk&apos;s office.
          </p>
          <div className="wd">
            Appointed by the Mayor and Council. Attend a meeting first to see
            what the body does.
          </div>
        </div>
      </div>

      <Link className="linkrow" href="/get-involved">
        <svg className="li" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        <div className="lt">
          <b>More on getting involved</b>
          <span>The full guide, with the steps and who to contact</span>
        </div>
        <svg className="ch" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>

      <div className="aihonest">
        <IconCheck />
        <span>
          Details come from {name}&apos;s public record and can change.{" "}
          <b>Confirm against the city&apos;s official notice</b> before you go or
          send.
        </span>
      </div>
    </main>
  );
}
