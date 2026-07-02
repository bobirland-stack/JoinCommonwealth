/* ============================================================================
   Home — the Commonwealth marketing home page (Phase 2a).
   ----------------------------------------------------------------------------
   A faithful conversion of the reference home surface: hero, the "from the
   record" strip, how-it-works steps, audiences, the dark trust band, the
   independence line, the final CTA, and the footer.

   Every town-specific string (town name, state, and the record cards) is read
   from the data seam (src/town.ts) — never hardcoded — so a second town
   reskins this page with zero code changes. In particular, the "From the
   record · this week" strip is rendered from `town.digest`: this is the page
   proving the seam works, not just that the layout renders.
   ========================================================================== */

import Link from "next/link";
import { town } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import "@/src/styles/site.css";

/** Format an ISO (YYYY-MM-DD) date as e.g. "Feb 1, 2026" (UTC, no TZ drift). */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/**
 * The three cards in the record strip come straight from the town record:
 * the "From the record" digest entries, most recent first. (The strip is
 * headed "From the record", so it shows those entries — not "Happening" ones.)
 */
const recordCards = town.digest
  .filter((d) => d.tag === "From the record")
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .slice(0, 3);

/** Where a digest card links: water items go to the water page, else the app. */
const cardHref = (topic: string) => (topic === "water" ? "/water" : "/app");

