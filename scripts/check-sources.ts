/* ============================================================================
   check-sources.ts — THE RECORD-CHECK GATE (ADR-006)
   ----------------------------------------------------------------------------
   No record reaches the published branch with an unsourced claim. This script
   walks the town record and both shared jurisdiction layers and fails loudly if
   any content item is missing its source, if a source is malformed, if a coded
   value is not one the schema allows, or if a reference does not resolve.

   It is the machine half of the promise that a person stands behind every
   recap: the gate proves every claim carries provenance before a human reviews
   it. Run it with `npm run check-sources`; CI runs it on every pull request.

   Why a separate script when src/town.ts already validates at load: town.ts is
   the V1 floor-check for the app runtime and it covers six collections. It does
   not walk meetings, threads, or their nested items, which is exactly where a
   real meeting record lives. This gate reads the data files directly and checks
   everything, so it is the authority over the record independent of the app.

   Hard errors (exit 1): a missing or malformed source, an out-of-range coded
   value (status, recordStatus, vote, agenda item type), or an unresolved
   reference (a meeting body, a thread topic, a step body, an item threadId, or
   a roll entry officialId that names nothing).

   Warnings (exit 0): a verified source (real: true) with no url. The url field
   is add-only, so older records predate it; the warning surfaces the gap
   without blocking, and new records are expected to carry the link.
   ========================================================================== */

import clawson from "@/data/towns/clawson.json";
import michigan from "@/data/towns/michigan.json";
import oaklandCounty from "@/data/towns/oakland-county.json";
import type {
  Town,
  SharedJurisdiction,
  Source,
  AgendaItem,
  Vote,
} from "@/data/towns/schema";

const town = clawson as unknown as Town;
const sharedLayers = [
  michigan as unknown as SharedJurisdiction,
  oaklandCounty as unknown as SharedJurisdiction,
];

const errors: string[] = [];
const warnings: string[] = [];

/* --- Allowed coded values (the schema unions, checked at runtime because JSON
   is cast past the type system and tsc never sees these strings). ----------- */
