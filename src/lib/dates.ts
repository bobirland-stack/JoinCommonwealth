/* ============================================================================
   dates.ts — tiny, deterministic date formatting for the resident app.
   ----------------------------------------------------------------------------
   The reference formatted dates with `new Date(...).toLocaleString(...)`. We
   format from the ISO string directly instead (no Date object), matching the
   approach the Transparency page already uses, so server and client always
   agree and there is no timezone drift in a statically prerendered page.
   ========================================================================== */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format an ISO date (YYYY-MM-DD) as "Feb 1, 2026". */
export function niceDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
}
