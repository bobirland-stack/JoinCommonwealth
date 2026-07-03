"use client";

/* ============================================================================
   Support — the Commonwealth support page (honest current-stage adaptation).
   ----------------------------------------------------------------------------
   An adaptation of support material from the project's design history, pulled
   back to reflect the organization's actual stage. Two things are true right
   now and this page keeps them true:

     1. Fiscal sponsorship is NOT in place, so there is no way to make a
        tax-deductible donation today. There is no donate button, no payment
        form, and nothing that implies money can be given now.
     2. The real ask today is to USE Commonwealth and report what is wrong. The
        one action on this page is the "raise your hand" form, which registers
        interest and sends feedback. It is honestly inert until a real endpoint
        is connected, exactly like the newsletter signup (Phase 5).

   The legal-structure timeline and the costs-and-funding format are adapted
   from the Transparency page's #legal and #money sections. Every figure and
   proportion here is an illustrative placeholder, clearly labeled, with real
   numbers appearing only once there is a real account behind them.

   Structure reuses the shared shell — SiteNav (which marks "Support" active
   from the pathname) and SiteFooter. Shared classes (.serif, .eyebrow, .btn
   variants) come from the global site.css; page-specific classes live in
   support.module.css; the design tokens come from the global tokens.css. The
   town's proper nouns are read from the data seam (src/town.ts), never
   hardcoded, so a second town reskins this page with zero code changes.
   ========================================================================== */

// ▼▼▼ PASTE THE INTEREST/FEEDBACK FORM ACTION URL HERE (one line) ▼▼▼
export const RAISE_HAND_ACTION_URL = "";
// ▲▲▲ Leave empty until a real endpoint exists. While empty, the form stays
//     honestly inert: it confirms nothing was sent, exactly as the newsletter
//     signup does. Never wire this to fake a working submission. ▲▲▲

import { useState } from "react";
import Link from "next/link";
import { town } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import "@/src/styles/site.css";
import styles from "./support.module.css";

/** The right-arrow used on the inline CTAs, matching the other pages. */
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/* --- the one interactive element: raise your hand ------------------------
   Reuses the exact honest-inert pattern from NewsletterSignup. An email field
   and an optional short message. Until RAISE_HAND_ACTION_URL is filled in, it
   never pretends to submit anywhere: it shows a plain confirmation that says
   nothing was sent yet. This is an interest-and-feedback form, not a donation. */
function RaiseHand() {
  const [message, setMessage] = useState("");
  const connected = RAISE_HAND_ACTION_URL.trim().length > 0;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!connected) {
      e.preventDefault();
      setMessage(
        "Thanks. Nothing is sent yet: this form goes live once we connect it to a real inbox. When it does, we'll be in touch. It is not a donation.",
      );
    }
  };

  return (
    <form
      className={styles.raise}
      // Empty until connected; the browser ignores an empty action, and our
      // onSubmit keeps it inert either way.
      action={connected ? RAISE_HAND_ACTION_URL : undefined}
      method="post"
      target="_blank"
      onSubmit={onSubmit}
    >
      <p className={styles.rdisclaim}>
        There&apos;s no way to donate yet, and we won&apos;t pretend there is.
        Leave your email and we&apos;ll reach out when Commonwealth can properly
        take support. You can also tell us what you think right now.{" "}
        <b>This registers your interest and sends us feedback. It is not a donation.</b>
      </p>
      <div className={styles.field}>
        <label className={styles.rlabel} htmlFor="rh-email">
          Your email
        </label>
        <input
          className={styles.rinput}
          id="rh-email"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>
      <div className={styles.field}>
        <label className={styles.rlabel} htmlFor="rh-message">
          Anything you want to tell us (optional)
        </label>
        <textarea
          className={styles.rtextarea}
          id="rh-message"
          name="message"
          placeholder="What works, what doesn't, what you'd want it to do."
        />
      </div>
      <button className={styles.rbtn} type="submit">
        Raise your hand
      </button>
      {message ? (
        <p className={styles.rnote} role="status" aria-live="polite">
          {message}
        </p>
      ) : (
        <p className={styles.rhint}>
          We&apos;ll only use your email to reach you about Commonwealth. No
          donation is taken here.
        </p>
      )}
    </form>
  );
}

