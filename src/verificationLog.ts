/* ============================================================================
   verificationLog.ts — the seam for the verification log (Phase 7).
   ----------------------------------------------------------------------------
   Mirrors the town seam (src/town.ts): the one module that knows how the
   verification log arrives. Components read the typed `verificationLog` array
   exported here and nothing else. Today it is a hand-maintained JSON file
   bundled at build; automating the pipeline from resolved GitHub Issues back
   into this list is future work, and would change only this file.
   ========================================================================== */

import type { VerificationEntry } from "@/data/verification-log.schema";
import entries from "@/data/verification-log.json";

export const verificationLog: VerificationEntry[] = entries as VerificationEntry[];
