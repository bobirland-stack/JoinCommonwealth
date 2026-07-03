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

import type { Town } from "../data/towns/schema";
import clawson from "../data/towns/clawson.json";

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

export default town;
