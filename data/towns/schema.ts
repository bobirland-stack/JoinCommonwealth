/* ============================================================================
   schema.ts — THE DATA CONTRACT (canon §12.5 bounded-core / §12.6 data model)
   ----------------------------------------------------------------------------
   The single most important file for portability. Every component depends on
   THESE TYPES, never on Clawson. A second town is a second JSON file of this
   exact shape — never a code fork (Build Plan Decision #2, §1b dependency
   inversion). If a component needs a town-specific conditional, the contract
   failed, not the component.

   Field names are kept identical to the original clawson.data.js so the port
   is a re-type, not a redesign. Loosely aligned to Open Civic Data / Popolo.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   Provenance — the backbone. EVERY content item carries a `source`.
   `real: true`  = a verified, sourced fact.
   `real: false` = sample / scaffold — MUST be labeled as such in the UI.
   `drafted: true` = drafted by software under fixed rules (adds the
                     "drafted by software" line to the source panel, §4 marker).
   -------------------------------------------------------------------------- */
export interface Source {
  label: string;      // where it came from, e.g. "City of Clawson"
  date: string;       // ISO date the fact was captured/checked (YYYY-MM-DD)
  real: boolean;      // true = verified; false = sample (label in UI)
  url?: string;       // ADD-ONLY: link to the official source document or page,
                      // e.g. the approved minutes PDF or the meeting video
  drafted?: boolean;  // true = software-drafted under fixed rules
  selfReviewed?: boolean; // true = reviewed by the same person who drafted it;
                          // the source panel shows the honest self-review line
                          // instead of "a person checked this against the
                          // source". Set at publish time from a draft whose
                          // review_type is "self".
}

/* ----------------------------------------------------------------------------
   Town identity + integrations + the small facts the whole app reskins from.
   -------------------------------------------------------------------------- */
export interface TownHall {
  address: string;
  phone: string;
  hours: string;
}

export interface TownIntegrations {
  agendas: string;     // e.g. "Granicus"
  web: string;         // e.g. "Revize"
  videoBase: string;   // base URL for meeting video (jump-links are post-V1)
}

export interface TownWater {
  pwsid: string;       // public water system ID, e.g. "MI0001440"
  provider: string;
}

export interface TownIdentity {
  id: string;
  name: string;
  state: string;
  stateAbbr: string;
  county: string;
  population: number;
  areaSqMi: number;
  tagline: string;
  hall: TownHall;
  integrations: TownIntegrations;
  water: TownWater;
  notAffiliated: boolean;   // drives the honesty line on every surface
}

/* ----------------------------------------------------------------------------
   Governing bodies (council, commissions, boards).
   -------------------------------------------------------------------------- */
export type BodyKind =
  | "legislative"
  | "advisory"
  | "quasi-judicial"
  | "executive"; // elected/appointed offices (a Governor's office, a Sheriff's
                 // office). Added for the shared jurisdiction layer, where a
                 // "body" is often a single office rather than a deliberating
                 // board. Existing town bodies never use this value.

export interface Body {
  id: string;
  name: string;
  kind: BodyKind;
  seats: number;
  cadence: string;      // when it meets, human-readable
  location: string;
  role: string;         // one-line description of its authority
  topic: string;        // maps to a Topic.id (followable)
  takeAction?: string;  // one plain sentence: how a resident gets involved
  openSeat?: boolean;   // true if the body currently has a vacancy
  note?: string;        // optional short context, e.g. statutory basis, history
}

/* ----------------------------------------------------------------------------
   Officials — people with roles. One source marker per roster, not per person.
   -------------------------------------------------------------------------- */
export interface Official {
  id: string;
  name: string;
  role: string;
  body: string;         // Body.id
  note?: string;
  term?: string;
  source: Source;
}

/* ----------------------------------------------------------------------------
   Votes — roll-call record for a decision (yes = moss, no = rust in UI).
   -------------------------------------------------------------------------- */
// OCD-aligned vote options: the standard's yes/no/abstain/absent set.
export type VoteOption = "yes" | "no" | "abstain" | "absent";

