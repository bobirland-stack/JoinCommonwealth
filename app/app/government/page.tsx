/* ============================================================================
   Government — the resident app government tab (Phase 3).
   ----------------------------------------------------------------------------
   The bodies that make local decisions, who sits on them, and the "on your
   radar" record. Each body card shows its kind, cadence, location, and role,
   with its roster of officials and ONE source marker for the whole roster (not
   one per person). Everything reads from the data seam (src/town.ts).
   ========================================================================== */

import type { Source } from "@/data/towns/schema";
import { town } from "@/src/town";
import SourceMarker from "@/src/components/SourceMarker";
import FollowButton from "@/src/components/FollowButton";
import { IconBell, IconClock, IconGavel, IconPin, IconRadar } from "@/src/components/icons";

/** Two-letter initials for the roster avatar. */
function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function GovernmentPage() {
  const { name } = town.town;
  const radar = town.records.find((r) => r.id === "r-renshaw");

  return (
    <main className="view">
      <div className="hi">Government</div>
      <div className="h1 serif">Your local government.</div>
      <div className="sub">
        The bodies that make decisions, who&apos;s on them, and what&apos;s on
        the ballot. Each one links back to the record.
      </div>

      {/* "on your radar" city-property record */}
      {radar && (
        <div className="ballot">
          <div className="bt">
            <IconRadar />
            On your radar
          </div>
          <h4>{radar.title}</h4>
          <p>{radar.body}</p>
          <div className="rmeta">
            <SourceMarker
              source={radar.source}
              text={`${radar.title}. ${radar.body}`}
            />
          </div>
        </div>
      )}

      {/* bodies + their officials */}
      {town.bodies.map((b) => {
        const members = town.officials.filter((o) => o.body === b.id);
        const rosterSource: Source = members[0]?.source ?? {
          label: `City of ${name}`,
          date: "",
          real: true,
        };
        return (
          <div className="bodycard" key={b.id}>
            <div className="bhead">
              <h4>{b.name}</h4>
              <FollowButton topic={b.topic} />
            </div>
            <div className="brole">{b.role}</div>
            <div className="bmeta">
              <span className="tagx">
                <IconGavel />
                {b.kind}
              </span>
              <span className="tagx">
                <IconClock />
                {b.cadence}
              </span>
              <span className="tagx">
                <IconPin />
                {b.location}
              </span>
              <span className="tagx">{b.seats} seats</span>
            </div>
            {members.length > 0 && (
              <div className="roster">
                {members.map((o) => (
                  <div className="official" key={o.id}>
                    <span className="av">{initials(o.name)}</span>
                    <div className="oi">
                      <b>{o.name}</b>
                      <span>
                        {o.role}
                        {o.term ? ` · ${o.term}` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* one calm, body-level source marker for the whole roster */}
            <div className="bodysrc">
              <SourceMarker
                source={rosterSource}
                text="The members and roles listed for this body."
              />
            </div>
          </div>
        );
      })}

      {/* three-ways teaser → Take part */}
      <div
        className="aihonest"
        style={{
          background: "var(--honeytint)",
          borderColor: "var(--honeyline)",
          color: "#6b4e16",
        }}
      >
        <IconBell />
        <span>
          <b>Want to weigh in?</b> There are three concrete ways: show up, send a
          comment, or take a seat. See the Take part tab.
        </span>
      </div>
    </main>
  );
}
