/* ============================================================================
   Mission — the Commonwealth mission page (Phase 2b).
   ----------------------------------------------------------------------------
   A faithful conversion of the reference mission surface: the page header
   (eyebrow + serif h1 + lede), the prose sections, the callout quote, the
   three principle cards, the dark "honest ask" band, and the closing centered
   quote + CTA.

   Structure reuses the shared shell — SiteNav (which marks "Mission" active
   from the pathname) and SiteFooter — rather than rebuilding the nav/footer
   from the reference markup. Shared classes (.serif, .eyebrow, .btn) come from
   the global site.css; page-specific classes live in mission.module.css.

   The editorial copy is preserved verbatim. The only town-specific strings —
   the pilot town's name and state — are read from the data seam (src/town.ts),
   never hardcoded, so a second town reskins this page with zero code changes.
   ========================================================================== */

import Link from "next/link";
import { town } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import "@/src/styles/site.css";
import styles from "./mission.module.css";

export default function MissionPage() {
  return (
    <>
      <SiteNav />

      <div className={styles.pageWrap}>
        <div className={styles.phead}>
          <div className="eyebrow">Our mission</div>
          <h1 className="serif">Make your town easy to follow.</h1>
          <p className={styles.lede}>
            Commonwealth keeps a town&apos;s public record clear, current, and in
            plain language, so residents can understand the decisions that shape
            where they live and take part in them.
          </p>
        </div>
      </div>

      <div className={styles.pageWrap}>
        <section className={`${styles.section} ${styles.prose}`}>
          <p className={styles.big}>
            The decisions that change a town are made in rooms almost no one sits
            in. A rezoning, a millage, a budget line, a water notice: each one
            shapes the place you live, and most of them pass with a handful of
            residents watching.
          </p>
          <p>
            People care about their town. The record is just hard to reach.
            Agendas, minutes, votes, budgets, and notices all exist, but they
            live in PDFs, portals, and meeting nights that don&apos;t fit a
            working life.{" "}
            <b>
              Commonwealth closes that gap, and it always points you back to the
              original record.
            </b>
          </p>

          <div className={styles.callout}>
            <p className={`${styles.q} serif`}>
              Turn the public record into public understanding:{" "}
              <b>
                a five-minute, plain-language version of your local government,
                delivered in time to matter, with a link to the source on every
                item.
              </b>
            </p>
          </div>

          <h2 className="serif">What we do, and what we never do</h2>
          <p>
            Our job is to keep local government easy to watch. Accountability
            belongs to residents, reporters, and voters. We explain what
            happened, and we never tell you whether it was good or bad.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.principles}>
            <div className={styles.pcard}>
              <div className={styles.pi}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <h3>The record comes first</h3>
              <p>
                Commonwealth holds no record of its own. It mirrors the
                public&apos;s record, and every claim links back to its source.
              </p>
            </div>
            <div className={styles.pcard}>
              <div className={styles.pi}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7Zm10 0-3 7h6l-3-7Z" />
                </svg>
              </div>
              <h3>No sides, ever</h3>
              <p>
                No endorsements, no scores, no sides. We describe what happened
                without judging it, because that is how a whole town can trust
                the same account.
              </p>
            </div>
            <div className={styles.pcard}>
              <div className={styles.pi}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
              </div>
              <h3>We keep it small on purpose</h3>
              <p>
                No ads, no data sales, and no tricks to keep you scrolling. A
                simple product is easier to trust.
              </p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.prose}`}>
          <h2 className="serif">Why we&apos;re starting with one town</h2>
          <p>
            No one has directly tested a neutral, persistent civic-information
            utility. The closest evidence, what happens to a community when local
            information disappears, points one way, but the positive case has to
            be <b>proven, in a real town, with honest numbers.</b>
          </p>
          <p>
            Projects like this often drift. They start as a public good and end
            up selling ads or data. Commonwealth is set up to prevent that, in
            how it is governed and how it is funded.
          </p>
        </section>

        <div className={styles.band}>
          <div className="eyebrow">The honest ask</div>
          <h2 className="serif">Fund a real test.</h2>
          <p>
            We&apos;re asking supporters to fund <b>a pilot in one town</b>,{" "}
            {town.town.name}, {town.town.state}, that measures its results
            honestly and sets the conditions for stopping in advance. A small,
            fast test this year. A larger ask only if the numbers hold up.
          </p>
          <p>
            Whatever the pilot shows, the answer is worth having: will a
            community actually use a service like this?
          </p>
          <div className={styles.ctarow}>
            <Link className="btn light" href="/about">
              How it stays independent
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              className="btn ghost"
              href="/trust"
              style={{
                background: "transparent",
                borderColor: "rgba(255,255,255,.25)",
                color: "#fff",
              }}
            >
              Trust &amp; security
            </Link>
          </div>
        </div>

        <section className={styles.closing}>
          <p className={`${styles.closingQ} serif`}>
            Anyone can support it. <b>Everyone sees the same record.</b>
          </p>
          <div className={`${styles.ctarow} ${styles.center}`}>
            <Link className="btn primary" href="/app">
              Open your {town.town.name}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
