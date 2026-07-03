/* ============================================================================
   search.ts — the resident app's client-side record search (Phase 4).
   ----------------------------------------------------------------------------
   One pure function. Given a town object and a raw query, it searches across
   the five content collections the reference searches — digest entries,
   standalone records, threads, officials, and calendar events — and returns a
   flat, typed list of results. It matches the reference's behavior field for
   field:

     - digest  : matches title + note
     - records : matches title + body
     - threads : matches title + summary (source is the first timeline step's)
     - officials: matches the person's name
     - events  : matches the event title (body events carry the body's topic)

   It is deliberately framework-free and side-effect-free: no React, no DOM, no
   town import. The caller passes `town` in, so the function stays trivially
   testable and reskins for any town through the data seam.

   Every result keeps its FULL `source` object (not just the label), so the
   sample-vs-real badge continues to render on search results exactly as it does
   everywhere else.
   ========================================================================== */

import type { Source, Town } from "@/data/towns/schema";
import { niceDate } from "./dates";

/** One search hit, shaped for a RecordCard (source marker + title + body). */
export interface SearchResult {
  /** Stable React key, collection-prefixed so ids never collide across kinds. */
  key: string;
  title: string;
  body: string;
  source: Source;
  /** Followable topic id, or null when the result has no topic (e.g. officials). */
  topic: string | null;
}

/**
 * Search the town record for `rawQuery`. Case-insensitive substring match,
 * mirroring the reference. Returns [] for an empty/whitespace query.
 */
export function searchTown(town: Town, rawQuery: string): SearchResult[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const has = (text: string) => text.toLowerCase().includes(q);
  const results: SearchResult[] = [];

  town.digest.forEach((d) => {
    if (has(`${d.title} ${d.note}`)) {
      results.push({
        key: `digest:${d.id}`,
        title: d.title,
        body: d.note,
        source: d.source,
        topic: d.topic,
      });
    }
  });

  town.records.forEach((r) => {
    if (has(`${r.title} ${r.body}`)) {
      results.push({
        key: `record:${r.id}`,
        title: r.title,
        body: r.body,
        source: r.source,
        topic: r.topic,
      });
    }
  });

  town.threads.forEach((t) => {
    if (has(`${t.title} ${t.summary}`)) {
      results.push({
        key: `thread:${t.id}`,
        title: t.title,
        body: t.summary,
        source: t.timeline[0]?.source ?? {
          label: `${town.town.name} public record`,
          date: "",
          real: true,
        },
        topic: t.topic,
      });
    }
  });

  town.officials.forEach((o) => {
    if (has(o.name)) {
      results.push({
        key: `official:${o.id}`,
        title: o.name,
        body: o.role,
        source: o.source,
        topic: null,
      });
    }
  });

  town.events.forEach((e) => {
    if (has(e.title)) {
      const topic = e.body
        ? (town.bodies.find((b) => b.id === e.body)?.topic ?? null)
        : null;
      const when = niceDate(e.date);
      results.push({
        key: `event:${e.id}`,
        title: e.title,
        body: e.note ? `${e.note} · ${when}` : when,
        source: e.source,
        topic,
      });
    }
  });

  return results;
}