export default function HomePage() {
  return (
    <>
      <SiteNav />

      <div className="hero">
        <div className="eyebrow">
          {town.town.name}, {town.town.state}
        </div>
        <h1 className="serif">Know the place you live.</h1>
        <p className="lede">
          Commonwealth is a free, nonprofit way to follow your own town — what&apos;s
          happening, the decisions that shape it, and how to take part.{" "}
          <b>Built on the public record. Answerable only to residents.</b>
        </p>
        <div className="herocta">
          <Link className="btn primary" href="/app">
            Open your {town.town.name}
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link className="btn ghost" href="/mission">
            Why we built this
          </Link>
        </div>
        <div className="trustline">
          <svg viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          </svg>
          No ads. No data sold. A person stands behind every recap.
        </div>

        {/* live record strip — wired to town.digest via the data seam */}
        <div className="record" aria-label="From the public record">
          <div className="record-head">
            <span className="dot"></span>
            <span className="rl">From the record · this week</span>
            <span className="live">{town.town.name} public record</span>
          </div>
          <div className="rgrid">
            {recordCards.map((entry) => (
              <Link
                key={entry.id}
                className="rcard"
                href={cardHref(entry.topic)}
              >
                <span className="prov">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {entry.tag}
                </span>
                <h4>{entry.title}</h4>
                <p>{entry.note}</p>
                <div className="when">
                  {entry.source.label} · {formatDate(entry.source.date)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* how it works */}
      <section>
        <div className="wrap">
          <div className="sec-eyebrow">How it works</div>
          <h2 className="sec-title serif">
            The record comes first. A person stands behind it.
          </h2>
          <p className="sec-sub">
            Commonwealth doesn&apos;t generate the news. It reads what your local
            government already produces, and makes it something you can actually
            follow — without ever deciding what&apos;s good, wise, or popular.
          </p>
          <div className="steps">
            <div className="stepcard">
              <div className="sn">01</div>
              <div className="si">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 13h6M9 17h4" />
                </svg>
              </div>
              <h3>It starts with the real record</h3>
              <p>
                Agendas, minutes, roll-call votes, budgets, public notices —{" "}
                <span className="keyword">
                  the official record your town already produces.
                </span>{" "}
                Every item links back to its source.
              </p>
            </div>
            <div className="stepcard">
              <div className="sn">02</div>
              <div className="si">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </div>
              <h3>A person stands behind every recap</h3>
              <p>
                Software drafts a plain-language summary;{" "}
                <span className="keyword">
                  a trained reviewer checks every fact against the source — or
                  holds it.
                </span>{" "}
                Nothing publishes on a machine&apos;s say-so.
              </p>
            </div>
            <div className="stepcard">
              <div className="sn">03</div>
              <div className="si">
                <svg viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 22V12h6v10" />
                </svg>
              </div>
              <h3>Your whole town, in one place</h3>
              <p>
                What the council decided, what the library and schools are up to,
                the events worth showing up for —{" "}
                <span className="keyword">alongside the ways to take part.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* audiences */}
      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="sec-eyebrow">Who it&apos;s for</div>
          <h2 className="sec-title serif">
            A whole town — not just the people already paying attention.
          </h2>
          <div className="aud">
            <div className="audcard">
              <span className="ai">
                <svg viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
                </svg>
              </span>
              <div>
                <h4>Residents</h4>
                <p>
                  Keep up with your town, understand a decision, see how your
                  representatives voted, and find the ways to take part.
                </p>
              </div>
            </div>
            <div className="audcard">
              <span className="ai">
                <svg viewBox="0 0 24 24">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M10 9h.01M14 9h.01M10 13h.01M14 13h.01" />
                </svg>
              </span>
              <div>
                <h4>Local institutions &amp; nonprofits</h4>
                <p>
                  The library, the senior center, the food pantry, the schools —
                  a clear way to reach the residents who rely on them.
                </p>
              </div>
            </div>
            <div className="audcard">
              <span className="ai">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <div>
                <h4>Local government</h4>
                <p>
                  A way for a city to get its own record — notices, decisions,
                  votes — to residents in plain language. Commonwealth carries
                  it; the city keeps its voice.
                </p>
              </div>
            </div>
            <div className="audcard">
              <span className="ai">
                <svg viewBox="0 0 24 24">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
              </span>
              <div>
                <h4>Supporters &amp; funders</h4>
                <p>
                  People and foundations who believe a community should be able
                  to see itself clearly — and who keep it free for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* trust band */}
      <div className="trustband">
        <div className="wrap">
          <div className="sec-eyebrow">Why you can trust it</div>
          <h2 className="sec-title serif">
            A plain account is only worth something if people can trust it.
          </h2>
          <p className="sec-sub">
            So Commonwealth&apos;s independence isn&apos;t a promise — it&apos;s built into how
            it works.
          </p>
          <div className="pillars">
            <div className="pillar">
              <div className="pi">
                <svg viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
                </svg>
              </div>
              <h4>It answers to residents</h4>
              <p>
                A nonprofit, independent from the governments it covers. No
                supporter, funder, or city decides what&apos;s covered — or can change
                it.
              </p>
            </div>
            <div className="pillar">
              <div className="pi">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7Zm10 0-3 7h6l-3-7Z" />
                </svg>
              </div>
              <h4>It reports, never editorializes</h4>
              <p>
                It explains what happened — never whether it was good, wise, or
                popular. No endorsements, no scores, no sides.
              </p>
            </div>
            <div className="pillar">
              <div className="pi">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h4>Support funds independence</h4>
              <p>
                Every gift keeps the record free and independent. Supporters are
                named and thanked — never given a say in coverage.
              </p>
            </div>
          </div>
          <div className="more">
            <Link href="/trust">
              Read how trust &amp; security work
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* independence line */}
      <div className="independence">
        <div className="wrap">
          <p className="q serif">
            Anyone can support it. <b>No one can control it.</b>
          </p>
          <p className="sub">The same idea, whichever door you came in.</p>
        </div>
      </div>

      {/* final cta */}
      <div className="wrap">
        <div className="finalcta">
          <h2 className="serif">See your town clearly.</h2>
          <p>
            Open Commonwealth for {town.town.name} — what&apos;s happening, what&apos;s
            being decided, and how to be part of it.
          </p>
          <div className="fcbtns">
            <Link className="btn primary" href="/app">
              Open your {town.town.name}
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link className="btn ghost" href="/get-involved">
              Find a way to take part
            </Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
