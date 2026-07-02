"use client";

/* ============================================================================
   Transparency — the Commonwealth "how it works, in full" page (Phase 2f).
   ----------------------------------------------------------------------------
   The most complex marketing surface, and the only one that must be a client
   component: it carries THREE interactive behaviors ported from the reference's
   inline <script>.

     1. The 4-stage pipeline (STAGES + showStage). The selected stage key lives
        in `selectedStage` (default "source"); the four buttons reflect it via
        aria-pressed, and the detail panel renders from the STAGES constant.

     2. The scroll-spy sticky sidenav. A scroll/resize listener (in a useEffect,
        cleaned up on unmount) mirrors the reference IIFE exactly: the last
        section whose top has crossed a 100px marker wins, with a bottom-of-page
        override that pins the final section. The winning id drives
        `activeSection`, which lights the matching sidenav link.

     3. The collapsible drafting-rules prompt. Kept as a native <details>/
        <summary> — the simplest, most accessible option, per the task.

   Structure reuses the shared shell — SiteNav (which marks "Transparency" active
   from the pathname) and SiteFooter — rather than rebuilding the reference
   nav/footer. Shared classes (.serif, .eyebrow, .btn variants) come from the
   global site.css; page-specific classes live in transparency.module.css; the
   design tokens (including the page's extra --slate / --slatetint / --slateline
   / --rustline) come from the global tokens.css.

   Town proper nouns and the worked example are read from the data seam
   (src/town.ts): the #sourcing prose pulls town.town.name and the Granicus /
   Revize integrations from town.town.integrations, and the 340 N. Main worked
   example reads its roll call, result, and date from the real `t-340main`
   thread — no component imports a town JSON directly.
   ========================================================================== */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { town, threadById } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import "@/src/styles/site.css";
import styles from "./transparency.module.css";

/* --- the four pipeline stages (ported verbatim from the reference STAGES) --- */

type StageKey = "source" | "ai" | "human" | "pub";

interface Stage {
  key: StageKey;
  cls: string; // module class: sSource / sAi / sHuman / sPub
  num: string;
  icon: ReactNode;
  heading: string; // button title
  cap: string; // button caption
  trust: string; // button trust pill
  tag: string; // detail eyebrow
  color: string; // css var name for the detail accent
  detailTitle: string;
  body: ReactNode; // detail body (bolding preserved as JSX)
}

const STAGES: Stage[] = [
  {
    key: "source",
    cls: "sSource",
    num: "STAGE 1",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
    heading: "The source",
    cap: "An official public document.",
    trust: "The authority",
    tag: "Stage 1 · The authority",
    color: "pine",
    detailTitle: "The source: an official public document",
    body: (
      <>
        Every item begins with <b>one official document</b> a government has
        already published — an agenda, adopted minutes, a roll-call vote, a
        public notice, or an annual report. This document is the authority.
        Nothing that follows may contradict it or add to it. The source is kept
        and linked at every later stage.
      </>
    ),
  },
  {
    key: "ai",
    cls: "sAi",
    num: "STAGE 2",
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2M9 13h.01M15 13h.01" />
      </svg>
    ),
    heading: "Software drafts",
    cap: "Restates it in plain language, nothing more.",
    trust: "Constrained",
    tag: "Stage 2 · Constrained",
    color: "slate",
    detailTitle: "Software drafts, and nothing more",
    body: (
      <>
        Software reads that <b>one document</b> and restates it in plainer
        language. That is the whole task. It does not browse, add context, or
        decide what matters, and it works under fixed rules (listed in the next
        section). It cannot publish anything on its own — a person must review
        and approve it first. This is the most constrained step in the process,
        by design.
      </>
    ),
  },
  {
    key: "human",
    cls: "sHuman",
    num: "STAGE 3",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    ),
    heading: "A person reviews",
    cap: "Checks it against the source. Can hold or reject.",
    trust: "Responsible",
    tag: "Stage 3 · Responsible",
    color: "moss",
    detailTitle: "A person reviews, and can stop it",
    body: (
      <>
        A trained reviewer reads the draft <b>against the original document</b>.
        If it matches and follows the rules, it proceeds. If anything is off — a
        softened fact, a missing detail, an overstatement — the reviewer holds
        or rejects it. The authority to reject is what makes this a real check.{" "}
        <b>Example:</b> a draft once described a tabled item as &ldquo;rejected,&rdquo;
        when the minutes said only that it was postponed. The reviewer caught it
        and corrected it before anything was published.
      </>
    ),
  },
  {
    key: "pub",
    cls: "sPub",
    num: "STAGE 4",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
      </svg>
    ),
    heading: "Published",
    cap: "With the source link attached.",
    trust: "Verifiable",
    tag: "Stage 4 · Verifiable",
    color: "sky",
    detailTitle: "Published, with the source attached",
    body: (
      <>
        Only after a person approves it does a summary reach a reader — and it
        arrives with a &ldquo;From the record&rdquo; tag and a link to the exact
        source. No one has to take our word for it: every published claim can be
        checked against the document it came from, and anything that does not
        match can be flagged and corrected.
      </>
    ),
  },
];

