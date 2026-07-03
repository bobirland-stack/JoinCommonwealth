/* ============================================================================
   build-newsletter.ts — turn this week's town record into a ready-to-send email.
   ----------------------------------------------------------------------------
   V1 model (unchanged from the build plan): one general weekly newsletter to a
   flat list. No backend. This script writes exactly one thing: a dated HTML
   file under newsletter/output/ for a person to review before sending. There is
   no automated send here.

   The town data comes through the SAME seam the app uses (src/town.ts). No
   separate data path, and no town facts live in this file or in template.html:
   everything below is read from `town`.

   Run it with `npm run newsletter`.

   What it does:
     1. Reads the digest ("From the record" / "Happening" entries), newest first.
     2. Reads the upcoming events (dated today or later), soonest first.
     3. Renders them into newsletter/template.html, keeping every item's source
        line and date so no claim appears without its provenance.
     4. Writes the result to newsletter/output/{today}.html, a plain-text history
        of what went out each week.
   ========================================================================== */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { town } from "@/src/town";
import type { DigestEntry, CivicEvent } from "@/data/towns/schema";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(HERE, "template.html");
const OUTPUT_DIR = join(HERE, "output");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Today as an ISO date (YYYY-MM-DD), in UTC so the filename never drifts. */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Format an ISO date (YYYY-MM-DD) as "July 3, 2026" from the string alone. */
function fullDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
}

/** Escape the four characters that would otherwise break the HTML we emit. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * The source line, matching how the app shows provenance: the source label and
 * the date it was captured. Sample (unverified) items are labeled as such, the
 * same rule every surface follows.
 */
function sourceLine(source: { label: string; date: string; real: boolean }): string {
  const base = `${esc(source.label)} · ${esc(fullDate(source.date))}`;
  const sample = source.real
    ? ""
    : ` <span style="font-family:'Spline Sans Mono', ui-monospace, Menlo, monospace; font-size:10px; letter-spacing:0.04em; text-transform:uppercase; color:#92310F;">Sample</span>`;
  return base + sample;
}

/** One digest row: its tag kicker, title, note, and source line. */
function digestRow(d: DigestEntry): string {
  const happening = d.tag === "Happening";
  const kickerColor = happening ? "#A8762A" : "#125049";
  return `
            <tr>
              <td class="cw-pad" style="padding:16px 28px; border-bottom:1px solid #ECE9E1;">
                <div style="font-family:'Spline Sans Mono', ui-monospace, Menlo, monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:${kickerColor}; font-weight:700;">
                  ${esc(d.tag)}
                </div>
                <h2 style="margin:7px 0 0; font-family:'Newsreader', Georgia, 'Times New Roman', serif; font-size:18px; line-height:1.3; font-weight:600; color:#15233A;">
                  ${esc(d.title)}
                </h2>
                <p style="margin:6px 0 0; font-size:14px; line-height:1.55; color:#1A2327;">
                  ${esc(d.note)}
                </p>
                <div style="margin-top:9px; font-family:'Spline Sans Mono', ui-monospace, Menlo, monospace; font-size:11.5px; letter-spacing:0.01em; color:#5B6560;">
                  ${sourceLine(d.source)}
                </div>
              </td>
            </tr>`;
}

/** One event row: a date chip, title, time and place, note, and source line. */
function eventRow(e: CivicEvent): string {
  const [, m, d] = e.date.split("-").map(Number);
  const mo = MONTHS[(m ?? 1) - 1]?.slice(0, 3) ?? "";
  const meta = [e.time, e.location].filter(Boolean).map(esc).join(" · ");
  const note = e.note
    ? `<p style="margin:6px 0 0; font-size:14px; line-height:1.55; color:#1A2327;">${esc(e.note)}</p>`
    : "";
  return `
            <tr>
              <td class="cw-pad" style="padding:16px 28px; border-bottom:1px solid #ECE9E1;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="54" style="vertical-align:top;">
                      <div style="width:46px; text-align:center; border:1px solid #DDD6C8; border-radius:10px; padding:6px 0; background:#FFFFFF;">
                        <div style="font-family:'Spline Sans Mono', ui-monospace, Menlo, monospace; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:#125049; font-weight:700;">${esc(mo)}</div>
                        <div style="font-family:'Newsreader', Georgia, serif; font-size:20px; font-weight:600; color:#15233A; line-height:1.1;">${d ?? ""}</div>
                      </div>
                    </td>
                    <td style="vertical-align:top; padding-left:14px;">
                      <h2 style="margin:0; font-family:'Newsreader', Georgia, 'Times New Roman', serif; font-size:17px; line-height:1.3; font-weight:600; color:#15233A;">
                        ${esc(e.title)}
                      </h2>
                      ${meta ? `<div style="margin-top:4px; font-family:'Spline Sans Mono', ui-monospace, Menlo, monospace; font-size:11.5px; color:#5B6560;">${meta}</div>` : ""}
                      ${note}
                      <div style="margin-top:9px; font-family:'Spline Sans Mono', ui-monospace, Menlo, monospace; font-size:11.5px; letter-spacing:0.01em; color:#5B6560;">
                        ${sourceLine(e.source)}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

function build(): void {
  const today = todayISO();

  // This week's digest: every entry, newest first. (ISO date strings sort
  // correctly as plain strings.)
  const digest = [...town.digest].sort((a, b) => (a.date < b.date ? 1 : -1));

  // Upcoming events: dated today or later, soonest first.
  const events = town.events
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const intro =
    `Here's what showed up in ${town.town.name}'s public record this week, ` +
    `plus what's coming up. Every item shows where it came from, so you can ` +
    `check it against the source yourself.`;

  const digestHtml = digest.length
    ? digest.map(digestRow).join("\n")
    : `
            <tr>
              <td class="cw-pad" style="padding:16px 28px; border-bottom:1px solid #ECE9E1; font-size:14px; color:#5B6560;">
                Nothing new in the record this week.
              </td>
            </tr>`;

  const eventsHtml = events.length
    ? events.map(eventRow).join("\n")
    : `
            <tr>
              <td class="cw-pad" style="padding:16px 28px; border-bottom:1px solid #ECE9E1; font-size:14px; color:#5B6560;">
                No meetings or events on the calendar right now.
              </td>
            </tr>`;

  const template = readFileSync(TEMPLATE_PATH, "utf8");

  // Fill the build-time slots. The email service's own {{ unsubscribe_url }}
  // token is a different delimiter, so it is left untouched for the service.
  const html = template
    .replaceAll("[[TOWN_NAME]]", esc(town.town.name))
    .replaceAll("[[STATE_ABBR]]", esc(town.town.stateAbbr))
    .replaceAll("[[ISSUE_DATE]]", esc(fullDate(today)))
    .replaceAll("[[YEAR]]", String(Number(today.slice(0, 4))))
    .replaceAll(
      "[[PREHEADER]]",
      esc(`This week from the ${town.town.name} public record, plus what's coming up.`),
    )
    .replaceAll("[[INTRO]]", esc(intro))
    .replace("[[DIGEST_ITEMS]]", digestHtml)
    .replace("[[EVENT_ITEMS]]", eventsHtml);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = join(OUTPUT_DIR, `${today}.html`);
  writeFileSync(outPath, html, "utf8");

  console.log(`Newsletter built for ${town.town.name}.`);
  console.log(`  digest items:  ${digest.length}`);
  console.log(`  upcoming events: ${events.length}`);
  console.log(`  written to:    newsletter/output/${today}.html`);
}

build();