export interface VoteEntry {
  name: string;
  vote: VoteOption;     // OCD-aligned vote value. Narrowed from `string` to the
                        // VoteOption union; all existing roll data already uses
                        // these values, so nothing old breaks.
  officialId?: string;  // ADD-ONLY: the person's stable Official.id. Links a
                        // roll entry to a person, so an official's page can find
                        // every roll entry that is theirs and show how they
                        // voted. Optional because some historical rolls name a
                        // person who is not in the officials roster. This is a
                        // sourced record of votes only, never a score, tally,
                        // grade, or ranking of any official.
}

export interface Vote {
  result: string;       // e.g. "Denied 3–2"
  roll: VoteEntry[];
}

/* ----------------------------------------------------------------------------
   Threads — the unit a resident FOLLOWS: one issue tracked across meetings.
   The 340 N. Main rezoning is the showcase thread.
   -------------------------------------------------------------------------- */
export interface ThreadStep {
  date: string;
  body: string;              // Body.id
  event: string;             // what happened, in plain language
  videoTimestamp?: string;   // "H:MM:SS" — jump-link is illustrative in V1 (§5)
  vote?: Vote;
  source: Source;
}

export interface Thread {
  id: string;
  title: string;
  topic: string;             // Topic.id
  summary: string;
  parcels?: string[];
  status: string;
  timeline: ThreadStep[];
}

/* ----------------------------------------------------------------------------
   Meetings + agenda items. Items may thread across meetings via threadId.
   Adopted-minutes items carry an optional videoTimestamp — the "close-out
   shape" (Build Plan §3b-a): the cornered-resource data stream starts at
   item one. This is a data SHAPE, not the Member View (that stays out of V1).
   -------------------------------------------------------------------------- */
export type MeetingStatus = "upcoming" | "held" | "closed-out" | "cancelled";

// ADD-ONLY: the honest public record lifecycle (ADR-019 / Phase 1 §5). This is
// a companion to `status`, not a replacement. `status` tracks scheduling;
// `recordStatus` tracks the document state a resident is looking at. It is a
// Commonwealth-specific field: Open Civic Data's event status is about
// scheduling, not the minutes lifecycle, so this is a deliberate deviation.
export type RecordStatus =
  | "agenda"     // agenda posted, meeting not yet held
  | "held"       // meeting held, minutes not yet posted
  | "proposed"   // proposed minutes posted, not yet approved
  | "approved"   // minutes approved, the settled record
  | "corrected"; // approved, then corrected (see the corrections log)

export type AgendaItemType = "hearing" | "action" | "presentation" | "discussion";

export interface AgendaItem {
  id: string;
  n: number;                 // display order on the agenda
  title: string;
  type: AgendaItemType;
  threadId?: string;         // links the item into a followable Thread
  summary: string;
  videoTimestamp?: string;   // present on itemized adopted-minutes (close-out)
  vote?: Vote;               // present once a notable vote is recorded
  source: Source;
}

// ADD-ONLY: a plain-language recap of a whole meeting, in resident voice. Like
// every recap it carries its own source; drafted:true marks it as drafted by
// software under fixed rules, so the source panel can say so.
export interface MeetingCompanion {
  text: string;
  source: Source;
}

export interface Meeting {
  id: string;
  body: string;              // Body.id
  title: string;
  date: string;
  time: string;
  status: MeetingStatus;
  recordStatus?: RecordStatus;   // ADD-ONLY: honest document-state lifecycle
  videoUrl?: string;             // ADD-ONLY: linked meeting video (e.g. the
                                 // YouTube recording), never re-hosted; item
                                 // videoTimestamps are offsets into it
  companion?: MeetingCompanion;  // ADD-ONLY: plain-language recap of the meeting
  items: AgendaItem[];
}

/* ----------------------------------------------------------------------------
   Standalone record cards — real facts, each with provenance.
   -------------------------------------------------------------------------- */
export interface RecordCard {
  id: string;
  topic: string;             // Topic.id
  tag: string;               // short kicker, e.g. "Your water"
  title: string;
  body: string;
  link?: string;             // optional deep-link to a surface/route
  source: Source;
}

/* ----------------------------------------------------------------------------
   Infrastructure projects — current road and water work a resident might want
   to know about before they drive down their street or open a water bill. Kept
   separate from RecordCard because a project has a status a plain record does
   not. `status` moves planned → in-progress → complete.
   -------------------------------------------------------------------------- */
