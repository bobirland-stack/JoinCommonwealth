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
  drafted?: boolean;  // true = software-drafted under fixed rules
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
export type BodyKind = "legislative" | "advisory" | "quasi-judicial";

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
export interface VoteEntry {
  name: string;
  vote: string;         // "yes" | "no" | "abstain" | "absent" (kept as string
                        // to mirror the source record faithfully)
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

export interface Meeting {
  id: string;
  body: string;              // Body.id
  title: string;
  date: string;
  time: string;
  status: MeetingStatus;
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
  events: CivicEvent[];
  topics: Topic[];
  digest: DigestEntry[];
  institutions: Institution[];
}
