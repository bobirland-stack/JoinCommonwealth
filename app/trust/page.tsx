/* ============================================================================
   Trust & security — the Commonwealth "the limit is the value" page (Phase 2e).
   ----------------------------------------------------------------------------
   A faithful conversion of the reference Trust & security surface: the page
   header (eyebrow + serif h1 + lede) with the eight-item jump nav, then the
   eight sections in order — #record, #privacy, #firewall (with its two-column
   diagram + wall + footnote), #neutral, #corrections (amber note), #access
   ("Live" status pill), #safety ("Gated before any school work" status pill),
   #security (amber note) — and the closing centered CTA row.

   Structure reuses the shared shell — SiteNav (which marks "Trust & security"
   active from the pathname) and SiteFooter — rather than rebuilding the
   nav/footer from the reference markup. Shared classes (.serif, .eyebrow, .btn
   variants) come from the global site.css; page-specific classes live in
   trust.module.css.

   The jump-links are plain in-page anchors to the section `id`s; the shared
   smooth-scroll / reduced-motion handling comes from the global tokens.

   This page reads the town's proper nouns from the data seam (src/town.ts) so a
   second town reskins it with zero code changes: the security note's "not the
   City of Clawson", the closing "Open your Clawson", and the child-safety
   "Michigan education-law counsel" state reference all come from
   `town.town.name` / `town.town.state` — never hardcoded.
   ========================================================================== */

import Link from "next/link";
import { town } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import "@/src/styles/site.css";
import styles from "./trust.module.css";

/** The right-arrow used on the inline CTAs. */
function Arrow() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** The green check used on every "do" rule. */
function Check() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** The rust X used on every "dont" rule. */
function Cross() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/** The amber warning triangle used on the notes. */
function Warn() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

