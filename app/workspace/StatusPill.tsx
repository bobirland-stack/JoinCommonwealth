"use client";

/* ============================================================================
   StatusPill — one small, plainspoken label for a meeting's coverage_status.
   ----------------------------------------------------------------------------
   Shared by the coverage ledger and the drafting and review screens so a
   status looks the same everywhere. The color is keyed off the status name
   through the pill_* classes in workspace.module.css.
   ========================================================================== */

import type { CoverageStatus } from "@/src/curation/types";
import styles from "./workspace.module.css";

export function StatusPill({
  status,
  label,
}: {
  status: CoverageStatus;
  label: string;
}) {
  return <span className={`${styles.pill} ${styles[`pill_${status}`]}`}>{label}</span>;
}