/* Sections the sidenav tracks, in document order. */
const SECTIONS = [
  { id: "legal", label: "Legal structure" },
  { id: "money", label: "Costs & funding" },
  { id: "sourcing", label: "How it's sourced" },
  { id: "process", label: "How it's made" },
  { id: "rules", label: "The drafting rules" },
  { id: "corrections", label: "Corrections" },
] as const;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format an ISO date (YYYY-MM-DD) as "Oct 21 2025" without a Date object. */
function fmtRecordDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d} ${y}`;
}

/** Last word of a name ("Mayor Paula Millan" → "Millan"). */
const lastName = (full: string): string => full.trim().split(/\s+/).pop() ?? full;

export default function TransparencyPage() {
  const [selectedStage, setSelectedStage] = useState<StageKey>("source");
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);

  /* --- behavior 2: scroll-spy sidenav (mirrors the reference IIFE) --------- */
  useEffect(() => {
    const update = () => {
      const marker = 100; // px from top of viewport
      let current: string = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= marker) current = id;
      }
      // bottom-of-page: pin the final section so the last link can highlight
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8
      ) {
        current = SECTIONS[SECTIONS.length - 1].id;
      }
      setActiveSection(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  /* --- data seam: town facts + the worked example ------------------------- */
  const { name } = town.town;
  const { agendas, web } = town.town.integrations;

  const thread = threadById("t-340main");
  const denial = thread?.timeline.find((step) => step.vote);
  const roll = denial?.vote?.roll ?? [];
  const rollLine = roll.map((r) => `${lastName(r.name)} – ${r.vote}`).join("; ");
  const noNames = roll.filter((r) => r.vote === "no").map((r) => lastName(r.name));
  const yesNames = roll.filter((r) => r.vote === "yes").map((r) => lastName(r.name));
  const tally = (denial?.vote?.result ?? "Denied 3–2").split(/\s+/).pop() ?? "3–2";
  const recordDate = denial ? fmtRecordDate(denial.date) : "Oct 21 2025";

  const detail = STAGES.find((s) => s.key === selectedStage) ?? STAGES[0];

  return (
    <>
      <SiteNav />

      <div className={styles.shell}>
        {/* --- behavior 2: the sticky sidenav --- */}
        <aside className={styles.sidenav} aria-label="On this page">
          <div className={styles.snlabel}>On this page</div>
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? styles.active : undefined}
            >
              {label}
            </a>
          ))}
        </aside>

        <div className={styles.content}>
          <div className={styles.phead}>
            <div className="eyebrow">Transparency</div>
            <h1 className="serif">How Commonwealth works, in full.</h1>
            <p className={styles.lede}>
              A project that asks a community to trust it should be easy to
              check. This page sets out{" "}
              <b>
                how we are organized, where our money comes from, how each fact
                is sourced, and how the work is produced
              </b>{" "}
              — including where software assists, and where a person is
              responsible.
            </p>
            <p className={styles.updatedline}>Last updated: 1 July 2026</p>
            <div className={styles.jump}>
              {SECTIONS.map(({ id, label }) => (
                <a key={id} href={`#${id}`}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* ===== #legal — Legal structure ===== */}
          <section id="legal" className={styles.section}>
            <div className={styles.sectitle}>
              <span className={styles.si}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7Zm10 0-3 7h6l-3-7Z" />
                </svg>
              </span>
              <h2 className="serif">Legal structure</h2>
            </div>
            <p className={styles.lead}>
              Commonwealth is being established as an{" "}
              <b>independent nonprofit</b>. We are specific about where we are in
              that process, because &ldquo;nonprofit&rdquo; should describe a
              concrete legal status, not a general intention.
            </p>
            <div className={styles.legalsteps}>
              <div className={`${styles.lstep} ${styles.done}`}>
                <div className={styles.lh}>
                  <b>Established as a mission-first project</b>
                  <span className={`${styles.status} ${styles.live}`}>
                    <svg viewBox="0 0 24 24">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    Complete
                  </span>
                </div>
                <p>
                  Commonwealth was created to serve residents and the public
                  record, not to be sold, monetized against its users, or
                  controlled by any outside interest.
                </p>
              </div>
              <div className={`${styles.lstep} ${styles.now}`}>
                <div className={styles.lh}>
                  <b>Securing a fiscal sponsor</b>
                  <span className={`${styles.status} ${styles.progress}`}>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    In progress
                  </span>
                </div>
                <p>
                  We are working toward fiscal sponsorship, the standard
                  arrangement for a nonprofit project in its early stage. It is
                  explained below.
                </p>
              </div>
              <div className={styles.lstep}>
                <div className={styles.lh}>
                  <b>Incorporating and applying for 501(c)(3) status</b>
                </div>
                <p>
                  In parallel, we are incorporating as a nonprofit and preparing
                  the application for federal tax-exempt recognition from the
                  IRS.
                </p>
              </div>
              <div className={styles.lstep}>
                <div className={styles.lh}>
                  <b>Independent 501(c)(3) with its own board</b>
                </div>
                <p>
                  The end state is a standalone public charity governed by an
                  independent board, structurally separated from the governments
                  it covers and the funders that support it.
                </p>
              </div>
            </div>
            <div className={styles.explain}>
              <h4>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                What fiscal sponsorship means
              </h4>
              <p>
                A fiscal sponsor is an established 501(c)(3) nonprofit that
                extends its tax-exempt status to a newer project while that
                project sets up its own. It allows Commonwealth to{" "}
                <b>receive tax-deductible grants and donations now</b>, with
                proper oversight, before our own IRS determination is complete —
                a process that can take many months.
              </p>
              <p>
                In practice, donations are made to the sponsor, designated for
                Commonwealth, and released to us under a written agreement. The
                sponsor provides financial oversight and compliance; we carry
                out the work. It is a common, well-established arrangement for
                new civic and journalism nonprofits, and it means{" "}
                <b>
                  support is tax-deductible and independently overseen from the
                  start.
                </b>
              </p>
              <p>
                Once our own 501(c)(3) status is granted, Commonwealth
                transitions off the sponsor and operates independently.
              </p>
            </div>
            <div className={styles.note}>
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              <span>
                We will name our fiscal sponsor here once the agreement is
                signed, and post our incorporation and determination documents
                as each is completed.{" "}
                <b>If a step isn&apos;t shown here yet, it isn&apos;t done yet.</b>
              </span>
            </div>
          </section>

          {/* ===== #money — Costs & funding ===== */}
          <section id="money" className={styles.section}>
            <div className={styles.sectitle}>
              <span className={styles.si}>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v10M9.5 9.5a2.5 2 0 0 1 5 0c0 1.5-2.5 1.5-2.5 2.5m0 2.5a2.5 2 0 0 1-5 0" />
                </svg>
              </span>
              <h2 className="serif">Costs &amp; funding</h2>
              <span
                className={`${styles.status} ${styles.live}`}
                style={{ marginLeft: "auto" }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M21 12a9 9 0 1 1-6.2-8.5" />
                </svg>
                Updated monthly
              </span>
            </div>
            <p className={styles.lead}>
              We publish our costs and our funding sources, and we keep them
              current. In V1 this page is updated monthly. The aim is that no one
              has to take our spending on faith.
            </p>
            <div className={styles.infonote}>
              <svg viewBox="0 0 24 24">
                <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
              <span>
                The figures below are <b>illustrative placeholders</b> that show
                the format we will maintain. Real numbers replace them once the
                fiscal-sponsorship account is active. We will not publish a
                figure here until it is accurate.
              </span>
            </div>
            <div className={styles.money}>
              <div className={styles.mhead}>
                <h4>What we report, and how often</h4>
                <span className={styles.updated}>
                  Categories fixed · figures monthly
                </span>
              </div>
              <div className={styles.mrow}>
                <div className={styles.ml}>
                  <b>People &amp; curation</b>
                  <span>
                    The human review that checks every summary against its
                    source — expected to be the largest cost.
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
                    Incorporation, filings, and the fiscal sponsor&apos;s
                    administrative fee.
                  </span>
                </div>
              </div>
              <div className={`${styles.mrow} ${styles.total}`}>
                <div className={styles.ml}>
                  <b>
                    Each month we publish the dollar figure for every category
                    above, plus the total.
                  </b>
                  <span>
                    A single-town pilot is designed to run lean — on the order
                    of a modest monthly budget, not a staffed newsroom. The exact
                    numbers appear here once the sponsorship account is active.
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.money}>
              <div className={styles.mhead}>
                <h4>Where the money comes from</h4>
                <span className={styles.updated}>Format preview</span>
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
                    <span
                      className={styles.sw}
                      style={{ background: "var(--moss)" }}
                    />
                    Foundation grants
                  </span>
                  <span className={styles.lg}>
                    <span
                      className={styles.sw}
                      style={{ background: "var(--sky)" }}
                    />
                    Individual donations
                  </span>
                  <span className={styles.lg}>
                    <span
                      className={styles.sw}
                      style={{ background: "var(--honey)" }}
                    />
                    Institutional (libraries, civic orgs)
                  </span>
                </div>
              </div>
              <div className={`${styles.mrow} ${styles.topline}`}>
                <div className={styles.ml}>
                  <b>What we will not accept</b>
                  <span>
                    Advertising. The sale of data. Payment from any government we
                    cover in exchange for coverage. Funding conditioned on what
                    we report.
                  </span>
                </div>
              </div>
            </div>
            <p className={styles.p} style={{ marginBottom: 0 }}>
              Money is the point at which trust is most often lost. Publishing
              every dollar in and out, and its source, is how a reader can be
              confident our coverage is not for sale — because the record is
              there to check.
            </p>
          </section>

          {/* ===== #sourcing — How every fact is sourced ===== */}
          <section id="sourcing" className={styles.section}>
            <div className={styles.sectitle}>
              <span className={styles.si}>
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 13h6M9 17h4" />
                </svg>
              </span>
              <h2 className="serif">How every fact is sourced</h2>
            </div>
            <p className={styles.lead}>
              Commonwealth works from{" "}
              <b>one kind of source: the official public record.</b> Every
              summary, vote count, date, and decision traces to a document a
              government has already published.
            </p>
            <div className={`${styles.explain} ${styles.moss}`}>
              <h4>
                <svg viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                The rule: if it isn&apos;t in the record, it isn&apos;t here
              </h4>
              <p>
                Each item comes from a specific official document — an agenda, a
                set of adopted minutes, a roll-call vote, a public notice, or an
                annual report.{" "}
                <b>
                  Every item carries a &ldquo;From the record&rdquo; tag and
                  links to its exact source.
                </b>{" "}
                If a claim cannot be traced to a document, it is not published.
              </p>
            </div>
            <p className={styles.p}>
              <b>Where the records come from:</b> {name} publishes through
              standard municipal systems — meeting agendas and video through{" "}
              {agendas}, the city website and notices through {web}, and annual
              reports such as the water quality report. These records are public
              by law. We use only what any resident could request.
            </p>
            <p className={styles.p} style={{ maxWidth: "64ch" }}>
              Here is one real example, showing the source on the left and what a
              reader sees on the right:
            </p>
            <div className={styles.worked}>
              <div className={`${styles.wk} ${styles.src}`}>
                <div className={styles.wkh}>
                  <svg viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  </svg>
                  The source: official minutes
                </div>
                <div className={styles.raw}>
                  …Motion to approve the rezoning of 340 N. Main from O-1 to CR.
                  Roll call: {rollLine}. Motion fails {tally}…
                </div>
              </div>
              <div className={`${styles.wk} ${styles.out}`}>
                <div className={styles.wkh}>
                  <svg viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  What a reader sees
                </div>
                <div className={styles.summary}>
                  Council <b>denied</b> the 340 N. Main rezoning <b>{tally}</b>.
                  Voting no: {noNames.join(", ")}. Voting yes:{" "}
                  {yesNames.join(", ")}.
                </div>
                <div className={styles.srcline}>
                  <svg viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                  From the record · City Council minutes, {recordDate}
                </div>
              </div>
            </div>
            <p className={styles.p} style={{ marginBottom: 0 }}>
              The summary does not say the vote was right or wrong, does not
              describe anyone&apos;s motives, and adds nothing that was not in
              the minutes. It restates the record in plain language and links
              back so the reader can confirm it.
            </p>
          </section>

          {/* ===== #process — How it's made (interactive pipeline) ===== */}
          <section id="process" className={styles.section}>
            <div className={styles.sectitle}>
              <span className={styles.si}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 0v10l6 3" />
                </svg>
              </span>
              <h2 className="serif">How it&apos;s made, and where software fits</h2>
            </div>
            <p className={styles.lead}>
              We use software, including AI, to help draft plain-language
              summaries. It is the{" "}
              <b>most constrained part of the process, not the most trusted.</b>{" "}
              It works from a single source document, follows fixed rules, and
              never publishes on its own. A person reviews its output before
              anything reaches a reader.
            </p>
            <div className={styles.note}>
              <svg viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>
                In short: the software does not decide what is true. It reads one
                official document and restates it in plainer language. A person
                then checks that restatement against the original and can hold or
                reject it.{" "}
                <b>
                  The source is the authority. The person is responsible. The
                  software never has the last word.
                </b>
              </span>
            </div>
            <p className={styles.p} style={{ marginTop: 16 }}>
              <b>Select each stage to see what happens</b>, including what the
              software may and may not do.
            </p>
            <div className={styles.pipeline}>
              <div className={styles.pipeStages}>
                {STAGES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className={`${styles.stage} ${styles[s.cls]}`}
                    aria-pressed={selectedStage === s.key}
                    onClick={() => setSelectedStage(s.key)}
                  >
                    <div className={styles.snum}>{s.num}</div>
                    <div className={styles.sic}>{s.icon}</div>
                    <h4>{s.heading}</h4>
                    <div className={styles.scap}>{s.cap}</div>
                    <span className={styles.strust}>{s.trust}</span>
                  </button>
                ))}
              </div>
              <div className={styles.stageDetail} id="stageDetail">
                <div
                  className={styles.sdTag}
                  style={{ color: `var(--${detail.color})` }}
                >
                  {detail.tag}
                </div>
                <h3>{detail.detailTitle}</h3>
                <p>{detail.body}</p>
              </div>
            </div>
          </section>

          {/* ===== #rules — The drafting rules ===== */}
          <section id="rules" className={styles.section}>
            <div className={styles.sectitle}>
              <span className={styles.si} style={{ background: "var(--slatetint)" }}>
                <svg viewBox="0 0 24 24" style={{ stroke: "var(--slate)" }}>
                  <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </span>
              <h2 className="serif">The drafting rules</h2>
            </div>
            <p className={styles.lead}>
              These are the instructions the drafting step operates under — what
              it must always do, and what it must never do. Because every
              published item links to its source, a reader can check whether we
              followed them.
            </p>
            <div className={styles.rules}>
              <div className={`${styles.rulecard} ${styles.always}`}>
                <h4>
                  <svg viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Always
                </h4>
                <ul>
                  <li>Use only the single source document provided.</li>
                  <li>Reproduce every vote, name, number, and date exactly.</li>
                  <li>Write plainly, at a general reading level.</li>
                  <li>
                    Flag anything unclear for human review rather than resolving
                    it.
                  </li>
                  <li>Keep the neutral, factual voice of a public record.</li>
                </ul>
              </div>
              <div className={`${styles.rulecard} ${styles.never}`}>
                <h4>
                  <svg viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                  Never
                </h4>
                <ul>
                  <li>Add a fact, name, or number not in the source.</li>
                  <li>State or imply whether a decision was good, wise, or popular.</li>
                  <li>Describe anyone&apos;s motive or intent.</li>
                  <li>Characterize a vote or a person.</li>
                  <li>Resolve ambiguity by inventing detail.</li>
                </ul>
              </div>
            </div>

            {/* behavior 3: native <details> collapsible prompt */}
            <details className={styles.disclose}>
              <summary>
                <span className={styles.di}>
                  <svg viewBox="0 0 24 24">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m0 8v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3m0-8V5a2 2 0 0 0-2-2h-3M9 12h6" />
                  </svg>
                </span>
                <span>
                  View the representative drafting prompt
                  <span className={styles.dsub}>
                    The full instruction the drafting step runs under, in plain
                    text
                  </span>
                </span>
                <svg className={styles.chev} viewBox="0 0 24 24">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </summary>
              <div className={styles.promptbox}>
                <div className={styles.pbh}>
                  <span className={styles.dot} />
                  <b>Representative drafting prompt</b>
                  <span className={styles.ts}>as of Jul 2026 · refined over time</span>
                </div>
                <pre>
                  <span className={styles.pc}>{`# A representative version of the instruction the drafting step
# runs under. Exact wording is refined as we learn; the rules
# above are the stable substance, and are what we hold to.`}</span>
                  {`

You are a neutral clerk. You will be given `}
                  <span className={styles.pk}>{`ONE official public
document`}</span>
                  {` (an agenda, minutes, notice, or report) from a single
local-government body.

Restate it in plain, accessible language so any resident can
understand what happened. Follow these rules without exception:

`}
                  <span className={styles.pk}>SOURCE:</span>
                  {`    Use ONLY the text of the provided document. If a fact
           is not in it, it does not exist for this task.
`}
                  <span className={styles.pk}>PRESERVE:</span>
                  {`  Reproduce every vote, tally, name, dollar amount, and
           date exactly. Do not round, infer, or restate them.
`}
                  <span className={styles.pk}>NEUTRAL:</span>
                  {`   Describe only what happened. Never state or imply
           whether it was good, bad, wise, or popular. Never
           describe motives. Never characterize any person.
`}
                  <span className={styles.pk}>UNCERTAIN:</span>
                  {` If the document is ambiguous or incomplete, say so
           plainly and flag it for human review. Do not guess.
`}
                  <span className={styles.pk}>FORMAT:</span>
                  {`    Return the plain-language summary and a list of every
           fact used, each tied to where it appears in the source.

You do not decide what is true. A person will check your output
against the source and may reject it. Write accordingly.`}
                </pre>
                <div className={styles.promptnote}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  </svg>
                  <span>
                    We publish the substance, timestamped, rather than a live
                    copy of a string we adjust over time; a stale &ldquo;exact
                    prompt&rdquo; would be less accurate, not more. The rules
                    above govern the output, and the human review and source link
                    are what enforce them.
                  </span>
                </div>
              </div>
            </details>

            <div className={styles.ctarow} style={{ marginTop: 20 }}>
              <Link className="btn primary" href="/app">
                See it in the app
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link className="btn ghost" href="/trust">
                Read trust &amp; security
              </Link>
            </div>
          </section>

          {/* ===== #corrections — When we get something wrong ===== */}
          <section id="corrections" className={styles.section}>
            <div className={styles.sectitle}>
              <span className={styles.si}>
                <svg viewBox="0 0 24 24">
                  <path d="M3 7v6h6M21 17v-6h-6" />
                  <path d="M21 7a9 9 0 0 0-15-3M3 17a9 9 0 0 0 15 3" />
                </svg>
              </span>
              <h2 className="serif">When we get something wrong</h2>
            </div>
            <p className={styles.lead}>
              We will, at times. How a project handles its errors says more than
              any claim of accuracy, so we treat corrections as a defined
              process, not an exception.{" "}
              <b>The source always takes precedence over our summary</b> — which
              is why the link stays attached to every item.
            </p>
            <div className={styles.corrsteps}>
              <div className={styles.cstep}>
                <div className={styles.cn}>1</div>
                <div className={styles.cc}>
                  <b>Anyone can flag it — down to the specific point</b>
                  <p>
                    Every published item links to its source and lets you flag
                    the exact point that looks wrong, shown beside the source it
                    comes from. You don&apos;t need an account, and you don&apos;t
                    need to be the person affected.
                  </p>
                </div>
              </div>
              <div className={styles.cstep}>
                <div className={styles.cn}>2</div>
                <div className={styles.cc}>
                  <b>We check it against the document</b>
                  <p>
                    We compare the summary to the official source. If the summary
                    doesn&apos;t match the record, it&apos;s wrong — regardless
                    of who raised it, including an official.
                  </p>
                </div>
              </div>
              <div className={styles.cstep}>
                <div className={styles.cn}>3</div>
                <div className={styles.cc}>
                  <b>We log the outcome either way</b>
                  <p>
                    If the summary doesn&apos;t match the record, we fix it and
                    record the correction. If it does match, the entry says so —
                    &ldquo;checked against the source; stands.&rdquo; Both
                    outcomes are visible, because a record that shows its checks
                    is worth more than one that only shows its fixes.
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.money} id="verification-log">
              <div className={styles.mhead}>
                <h4>The verification log</h4>
                <span className={styles.updated}>Public from day one</span>
              </div>
              <div className={styles.mrow}>
                <div className={styles.ml}>
                  <b>No entries yet.</b>
                  <span>
                    When something is flagged, the outcome appears here —
                    &ldquo;checked against the source; corrected&rdquo; or
                    &ldquo;checked against the source; stands&rdquo; — with a link
                    to the document that decided it. An empty log means nothing
                    has been flagged yet, not that nothing gets checked.
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.note}>
              <svg viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span>
                This rule applies to everyone equally. An official who believes a
                summary is wrong uses the same process, against a record that
                neither they nor Commonwealth control — they can point to the
                source, not quietly change it.
              </span>
            </div>
            <div className={styles.ctarow} style={{ marginTop: 20 }}>
              <Link className="btn primary" href="/app">
                See it in the app
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link className="btn ghost" href="/trust">
                Read trust &amp; security
              </Link>
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