export default function TrustPage() {
  const { name, state } = town.town;

  return (
    <>
      <SiteNav />

      <div className={styles.pageWrap}>
        <div className={styles.phead}>
          <div className="eyebrow">Trust &amp; security</div>
          <h1 className="serif">The limit is the value.</h1>
          <p className={styles.lede}>
            A plain account of a town&apos;s government is only worth something
            if people can trust it. So the things Commonwealth{" "}
            <b>refuses to do</b> aren&apos;t fine print — they&apos;re the
            product. Here&apos;s how trust is built into how it works.
          </p>
          <div className={styles.jump}>
            <a href="#record">The record comes first</a>
            <a href="#privacy">Your privacy</a>
            <a href="#firewall">The firewall</a>
            <a href="#neutral">Neutrality</a>
            <a href="#corrections">Corrections</a>
            <a href="#access">Accessibility</a>
            <a href="#safety">Child safety</a>
            <a href="#security">Security</a>
          </div>
        </div>
      </div>

      <div className={styles.pageWrap}>
        {/* #record — The record comes first */}
        <section id="record" className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M9 13h6M9 17h4" />
              </svg>
            </span>
            <h2 className="serif">The record comes first</h2>
          </div>
          <p className={styles.lead}>
            Commonwealth{" "}
            <b>holds no record of its own — it mirrors the public&apos;s record.</b>{" "}
            It&apos;s a way to understand the town&apos;s government, built on top
            of it and permanently subordinate to it. Every summary links back to
            the official source, so you never have to take our word for anything.
          </p>
          <div className={styles.rules}>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Every claim points back to its <b>official source</b> — the
                agenda, the minutes, the roll-call vote, the notice.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                <b>A person stands behind every recap.</b> Software drafts; a
                trained reviewer checks each fact against the source, or holds
                it. Nothing publishes on a machine&apos;s say-so.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                Commonwealth <b>never becomes the record.</b> It can&apos;t edit
                a vote tally or rewrite what happened — only point at it.
              </span>
            </div>
          </div>
        </section>

        {/* #privacy — You are never the product */}
        <section id="privacy" className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <h2 className="serif">You are never the product</h2>
          </div>
          <p className={styles.lead}>
            The business model is the thing most civic apps get wrong.
            Commonwealth&apos;s is simple:{" "}
            <b>residents are never sold, tracked, or profiled.</b> It&apos;s
            funded by people and foundations who want the record kept free —
            never by advertising, never by data.
          </p>
          <div className={styles.rules}>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                <b>No ads.</b> No advertiser ever pays to reach you here or to
                influence what you see.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                <b>No data sold.</b> Your information is never sold, rented, or
                shared for marketing — to anyone, ever.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                <b>No tracking, no profiling.</b> We never infer your interests
                from what you read. Following a topic is a choice you make — not
                something guessed from your behavior.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Only <b>deliberate, consensual contributions</b> are recorded —
                the topics you choose to follow, the comment you choose to send.
                Nothing is taken silently.
              </span>
            </div>
          </div>
        </section>

        {/* #firewall — The firewall */}
        <section id="firewall" className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <h2 className="serif">The firewall</h2>
          </div>
          <p className={styles.lead}>
            When a city or institution publishes through Commonwealth, it can add
            its own voice and its own documents — but it{" "}
            <b>cannot touch how the record is reported.</b> Money and
            presentation are structurally separated from the neutral record, with
            independent enforcement and a public refusal log.
          </p>
          <div className={styles.firewall}>
            <h3 className="serif">Two layers, one wall between them</h3>
            <div className={styles.fwcols}>
              <div className={`${styles.fwcol} ${styles.record}`}>
                <div className={styles.lbl}>The record shows</div>
                <h4>The neutral layer</h4>
                <p>
                  Votes, budgets, decisions, notices — ingested from the official
                  source, immutable, controlled by Commonwealth, clearly labeled.
                  No one can edit or soften it.
                </p>
              </div>
              <div className={styles.fwwall}>
                <div className={styles.bar}></div>
                <span>Firewall</span>
                <div className={styles.bar}></div>
              </div>
              <div className={`${styles.fwcol} ${styles.city}`}>
                <div className={styles.lbl}>The city says</div>
                <h4>The presentation layer</h4>
                <p>
                  A city may customize how its page looks and add its own
                  verified facts and documents. It speaks in its own voice —
                  beside the record, never over it.
                </p>
              </div>
            </div>
            <p className={styles.fnote}>
              <b>
                The institution that publishes the record cannot change how the
                record is reported.
              </b>{" "}
              It can release its own documents; it cannot edit a vote tally or
              soften a summary. If the wall isn&apos;t demonstrably real, the
              feature doesn&apos;t ship. <i>The limit is the value.</i>
            </p>
          </div>
        </section>

        {/* #neutral — Neutral by construction */}
        <section id="neutral" className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24">
                <path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7Zm10 0-3 7h6l-3-7Z" />
              </svg>
            </span>
            <h2 className="serif">Neutral by construction</h2>
          </div>
          <p className={styles.lead}>
            Commonwealth explains what happened —{" "}
            <b>never whether it was good, wise, or popular.</b> This isn&apos;t a
            stylistic preference; it&apos;s the thing that lets a whole town,
            across every disagreement, trust the same account.
          </p>
          <div className={styles.rules}>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                <b>No endorsements, no scores, no sides.</b> No candidate
                ratings, no &ldquo;good vote / bad vote,&rdquo; no political
                position — ever.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                <b>No engagement games.</b> No feed tuned to enrage, no infinite
                scroll, no metrics that reward stickiness over usefulness.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Where we report our own impact, we use{" "}
                <b>defensible metrics only</b> — decisions surfaced, corrections
                logged against source — never vanity numbers like pageviews or
                time-on-app.
              </span>
            </div>
          </div>
        </section>

        {/* #corrections — How corrections work */}
        <section id="corrections" className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24">
                <path d="M3 7v6h6M21 17v-6h-6" />
                <path d="M21 7a9 9 0 0 0-15-3M3 17a9 9 0 0 0 15 3" />
              </svg>
            </span>
            <h2 className="serif">How corrections work</h2>
          </div>
          <p className={styles.lead}>
            Anyone can flag something that doesn&apos;t match the source — and
            that&apos;s how the record gets <b>more</b> accurate over time. But
            even officials only get to <b>point at the record</b>, never quietly
            change it.
          </p>
          <div className={styles.rules}>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                <b>Factual corrections</b> — anything checkable against the
                official source — are verified and fixed, and the change is
                logged.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Corrections from members of a public body are{" "}
                <b>suggest-and-cite</b>: they propose a fix{" "}
                <b>with a citation to the source</b>, visible and time-boxed,
                against a record neither they nor Commonwealth control.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                <b>Interpretation disputes never silently change a summary.</b>{" "}
                They route to a transparent public response; the summary stands
                unless it&apos;s shown to be unfaithful to the source.
              </span>
            </div>
          </div>
          <div className={styles.note}>
            <Warn />
            <span>
              Built this way, the correction loop makes the firewall <b>more</b>{" "}
              credible, not less — because the rule applies to everyone,
              officials included.
            </span>
          </div>
        </section>

        {/* #access — Built for everyone to use */}
        <section id="access" className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </span>
            <h2 className="serif">Built for everyone to use</h2>
            <span className={`${styles.cn} ${styles.status} ${styles.live}`}>
              Live
            </span>
          </div>
          <p className={styles.lead}>
            Civic information is only fair if everyone can actually read it —
            including older residents, people on old phones and slow connections,
            and people using assistive technology. Accessibility is a first-class
            requirement, not a later polish.
          </p>
          <div className={styles.rules}>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Built toward <b>WCAG 2.1 AA / ADA Title II</b> — readable
                contrast, real focus outlines, large touch targets, and
                screen-reader support.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Respects <b>reduced-motion</b> preferences and offers
                larger-text and high-contrast options in settings.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Plain language by default — the five-minute version, written to
                be understood on the first read.
              </span>
            </div>
          </div>
          <div className={styles.ctarow}>
            <Link className="btn ghost" href="/settings">
              Adjust text, contrast &amp; motion
              <Arrow />
            </Link>
          </div>
        </section>

        {/* #safety — Child safety */}
        <section id="safety" className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>
            </span>
            <h2 className="serif">Child safety</h2>
            <span className={`${styles.cn} ${styles.status} ${styles.build}`}>
              Gated before any school work
            </span>
          </div>
          <p className={styles.lead}>
            Commonwealth may one day let a class help tend the record as civic
            learning. If it does, children are protected by{" "}
            <b>hard rules on the critical path</b> — not by good intentions.
          </p>
          <div className={styles.rules}>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                <b>No minor accounts.</b> Any student authorship is supervised
                and class-mediated, with an adult accountable for everything
                published.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.dont}`}>
              <span className={styles.rk}>
                <Cross />
              </span>
              <span className={styles.rt}>
                <b>No minor is named or pictured</b> without verified parental
                consent.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Qualified <b>{state} education-law counsel must review and
                bless</b> any minor-facing surface before it goes live. This gate
                is non-negotiable.
              </span>
            </div>
          </div>
        </section>

        {/* #security — Security & data handling */}
        <section id="security" className={styles.section}>
          <div className={styles.sectitle}>
            <span className={styles.si}>
              <svg viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <h2 className="serif">Security &amp; data handling</h2>
          </div>
          <p className={styles.lead}>
            Because Commonwealth collects so little, there&apos;s very little to
            lose — and that&apos;s by design. The safest data is the data you
            never hold.
          </p>
          <div className={styles.rules}>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                <b>Data minimization by default.</b> The public record is public.
                What&apos;s personal to you — the topics you follow, your digest
                email — is kept only to deliver the thing you asked for.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Your follow list and preferences are{" "}
                <b>yours to see, export, or delete</b> at any time from settings.
              </span>
            </div>
            <div className={`${styles.rule} ${styles.do}`}>
              <span className={styles.rk}>
                <Check />
              </span>
              <span className={styles.rt}>
                Encrypted in transit, with access limited to what&apos;s needed
                to run the service.
              </span>
            </div>
          </div>
          <div className={styles.note}>
            <Warn />
            <span>
              Commonwealth is a civic-information pilot, not the City of {name}.
              For official services, emergencies, or legal records, always use
              the city&apos;s own channels.{" "}
              <b>If you ever spot something that doesn&apos;t match the source,
              flag it</b> — that&apos;s how the record stays honest.
            </span>
          </div>
        </section>

        {/* closing CTA row */}
        <section className={styles.closing}>
          <div className={styles.ctarow}>
            <Link className="btn primary" href="/app">
              Open your {name}
              <Arrow />
            </Link>
            <Link className="btn ghost" href="/about">
              About Commonwealth
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
