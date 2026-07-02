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
          <h1 className="serif">One mission. The door you enter is yours.</h1>
          <p className={styles.lede}>
            Commonwealth keeps a town&apos;s public record clear, current, and in
            plain language — so a community can see itself, and take part in the
            decisions that shape it. <b>Everything else is a way in.</b>
          </p>
        </div>
      </div>

      <div className={styles.pageWrap}>
        <section className={`${styles.section} ${styles.prose}`}>
          <p className={styles.big}>
            The decisions that change a town are made in rooms almost no one sits
            in. A rezoning, a millage, a budget line, a water notice — each one
            shapes the place you live, and most of them pass with a handful of
            residents watching.
          </p>
          <p>
            That gap isn&apos;t apathy. It&apos;s friction. The record exists —
            agendas, minutes, roll-call votes, budgets, notices — but it lives in
            PDFs and portals and meeting nights that don&apos;t fit a working life.{" "}
            <b>
              Commonwealth&apos;s mission is to close that gap without ever
              standing between you and the record.
            </b>
          </p>

          <div className={styles.callout}>
            <p className={`${styles.q} serif`}>
              Turn the public record into public understanding —{" "}
              <b>
                the five-minute version of your local government, in plain
                language, in time to matter — always pointing back to the source.
              </b>
            </p>
          </div>

          <h2 className="serif">What we will and won&apos;t be</h2>
          <p>
            The unit of value is a government that stays watchable. Accountability
            runs through residents, reporters, analysts —{" "}
            <b>not through Commonwealth taking a side.</b> We explain what
            happened; we never tell you whether it was good, wise, or popular.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.principles}>
            <div className={styles.pcard}>
              <div className={styles.pi}>
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <h3>Subordinate to the record</h3>
              <p>
                Commonwealth holds no record of its own. It mirrors the
                public&apos;s record, and every claim links back to its source.
              </p>
            </div>
            <div className={styles.pcard}>
              <div className={styles.pi}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7Zm10 0-3 7h6l-3-7Z" />
                </svg>
              </div>
              <h3>Neutral by construction</h3>
              <p>
                No endorsements, no scores, no sides. Describing what happened,
                never judging it — because that&apos;s what earns a whole
                town&apos;s trust.
              </p>
            </div>
            <div className={styles.pcard}>
              <div className={styles.pi}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
              </div>
              <h3>Restraint is the feature</h3>
              <p>
                No ads, no data sold, no engagement games. The things we refuse to
                do are what make the thing we do worth trusting.
              </p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.prose}`}>
          <h2 className="serif">Why fund a pilot, not a promise</h2>
          <p>
            No one has directly tested a neutral, persistent civic-information
            utility. The closest evidence — what happens to a community when local
            information disappears — points one way, but the positive case has to
            be <b>proven, in a real town, with honest numbers.</b>
          </p>
          <p>
            The deepest risk in civic tech is mission drift: fund a neutral public
            good, watch it get monetized into the very thing it was meant to fix.
            Commonwealth is built to resist that — structurally, in how it&apos;s
            governed and funded — not just to intend it.
          </p>
        </section>

        <div className={styles.band}>
          <div className="eyebrow">The honest ask</div>
          <h2 className="serif">Fund the evidence, not a promise.</h2>
          <p>
            We&apos;re not asking anyone to fund an app and hope. We&apos;re asking
            to fund a <b>measurement-first pilot in one town</b> —{" "}
            {town.town.name}, {town.town.state} — with stop-criteria set in
            advance. A small, fast proof this year. A larger ask only if the
            numbers are real.
          </p>
          <p>
            It&apos;s a bet we can honor regardless of how the pilot turns out —
            because what we&apos;re proving is whether a community will actually
            use a thing like this. That answer is worth having either way.
          </p>
          <div className={styles.ctarow}>
            <Link className="btn light" href="/about">
              How it stays independent
              <svg viewBox="0 0 24 24">
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
            Anyone can support it. <b>No one can control it.</b>
          </p>
          <div className={`${styles.ctarow} ${styles.center}`}>
            <Link className="btn primary" href="/app">
              Open your {town.town.name}
              <svg viewBox="0 0 24 24">
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
