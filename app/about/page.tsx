/* ============================================================================
   About — the Commonwealth about page (Phase 2c).
   ----------------------------------------------------------------------------
   A faithful conversion of the reference about surface: the page header
   (eyebrow + serif h1 + lede), two prose paragraphs, the "How your town stays
   close" three-step card grid, the "A whole town" four-audience card grid, the
   dark "Independence" band with its four indep-cards and CTA, and the closing
   centered CTA row.

   Structure reuses the shared shell — SiteNav (which marks "About" active from
   the pathname) and SiteFooter — rather than rebuilding the nav/footer from the
   reference markup. Shared classes (.serif, .eyebrow, .btn) come from the
   global site.css; page-specific classes live in about.module.css.

   The editorial copy is preserved verbatim. The only town-specific strings —
   the pilot town's name and state — are read from the data seam (src/town.ts),
   never hardcoded, so a second town reskins this page with zero code changes.
   ========================================================================== */

import Link from "next/link";
import { town } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import "@/src/styles/site.css";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <>
      <SiteNav />

      <div className={styles.pageWrap}>
        <div className={styles.phead}>
          <div className="eyebrow">About Commonwealth</div>
          <h1 className="serif">Feel at home in the place you live.</h1>
          <p className={styles.lede}>
            Commonwealth is a free, nonprofit way to understand your own town:
            what&apos;s happening, the decisions that shape it, and how to take
            part, <b>all in one place you can actually follow.</b>
          </p>
        </div>
      </div>

      <div className={styles.pageWrap}>
        <section className={`${styles.section} ${styles.prose}`}>
          <p>
            Most of us want to feel connected to our own town. We want to know
            what&apos;s happening, show up to the things that matter, and have a
            real say in the decisions that shape it. But civic life is scattered
            across portals, PDFs, and meeting nights that don&apos;t fit a
            working life.
          </p>
          <p>
            <b>Commonwealth is how you close that gap.</b> It brings your
            town&apos;s civic life back into one place you can actually follow:
            what&apos;s going on this week, what the council and boards are
            deciding, how your representatives voted, and the concrete ways to
            take part.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.prose}>
            <h2 className="serif">
              How it works, and why you can trust it
            </h2>
          </div>
          <div className={styles.steps}>
            <div className={styles.stepcard}>
              <div className={styles.sn}>01</div>
              <div className={styles.si}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 13h6M9 17h4" />
                </svg>
              </div>
              <h3>It starts with the real record</h3>
              <p>
                Agendas, minutes, roll-call votes, budgets, and public notices.
                This is the official record your town already produces, and every
                item links back to its source.
              </p>
            </div>
            <div className={styles.stepcard}>
              <div className={styles.sn}>02</div>
              <div className={styles.si}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </div>
              <h3>A person stands behind every recap</h3>
              <p>
                Software writes a first draft in plain language. A trained
                reviewer checks every fact against the source before anything is
                published.
              </p>
            </div>
            <div className={styles.stepcard}>
              <div className={styles.sn}>03</div>
              <div className={styles.si}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 22V12h6v10" />
                </svg>
              </div>
              <h3>Your whole town, in one place</h3>
              <p>
                What the council decided, what the library and schools are
                doing, and the events worth showing up for, along with clear ways
                to take part.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.prose}>
            <h2 className="serif">For the whole town</h2>
          </div>
          <div className={styles.aud}>
            <div className={styles.audcard}>
              <span className={styles.ai}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
                </svg>
              </span>
              <div>
                <h4>Residents</h4>
                <p>
                  Anyone who lives here, to keep up with their town, understand
                  a decision, see how their representatives voted, and find the
                  ways to take part.
                </p>
              </div>
            </div>
            <div className={styles.audcard}>
              <span className={styles.ai}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M10 9h.01M14 9h.01M10 13h.01M14 13h.01" />
                </svg>
              </span>
              <div>
                <h4>Local institutions &amp; nonprofits</h4>
                <p>
                  The library, the senior center, the food pantry, and the
                  school. A clear way to reach the residents who rely on them.
                </p>
              </div>
            </div>
            <div className={styles.audcard}>
              <span className={styles.ai}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <div>
                <h4>Local government</h4>
                <p>
                  A way for a city to get its own record of notices, decisions,
                  and votes to residents in plain language. Commonwealth delivers
                  it, and the city keeps its own voice.
                </p>
              </div>
            </div>
            <div className={styles.audcard}>
              <span className={styles.ai}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
              </span>
              <div>
                <h4>Supporters &amp; funders</h4>
                <p>
                  People and foundations who believe a community should be able
                  to see itself clearly, and who keep it free for everyone here.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.pageWrapWide}>
        <div className={styles.band}>
          <div className="eyebrow">Independence</div>
          <h2 className="serif">
            Anyone can support it. Everyone sees the same record.
          </h2>
          <p className={styles.bsub}>
            A plain account of a town&apos;s government is only worth something if
            people can trust it. Commonwealth&apos;s independence is built into
            how it works.
          </p>
          <div className={styles.indep}>
            <div className={styles.icard}>
              <h4>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
                </svg>
                It answers to residents
              </h4>
              <p>
                A nonprofit that&apos;s independent of the governments it covers.
                That independence protects everyone, including the city, because
                the record reads the same for every reader.
              </p>
            </div>
            <div className={styles.icard}>
              <h4>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7Zm10 0-3 7h6l-3-7Z" />
                </svg>
                It reports, never editorializes
              </h4>
              <p>
                It explains what happened, never whether it was good, wise, or
                popular. No endorsements, no scores, no sides.
              </p>
            </div>
            <div className={styles.icard}>
              <h4>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Support funds independence
              </h4>
              <p>
                Every gift keeps the record free and independent. Supporters are
                named and thanked for funding civic information, and they never
                get a say in it.
              </p>
            </div>
            <div className={styles.icard}>
              <h4>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 12l2 2 4-4M12 3l7 4v5c0 4.4-3 8.5-7 9.9C8 17.5 5 13.4 5 9V7z" />
                </svg>
                Safe and accountable
              </h4>
              <p>
                Built for privacy and accessibility from the start. How we handle
                data, and how we stay secure, is written plainly on our trust
                page.
              </p>
            </div>
          </div>
          <div className={styles.ctarow}>
            <Link className="btn light" href="/trust">
              Read trust &amp; security
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.pageWrap}>
        <section className={styles.closing}>
          <div className={`${styles.ctarow} ${styles.center}`}>
            <Link className="btn primary" href="/app">
              Open your {town.town.name}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className="btn ghost" href="/get-involved">
              Find a way to take part
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