export default function SupportPage() {
  const { name } = town.town;

  return (
    <>
      <SiteNav />

      <div className={styles.pageWrap}>
        <div className={styles.phead}>
          <div className="eyebrow">Support</div>
          <h1 className="serif">The best way to support Commonwealth is to use it.</h1>
          <p className={styles.lede}>
            Commonwealth is free for everyone in {name}. The most helpful thing
            you can do right now is open it, read your town, and{" "}
            <b>tell us what&apos;s wrong.</b> Your feedback is what makes it
            better.
          </p>
        </div>
      </div>

      <div className={styles.pageWrap}>
        {/* ===== 1 · The primary ask (largest element, top of page) ===== */}
        <section className={styles.section}>
          <div className={styles.ask}>
            <h2 className="serif">Use it, and tell us what&apos;s wrong.</h2>
            <p>
              The real way to help today is to use Commonwealth and report
              anything that looks off. Every item links back to its source, and
              every item lets you flag the exact point that looks wrong.
            </p>
            <p>
              When you flag something, a person checks it against the record and
              corrects it if it doesn&apos;t match.{" "}
              <b>That is how the record stays accurate,</b> and it&apos;s the
              most useful thing a supporter can do while we&apos;re this early.
            </p>
            <div className={styles.ctarow}>
              <Link className="btn primary" href="/app">
                Open your {name}
                <Arrow />
              </Link>
              <Link className="btn ghost" href="/transparency#corrections">
                How flagging works
              </Link>
            </div>
          </div>
        </section>

        {/* ===== 2 · The honest "this is a test" framing ===== */}
        <section className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 6v4l3 2" />
              </svg>
            </span>
            <h2 className="serif">This is an early test, and we&apos;re being straight about it</h2>
          </div>
          <p className={styles.lead}>
            Commonwealth is a social startup in its early stage. We&apos;re
            running a pilot in one town, {name}, to find out whether a service
            like this actually works.
          </p>
          <p className={styles.p}>
            People who use it and support it now are helping prove whether a
            thing like this can exist. We&apos;re not a finished institution, and
            we won&apos;t pretend to be one. Everything below is written to show
            you exactly where we are.
          </p>
        </section>

        {/* ===== 3 · The legal-structure path (adapted from #legal) ===== */}
        <section className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7Zm10 0-3 7h6l-3-7Z" />
              </svg>
            </span>
            <h2 className="serif">Where we are on becoming a nonprofit</h2>
          </div>
          <p className={styles.lead}>
            Commonwealth is working toward nonprofit status. We want to be exact
            about where we are, because{" "}
            <b>&ldquo;nonprofit&rdquo; should describe a real legal status</b>,
            not just an intention.
          </p>
          <div className={styles.legalsteps}>
            <div className={`${styles.lstep} ${styles.done}`}>
              <div className={styles.lh}>
                <b>Started as a mission-first project</b>
                <span className={`${styles.status} ${styles.live}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Complete
                </span>
              </div>
              <p>
                Commonwealth was built to serve residents and the public record.
                It isn&apos;t for sale, and it isn&apos;t monetized against the
                people who use it.
              </p>
            </div>
            <div className={`${styles.lstep} ${styles.now}`}>
              <div className={styles.lh}>
                <b>Working toward fiscal sponsorship</b>
                <span className={`${styles.status} ${styles.progress}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  In progress
                </span>
              </div>
              <p>
                We&apos;re working toward fiscal sponsorship, the usual
                arrangement for a nonprofit project in its early stage. It
                isn&apos;t in place yet. What it means is explained just below.
              </p>
            </div>
            <div className={styles.lstep}>
              <div className={styles.lh}>
                <b>Incorporating and applying for 501(c)(3) status</b>
              </div>
              <p>
                In parallel, we&apos;re incorporating as a nonprofit and
                preparing the application for federal tax-exempt recognition from
                the IRS.
              </p>
            </div>
            <div className={styles.lstep}>
              <div className={styles.lh}>
                <b>An independent 501(c)(3) with its own board</b>
              </div>
              <p>
                The end state is a standalone public charity run by an
                independent board, kept separate from the governments it covers
                and the funders that support it.
              </p>
            </div>
          </div>
          <div className={styles.note}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            <span>
              We&apos;ll show each step here as it&apos;s finished, and post the
              documents behind it. If a step isn&apos;t shown as done, it
              isn&apos;t done yet.{" "}
              <b>
                That includes tax-deductible giving, which isn&apos;t available
                today.
              </b>
            </span>
          </div>
        </section>

        {/* ===== 4 · What fiscal sponsorship means (plain explainer) ===== */}
        <section className={styles.section}>
          <div className={styles.explain}>
            <h4>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              What fiscal sponsorship means
            </h4>
            <p>
              A fiscal sponsor is an established nonprofit that lets a newer
              project operate under its tax-exempt status while the newer project
              sets up its own. Many civic and journalism projects start this way.
              It&apos;s a normal, well-understood arrangement.
            </p>
            <p>
              A project uses it so it can accept support properly, with real
              oversight, before its own IRS status comes through. That can take
              many months. Donations go to the sponsor, are set aside for the
              project, and are released under a written agreement, with the
              sponsor handling the financial oversight.
            </p>
            <p>
              We&apos;re still working toward this.{" "}
              <b>
                We don&apos;t have a sponsor in place yet, so we can&apos;t take
                tax-deductible donations today.
              </b>{" "}
              When that changes, this page will say so plainly, and we&apos;ll
              name the sponsor once the agreement is signed.
            </p>
          </div>
        </section>

        {/* ===== 5 · Costs and funding (illustrative placeholders) ===== */}
        <section className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v10M9.5 9.5a2.5 2 0 0 1 5 0c0 1.5-2.5 1.5-2.5 2.5m0 2.5a2.5 2 0 0 1-5 0" />
              </svg>
            </span>
            <h2 className="serif">What it costs, and where money will come from</h2>
          </div>
          <p className={styles.lead}>
            When Commonwealth does raise money, we&apos;ll publish what it costs
            to run and where every dollar comes from, and keep it current. Here
            is the format we&apos;ll use.
          </p>
          <div className={styles.infonote}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            <span>
              The figures and proportions below are{" "}
              <b>illustrative examples</b> that show the format we&apos;ll keep.
              They aren&apos;t real numbers. Real numbers will appear here only
              once there is a real account behind them.
            </span>
          </div>
          <div className={styles.money}>
            <div className={styles.mhead}>
              <h4>What we&apos;ll report</h4>
              <span className={styles.updated}>Format preview</span>
            </div>
            <div className={styles.mrow}>
              <div className={styles.ml}>
                <b>People &amp; curation</b>
                <span>
                  The human review that checks every summary against its source,
                  expected to be the largest cost.
                </span>
              </div>
            </div>
            <div className={styles.mrow}>
              <div className={styles.ml}>
                <b>Software &amp; hosting</b>
                <span>Servers, domains, email delivery, and the drafting API.</span>
              </div>
            </div>
            <div className={styles.mrow}>
              <div className={styles.ml}>
                <b>Tools &amp; data access</b>
                <span>
                  Records access, archiving, and accessibility and security
                  tooling.
                </span>
              </div>
            </div>
            <div className={styles.mrow}>
              <div className={styles.ml}>
                <b>Legal &amp; compliance</b>
                <span>
                  Incorporation, filings, and a fiscal sponsor&apos;s
                  administrative fee once one is in place.
                </span>
              </div>
            </div>
            <div className={`${styles.mrow} ${styles.total}`}>
              <div className={styles.ml}>
                <b>Once there&apos;s a real account, we&apos;ll publish a dollar figure for every category above, plus the total.</b>
                <span>
                  A single-town pilot is meant to run lean, on the order of a
                  modest monthly budget rather than a staffed newsroom. The exact
                  numbers appear here once there&apos;s a real account behind
                  them.
                </span>
              </div>
            </div>
          </div>
          <div className={styles.money}>
            <div className={styles.mhead}>
              <h4>Where the money will come from</h4>
              <span className={styles.updated}>Illustrative example</span>
            </div>
            <div className={styles.barwrap}>
              <div className={styles.bar}>
                <div
                  className={styles.seg}
                  style={{ width: "55%", background: "var(--moss)" }}
                >
                  Grants
                </div>
                <div
                  className={styles.seg}
                  style={{ width: "30%", background: "var(--sky)" }}
                >
                  Individuals
                </div>
                <div
                  className={styles.seg}
                  style={{ width: "15%", background: "var(--honey)" }}
                >
                  Institutional
                </div>
              </div>
              <div className={styles.barlegend}>
                <span className={styles.lg}>
                  <span className={styles.sw} style={{ background: "var(--moss)" }} />
                  Foundation grants
                </span>
                <span className={styles.lg}>
                  <span className={styles.sw} style={{ background: "var(--sky)" }} />
                  Individual donations
                </span>
                <span className={styles.lg}>
                  <span className={styles.sw} style={{ background: "var(--honey)" }} />
                  Institutional (libraries, civic orgs)
                </span>
              </div>
            </div>
            <div className={`${styles.mrow} ${styles.topline}`}>
              <div className={styles.ml}>
                <b>What we won&apos;t accept</b>
                <span>
                  Advertising. The sale of data. Payment from any government we
                  cover in exchange for coverage. Funding that comes with
                  conditions on what we report.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 6 · The future-fundraising promise ===== */}
        <section className={styles.section}>
          <div className={styles.promise}>
            <h2 className="serif">When we do raise money, here&apos;s our promise</h2>
            <p>
              When Commonwealth raises money, we&apos;ll publish what it costs to
              run and where each dollar goes, and we&apos;ll keep it current.{" "}
              <b>No one should have to take our spending on faith.</b>
            </p>
            <p>
              We think that&apos;s basic respect for the people who support us.
              It&apos;s a small thing to promise, and we&apos;d rather promise it
              now, while it still costs us nothing, than after money is on the
              table.
            </p>
          </div>
        </section>

        {/* ===== 7 · Raise your hand (honest-inert interest + feedback) ===== */}
        <section className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2a8 8 0 0 1-7-4l-3-5a2 2 0 0 1 3.4-2.1L7 15" />
              </svg>
            </span>
            <h2 className="serif">Raise your hand</h2>
          </div>
          <RaiseHand />
        </section>

        {/* ===== 8 · Closing line (voice) ===== */}
        <section className={styles.closing}>
          <p className={`${styles.closingQ} serif`}>
            Anyone can support it. <b>Everyone sees the same record.</b>
          </p>
          <div className={`${styles.ctarow} ${styles.center}`}>
            <Link className="btn primary" href="/app">
              Open your {name}
              <Arrow />
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