const MEETING_STATUS = new Set(["upcoming", "held", "closed-out", "cancelled"]);
const RECORD_STATUS = new Set(["agenda", "held", "proposed", "approved", "corrected"]);
const VOTE_OPTION = new Set(["yes", "no", "abstain", "absent"]);
const AGENDA_ITEM_TYPE = new Set(["hearing", "action", "presentation", "discussion"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/* --- Reference sets, built once from the town record. --------------------- */
const bodyIds = new Set(town.bodies.map((b) => b.id));
const topicIds = new Set(town.topics.map((t) => t.id));
const threadIds = new Set(town.threads.map((t) => t.id));
const officialIds = new Set(town.officials.map((o) => o.id));

/**
 * Check one source object. `where` is a human path to the item, so a failure
 * names exactly which record to fix. `expectUrl` is set for record-document
 * items (meeting items, thread steps, companions), where a verified claim is
 * expected to cite the minutes or video it came from. Directory-style rows
 * (officials, benchmarks) carry a source label without a per-row url, so the
 * url warning does not apply to them.
 */
function checkSource(source: Source | undefined, where: string, expectUrl = false): void {
  if (!source) {
    errors.push(`${where}: missing its source (provenance is required)`);
    return;
  }
  if (typeof source.label !== "string" || source.label.trim() === "") {
    errors.push(`${where}: source.label is missing or empty`);
  }
  if (typeof source.date !== "string" || !DATE_RE.test(source.date)) {
    errors.push(`${where}: source.date is missing or not YYYY-MM-DD ("${source.date}")`);
  }
  if (typeof source.real !== "boolean") {
    errors.push(`${where}: source.real is missing or not a boolean`);
  }
  if (expectUrl && source.real === true && (typeof source.url !== "string" || source.url.trim() === "")) {
    warnings.push(`${where}: verified record has no url (add the minutes or video link)`);
  }
}

/** Check a vote roll: every option is valid, every officialId that is present resolves. */
function checkVote(vote: Vote | undefined, where: string): void {
  if (!vote) return;
  vote.roll.forEach((entry, i) => {
    if (!VOTE_OPTION.has(entry.vote)) {
      errors.push(`${where} roll[${i}] "${entry.name}": vote "${entry.vote}" is not a valid VoteOption`);
    }
    if (entry.officialId !== undefined && !officialIds.has(entry.officialId)) {
      errors.push(`${where} roll[${i}] "${entry.name}": officialId "${entry.officialId}" resolves to no official`);
    }
  });
}

/** Check one agenda item: source, coded type, threadId reference, and any vote. */
function checkAgendaItem(item: AgendaItem, where: string): void {
  checkSource(item.source, `${where} "${item.title}"`, true);
  if (!AGENDA_ITEM_TYPE.has(item.type)) {
    errors.push(`${where} "${item.title}": type "${item.type}" is not a valid AgendaItemType`);
  }
  if (item.threadId !== undefined && !threadIds.has(item.threadId)) {
    errors.push(`${where} "${item.title}": threadId "${item.threadId}" resolves to no thread`);
  }
  checkVote(item.vote, `${where} "${item.title}"`);
}

/* --- Collections town.ts already floor-checks, re-checked here in full so the
   gate is the single authority over source structure. ----------------------- */
const flatSourced: [string, { id: string; source: Source }[]][] = [
  ["officials", town.officials],
  ["records", town.records],
  ["infrastructureProjects", town.infrastructureProjects],
  ["events", town.events],
  ["digest", town.digest],
  ["institutions", town.institutions],
];
for (const [name, rows] of flatSourced) {
  for (const row of rows) {
    checkSource(row.source, `${name} "${row.id}"`);
  }
}

/* --- Threads and their steps (skipped by town.ts). ------------------------ */
for (const thread of town.threads) {
  if (!topicIds.has(thread.topic)) {
    errors.push(`thread "${thread.id}": topic "${thread.topic}" resolves to no topic`);
  }
  thread.timeline.forEach((step, i) => {
    const where = `thread "${thread.id}" step[${i}] (${step.date})`;
    checkSource(step.source, where, true);
    if (!bodyIds.has(step.body)) {
      errors.push(`${where}: body "${step.body}" resolves to no body`);
    }
    checkVote(step.vote, where);
  });
}

/* --- Meetings, their items, and companions (skipped by town.ts). ---------- */
for (const meeting of town.meetings) {
  const where = `meeting "${meeting.id}"`;
  if (!bodyIds.has(meeting.body)) {
    errors.push(`${where}: body "${meeting.body}" resolves to no body`);
  }
  if (!MEETING_STATUS.has(meeting.status)) {
    errors.push(`${where}: status "${meeting.status}" is not a valid MeetingStatus`);
  }
  if (meeting.recordStatus !== undefined && !RECORD_STATUS.has(meeting.recordStatus)) {
    errors.push(`${where}: recordStatus "${meeting.recordStatus}" is not a valid RecordStatus`);
  }
  if (meeting.companion) {
    checkSource(meeting.companion.source, `${where} companion`, true);
  }
  meeting.items.forEach((item) => checkAgendaItem(item, `${where} item`));
}

/* --- Shared jurisdiction layers: the layer source, officials, benchmarks. -- */
for (const layer of sharedLayers) {
  checkSource(layer.source, `shared layer "${layer.id}"`);
  for (const official of layer.officials) {
    checkSource(official.source, `shared layer "${layer.id}" official "${official.id}"`);
  }
  for (const benchmark of layer.benchmarks ?? []) {
    checkSource(benchmark.source, `shared layer "${layer.id}" benchmark "${benchmark.id}"`);
  }
}

/* --- Report. -------------------------------------------------------------- */
if (warnings.length > 0) {
  console.warn(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  ! ${w}`);
}

if (errors.length > 0) {
  console.error(`\nSource check FAILED with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  x ${e}`);
  console.error("\nEvery claim must carry a source and every reference must resolve.");
  process.exit(1);
}

console.log(
  `\nSource check passed. ${town.meetings.length} meeting(s), ${town.threads.length} thread(s), ` +
    `${sharedLayers.length} shared layer(s) checked, all claims sourced and all references resolve.` +
    (warnings.length > 0 ? ` ${warnings.length} warning(s) above.` : ""),
);
