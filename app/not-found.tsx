/* ============================================================================
   not-found.tsx — the custom 404 (Phase 7, Part 1).
   ----------------------------------------------------------------------------
   Next.js renders this for any route that doesn't exist. With
   `output: "export"` it is written to `out/404.html`, which GitHub Pages serves
   for any unknown path under the site. It reuses the same SiteNav and
   SiteFooter as every other page, so a mistyped URL still feels like the same
   site, with a clear way back home and a way into the app.
   ========================================================================== */

import Link from "next/link";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import "@/src/styles/site.css";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <>
      <SiteNav />

      <div className={styles.pageWrap}>
        <div className={styles.hero}>
          <div className="eyebrow">Page not found</div>
          <h1 className="serif">This page didn&apos;t load.</h1>
          <p className={styles.lede}>
            The page you were looking for isn&apos;t here. It may have moved, or
            the web address may have a small typo. The rest of the site is still
            where you left it.
          </p>
          <div className={styles.ctarow}>
            <Link className="btn primary" href="/">
              Back to the home page
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className="btn ghost" href="/app">
              Open your town
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
