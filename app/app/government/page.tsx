/* ============================================================================
   Government — the resident app government tab (Phase 3).
   ----------------------------------------------------------------------------
   The bodies that make local decisions, who sits on them, and the "on your
   radar" record. Each body card shows its kind, cadence, location, and role,
   with its roster of officials and ONE source marker for the whole roster (not
   one per person). Everything reads from the data seam (src/town.ts).
   ========================================================================== */

import type { ProjectStatus, Source } from "@/data/towns/schema";
import { town } from "@/src/town";
import RecordCard from "@/src/components/RecordCard";
import SourceMarker from "@/src/components/SourceMarker";
import FollowButton from "@/src/components/FollowButton";
import { IconArrow, IconBell, IconClock, IconGavel, IconPin, IconRadar } from "@/src/components/icons";

/** Two-letter initials for the roster avatar. */
function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Plain-language label for a project's status. */
const STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: "Planned",
  "in-progress": "In progress",
  complete: "Complete",
};

export default function GovernmentPage() {
  const { name } = town.town;
  const radar = town.records.find((r) => r.id === "r-renshaw");
  const projects = town.infrastructureProjects;

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

      {/* road and water work — current projects, same card language as records */}
      {projects.length > 0 && (
        <>
          <div className="section-h">
            <h2>Road and water work</h2>
            <span className="ln" />
          </div>
          <div className="sub" style={{ marginTop: -6 }}>
            Current projects that might affect your street or your water. Follow
            this topic to hear when something new comes up.
          </div>
          {projects.map((p) => (
            <RecordCard
              key={p.id}
              source={p.source}
              tag={STATUS_LABEL[p.status]}
              title={p.title}
              body={p.summary}
              topic="infrastructure"
              meta={[p.location, ...(p.timeline ? [p.timeline] : [])]}
            />
          ))}
        </>
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
            {b.openSeat && <div className="bopen">A seat is open now.</div>}
            <div className="brole">{b.role}</div>
            {b.note && <div className="bnote">{b.note}</div>}
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
              {b.seats > 0 && <span className="tagx">{b.seats} seats</span>}
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
            {b.takeAction && (
              <div className="btake">
                <IconArrow />
                <span>{b.takeAction}</span>
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
