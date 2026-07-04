/* ============================================================================
   town.ts — THE DATA SEAM (Build Plan §1, §1b)
   ----------------------------------------------------------------------------
   The ONE module that knows how the town record arrives. Every component
   consumes the typed `town` object exported here and nothing else. Because
   all town data flows through this single seam:

     - V1 bundles the record into the build ("the data IS the deploy" — a
       version-controlled audit trail of the mirror). Zero loading states,
       zero API surface, free CDN hosting.
     - The two-way door (ADR-002): introducing fetching later — per-topic
       digests, live flags, multi-town loading — changes THIS FILE ONLY,
       zero components. Any component that imports town JSON directly has
       broken the seam and the door. Don't.

   A lightweight structural validation runs at load so a malformed town.json
   fails loudly at build/startup rather than rendering silently-wrong records.
   (Full schema-level runtime validation with zod is ADR-002's named upgrade
   path; the shape check here is the V1-appropriate floor.)
   ========================================================================== */

import type { SharedJurisdiction, Town } from "../data/towns/schema";
import clawson from "../data/towns/clawson.json";
import michiganData from "../data/towns/michigan.json";
import oaklandCountyData from "../data/towns/oakland-county.json";

/**
 * Which town this build serves. V1 is single-town; town #2 flips this import
 * (or, post-seam-upgrade, reads an env var / route param). The rest of the app
 * never learns which town it is.
 */
const activeTown = clawson as unknown as Town;

/** The required top-level collections every town must define. */
const REQUIRED_KEYS: (keyof Town)[] = [
  "town",
  "bodies",
  "officials",
  "threads",
  "meetings",
  "records",
  "infrastructureProjects",
  "events",
  "topics",
  "digest",
  "institutions",
];

/**
 * Structural floor-check. Not a full schema validator — it catches the
 * failure modes that would otherwise render as silently-missing sections:
 * a missing collection, or a content item with no provenance.
 */
function validateTown(t: Town): Town {
  for (const key of REQUIRED_KEYS) {
    if (!(key in t) || t[key] == null) {
      throw new Error(`[town.ts] town record is missing required key: "${key}"`);
    }
  }

  if (!t.town.id || !t.town.name) {
    throw new Error("[town.ts] town.town must define at least id and name");
  }

  // Provenance backbone: officials, records, events, and digest entries must
  // each carry a source. (Threads/meetings carry source per-step/per-item.)
  const sourced: { name: string; rows: { id: string; source?: unknown }[] }[] = [
    { name: "officials", rows: t.officials },
    { name: "records", rows: t.records },
    { name: "infrastructureProjects", rows: t.infrastructureProjects },
    { name: "events", rows: t.events },
    { name: "digest", rows: t.digest },
    { name: "institutions", rows: t.institutions },
  ];
  for (const { name, rows } of sourced) {
    for (const row of rows) {
      if (!row.source) {
        throw new Error(
          `[town.ts] ${name} entry "${row.id}" is missing its source (provenance is required)`,
        );
      }
    }
  }

  return t;
}

/** The typed town object. Import THIS everywhere the app needs town data. */
export const town: Town = validateTown(activeTown);

/* --- Small typed accessors (convenience, all derived from `town`) --------- */

/** Look up a body by id. */
export const bodyById = (id: string) => town.bodies.find((b) => b.id === id);

/** Look up a topic's label by id (falls back to the raw id). */
export const topicLabel = (id: string) =>
  town.topics.find((tp) => tp.id === id)?.label ?? id;

/** All threads/records/digest entries under a given topic. */
export const byTopic = <T extends { topic: string }>(rows: T[], topicId: string) =>
  rows.filter((r) => r.topic === topicId);

/** A thread by id (the "follow this" unit). */
export const threadById = (id: string) =>
  town.threads.find((th) => th.id === id);

/** Look up an institution by id. */
export const institutionById = (id: string) =>
  town.institutions.find((i) => i.id === id);

/** Look up a single followable stream by its institution and stream ids. */
export const institutionStream = (institutionId: string, streamId: string) =>
  institutionById(institutionId)?.streams.find((s) => s.id === streamId);

/* ============================================================================
   Shared jurisdiction layer — the county and state record a town inherits.
   ----------------------------------------------------------------------------
   The same seam rule applies: components read these through town.ts, never by
   importing the JSON. County and state facts live in their own files and are
   referenced here, so nothing is copied into a town's own record. A second
   town in the same county and state reuses this exact layer unchanged.
   ========================================================================== */

/**
 * Floor-check for a shared jurisdiction file. Like validateTown, this is the
 * V1-appropriate shape check: the layer must name itself, and every official
 * and benchmark must carry a source, since provenance is the backbone here too.
 */
function validateSharedJurisdiction(j: SharedJurisdiction): SharedJurisdiction {
  if (!j.id || !j.name) {
    throw new Error("[town.ts] shared jurisdiction must define at least id and name");
  }
  if (!j.source) {
    throw new Error(
      `[town.ts] shared jurisdiction "${j.id}" is missing its source (provenance is required)`,
    );
  }
  for (const o of j.officials) {
    if (!o.source) {
      throw new Error(
        `[town.ts] shared jurisdiction "${j.id}" official "${o.id}" is missing its source`,
      );
    }
  }
  for (const b of j.benchmarks ?? []) {
    if (!b.source) {
      throw new Error(
        `[town.ts] shared jurisdiction "${j.id}" benchmark "${b.id}" is missing its source`,
      );
    }
  }
  return j;
}

/** The state layer. Import THIS, never the JSON. */
export const michigan: SharedJurisdiction = validateSharedJurisdiction(
  michiganData as unknown as SharedJurisdiction,
);

/** The county layer. Import THIS, never the JSON. */
export const oaklandCounty: SharedJurisdiction = validateSharedJurisdiction(
  oaklandCountyData as unknown as SharedJurisdiction,
);

/** Every shared layer this build knows about. */
export const sharedLayers: SharedJurisdiction[] = [michigan, oaklandCounty];

/** Look up a shared layer by id, e.g. "michigan" or "oakland-county". */
export const sharedLayerById = (id: string) =>
  sharedLayers.find((l) => l.id === id);

/**
 * Resolve which shared layers a town belongs to, from its own state and county
 * names, so a component never hardcodes "Michigan" or "Oakland County". Names
 * are matched loosely: "State of Michigan" resolves for a town in "Michigan",
 * and "Oakland County" resolves for a town whose county is "Oakland County".
 */
const normJurisdiction = (s: string) =>
  s.toLowerCase().replace(/\bstate of\b/g, "").replace(/\bcounty\b/g, "").trim();

export function sharedLayersForTown(t: Town = town): {
  state?: SharedJurisdiction;
  county?: SharedJurisdiction;
} {
  return {
    state: sharedLayers.find(
      (l) => l.level === "state" && normJurisdiction(l.name) === normJurisdiction(t.town.state),
    ),
    county: sharedLayers.find(
      (l) => l.level === "county" && normJurisdiction(l.name) === normJurisdiction(t.town.county),
    ),
  };
}

export default town;
