/* ============================================================================
   verification-log.schema.ts — the type for the verification log (Phase 7).
   ----------------------------------------------------------------------------
   The verification log records what happened after a flag was checked against
   its source. It is Commonwealth-wide, not town-specific, so it lives next to
   its data file rather than inside the Town contract in data/towns/schema.ts.

   The list is maintained by hand for now, by editing data/verification-log.json
   directly. Each entry describes one checked flag: the claim, the outcome
   (`corrected` if the summary didn't match the source and was fixed, `stands`
   if it matched), the date it was checked, and a link to the source that
   decided it.
   ========================================================================== */

export type VerificationOutcome = "corrected" | "stands";

export interface VerificationEntry {
  /** The point that was flagged, in plain language. */
  claim: string;
  /** What the check found: the summary was corrected, or it stands. */
  outcome: VerificationOutcome;
  /** ISO date the check was completed (YYYY-MM-DD). */
  dateChecked: string;
  /** The source document that decided the outcome. */
  source: {
    label: string;
    url: string;
  };
}