export type ProjectStatus = "planned" | "in-progress" | "complete";

export interface InfrastructureProject {
  id: string;
  title: string;
  kind: "road" | "water";
  status: ProjectStatus;
  summary: string;          // one or two plain sentences
  location: string;         // street or area, plain language
  timeline?: string;        // e.g. "Expected to finish in August"
  source: Source;
}

/* ----------------------------------------------------------------------------
   Calendar events (meetings + civic events). body is null for civic events.
   -------------------------------------------------------------------------- */
export interface CivicEvent {
  id: string;
  date: string;
  time: string;
  body: string | null;       // Body.id, or null for non-body events
  title: string;
  location: string;
  note?: string;
  source: Source;
}

/* ----------------------------------------------------------------------------
   Topics — the followable units (map to Settings follows).
   -------------------------------------------------------------------------- */
export interface Topic {
  id: string;
  label: string;
}

/* ----------------------------------------------------------------------------
   Digest — "from the record" entries; each points at a thread OR a record.
   -------------------------------------------------------------------------- */
export interface DigestEntry {
  id: string;
  topic: string;             // Topic.id
  threadId?: string;         // one of threadId / recordId is typically present
  recordId?: string;
  tag: string;               // "From the record" (moss) | "Happening" (honey)
  title: string;
  note: string;
  date: string;
  source: Source;
}

/* ----------------------------------------------------------------------------
   Town institutions — the library, historical society, senior center, and the
   downtown authority. Each carries a short profile and a set of specific
   streams a resident can follow one at a time (never all-or-nothing). This is
   the resident-facing half only; there is no institution-facing posting tool.
   `kind` is a plain string, not a strict union, so a future town can add a kind
   this town doesn't have without a schema change.
   -------------------------------------------------------------------------- */
export interface InstitutionStream {
  id: string;
  label: string;       // e.g. "Events & programs", "Book sales"
  description: string; // one plain sentence
}

export interface Institution {
  id: string;
  name: string;
  kind: string;          // "library" | "historical society" | "senior center" | "downtown authority"
  summary: string;       // one sentence, what it is
  address?: string;
  hours?: string;
  website?: string;
  streams: InstitutionStream[];
  source: Source;
}

/* ----------------------------------------------------------------------------
   Shared jurisdiction layer — the county and state content every town in a
   place inherits. The point is that state and county facts live HERE, once,
   and a town references the layer instead of copying them into its own JSON.
   That is what lets a second town launch richer and cheaper: the shared layer
   already exists, so the second town only writes what is truly its own.

   A SharedJurisdiction reuses the same Body, Official, and Source shapes as a
   Town, on purpose, so the shared layer feels like the same system and a
   component can render a county office the same way it renders a city office.
   -------------------------------------------------------------------------- */

/**
 * A shared standard a town can be read against, e.g. the lead action level a
 * water report is measured by. Small and sourced like every other fact.
 */
export interface Benchmark {
  id: string;
  label: string;        // e.g. "Lead action level"
  value: string;        // the standard, in plain language
  unit?: string;        // e.g. "ppb"
  note?: string;        // optional short context
  source: Source;
}

export type JurisdictionLevel = "state" | "county";

export interface SharedJurisdiction {
  id: string;                 // "michigan" | "oakland-county"
  name: string;               // "State of Michigan", "Oakland County"
  level: JurisdictionLevel;
  summary: string;            // one plain sentence: what this level does
  bodies: Body[];             // state/county bodies and offices (reused shape)
  officials: Official[];      // statewide/countywide officials (reused shape)
  benchmarks?: Benchmark[];   // shared standards a town can be compared against
  source: Source;             // provenance for the layer as a whole
}

/* ----------------------------------------------------------------------------
   The Town — the whole shape the app reskins from. This is the object every
   component receives (via src/town.ts). Nothing else is town-aware.
   -------------------------------------------------------------------------- */
export interface Town {
  town: TownIdentity;
  bodies: Body[];
  officials: Official[];
  threads: Thread[];
  meetings: Meeting[];
  records: RecordCard[];
  infrastructureProjects: InfrastructureProject[];
  events: CivicEvent[];
  topics: Topic[];
  digest: DigestEntry[];
  institutions: Institution[];
}
