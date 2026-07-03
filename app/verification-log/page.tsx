/* ============================================================================
   Verification log — the public record of checked flags (Phase 7, Part 3).
   ----------------------------------------------------------------------------
   A first-class, linkable page. Anyone can flag a point that looks wrong; we
   check it against the source document and record the outcome here, whether the
   summary was corrected or it stands. Both outcomes are shown, because a record
   that shows its checks is worth more than one that only shows its fixes.

   The list is read through the seam (src/verificationLog.ts). It is empty at
   launch, which is honest and expected: an empty log means nothing has been
   flagged yet, and everything still gets checked. Structure reuses the shared
   shell (SiteNav / SiteFooter); shared classes come from the global site.css.
   ========================================================================== */

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import { verificationLog } from "@/src/verificationLog";
import "@/src/styles/site.css";
import styles from "./verification-log.module.css";

export const metadata: Metadata = {
  title: "Verification log · Commonwealth",
  description:
    "Every flag we check against the source, and the outcome, whether the summary was corrected or it stands.",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format an ISO date (YYYY-MM-DD) as "Oct 21 2025" without a Date object. */
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d} ${y}`;
}

export default function VerificationLogPage() {
  const entries = verificationLog;

  return (
    <>
      <SiteNav />

      <div className={styles.pageWrap}>
        <div className={styles.phead}>
          <div className="eyebrow">Verification log</div>
          <h1 className="serif">Every flag, and what we found.</h1>
          <p className={styles.lede}>
            Anyone can flag a point that looks wrong. We check it against the
            source document, and record the outcome here. If the summary
            doesn&apos;t match the source, we correct it. If it does, it stands.
            Both outcomes are shown.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className={styles.empty}>
            <h2>Nothing has been flagged yet.</h2>
            <p>
              When someone flags a point, the outcome appears here, with a link
              to the document that decided it. An empty log means nothing has
              been flagged yet. Everything still gets checked.
            </p>
          </div>
        ) : (
          <ul className={styles.log}>
            {entries.map((entry, i) => (
              <li key={i} className={styles.entry}>
                <div className={styles.ehead}>
                  <span
                    className={`${styles.outcome} ${
                      entry.outcome === "corrected"
                        ? styles.corrected
                        : styles.stands
                    }`}
                  >
                    {entry.outcome === "corrected" ? "Corrected" : "Stands"}
                  </span>
                  <span className={styles.date}>{fmtDate(entry.dateChecked)}</span>
                </div>
                <p className={styles.claim}>{entry.claim}</p>
                <a
                  className={styles.srclink}
                  href={entry.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Checked against: {entry.source.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.footcta}>
          <p>
            Flags are checked by a person against the source. Read the full
            process on the{" "}
            <Link href="/transparency#corrections">transparency page</Link>.
          </p>
          <div className={styles.ctarow}>
            <Link className="btn primary" href="/app">
              Open your town
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className="btn ghost" href="/trust">
              Trust &amp; security
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
