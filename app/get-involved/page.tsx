/* ============================================================================
   Get involved — the Commonwealth "ways to take part" page (Phase 2d).
   ----------------------------------------------------------------------------
   A faithful conversion of the reference Get involved surface: the page header
   (eyebrow + serif h1 + lede), the three "ways to take part" cards (Show up /
   Send a comment / Take a seat) each with their detail rows and CTA, the amber
   "confirm the details" note, the dark "Stay in the loop" follow-band with its
   topic chips, and the closing "Support the record itself" section.

   Structure reuses the shared shell — SiteNav (which marks "Get involved"
   active from the pathname) and SiteFooter — rather than rebuilding the
   nav/footer from the reference markup. Shared classes (.serif, .eyebrow,
   .sec-eyebrow, .sec-title, .btn) come from the global site.css; page-specific
   classes live in get-involved.module.css.

   This page also proves the data seam (src/town.ts): the town's proper nouns,
   the Council meeting details, and the follow-band's topic chips are all read
   from the typed `town` object — never hardcoded — so a second town reskins
   this page with zero code changes.
     - Council row → the legislative body's `cadence` + `location`, plus the
       town hall address (`town.town.hall.address`).
     - Topic chips → one chip per `town.topics` entry (its `label`).
   ========================================================================== */

import Link from "next/link";
import { town } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import "@/src/styles/site.css";
import styles from "./get-involved.module.css";

/** The right-arrow used on every inline CTA in the reference. */
function Arrow() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function GetInvolvedPage() {
  const { name, hall } = town.town;

  // The Council detail reads from the data seam: the legislative body carries
  // the cadence + location; the town hall address is the town-level fact. For
  // the pilot town the body's `location` already embeds the hall street, so
  // the sentence reads exactly like the reference — the hall address surfaces
  // in the "confirm the details" note as the concrete specific worth checking.
  const council = town.bodies.find((b) => b.kind === "legislative");
  const councilWhen = council
    ? `Meets the ${council.cadence}, at ${council.location}.`
    : "Meeting time and place are posted with each agenda.";

  return (
    <>
      <SiteNav />

      <div className={styles.pageWrap}>
        <div className={styles.phead}>
          <div className="eyebrow">Get involved · {name}</div>
          <h1 className="serif">Three ways to be heard.</h1>
          <p className={styles.lede}>
            Having a say in your town is more concrete than it sounds. Here are
            the real, specific ways to take part —{" "}
            <b>show up, send a comment, or take a seat.</b>
          </p>
        </div>
      </div>

      <div className={styles.pageWrap}>
        <section className={styles.section}>
          <div className={styles.ways}>
            {/* Show up */}
            <div className={styles.way}>
              <span className={styles.wn}>
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <div className={styles.wc}>
                <div className={styles.wtag}>In person</div>
                <h3>Show up</h3>
                <p>
                  The simplest and most direct. Most bodies keep{" "}
                  <b>public comment open to any resident</b> — you don&apos;t
                  need to sign up in advance, and you don&apos;t need to be an
                  expert. A few plain sentences about how something affects you
                  carries real weight.
                </p>
                <div className={styles.detail}>
                  <div className={styles.dl}>
                    <span className={styles.k}>Council</span>
                    <span className={styles.v}>{councilWhen}</span>
                  </div>
                  <div className={styles.dl}>
                    <span className={styles.k}>Boards</span>
                    <span className={styles.v}>
                      Planning Commission, ZBA and others post their own agendas
                      and comment times.
                    </span>
                  </div>
                  <div className={styles.dl}>
                    <span className={styles.k}>Tip</span>
                    <span className={styles.v}>
                      Comment is usually near the start — arrive a few minutes
                      early and fill out a card if one&apos;s offered.
                    </span>
                  </div>
                </div>
                <Link className={styles.wcta} href="/app">
                  See upcoming meetings on the calendar
                  <Arrow />
                </Link>
              </div>
            </div>

            {/* Send a comment */}
            <div className={styles.way}>
              <span className={styles.wn}>
                <svg viewBox="0 0 24 24">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </span>
              <div className={styles.wc}>
                <div className={styles.wtag}>In writing</div>
                <h3>Send a comment</h3>
                <p>
                  Can&apos;t make it in person? You can{" "}
                  <b>send written comment to the body through the clerk</b> ahead
                  of the meeting, and it becomes part of the official record.
                  This is often the easiest way for people with work or family
                  schedules to weigh in.
                </p>
                <div className={styles.detail}>
                  <div className={styles.dl}>
                    <span className={styles.k}>Who</span>
                    <span className={styles.v}>
                      Address it to the body (e.g. &ldquo;{name} City
                      Council&rdquo;) care of the City Clerk.
                    </span>
                  </div>
                  <div className={styles.dl}>
                    <span className={styles.k}>When</span>
                    <span className={styles.v}>
                      Send it before the meeting so it can be distributed with
                      the packet.
                    </span>
                  </div>
                  <div className={styles.dl}>
                    <span className={styles.k}>What</span>
                    <span className={styles.v}>
                      Name the agenda item, say what you&apos;d like, and why — a
                      short paragraph is plenty.
                    </span>
                  </div>
                </div>
                <Link className={styles.wcta} href="/app">
                  Find the item &amp; who to contact
                  <Arrow />
                </Link>
              </div>
            </div>

            {/* Take a seat */}
            <div className={styles.way}>
              <span className={styles.wn}>
                <svg viewBox="0 0 24 24">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4" />
                </svg>
              </span>
              <div className={styles.wc}>
                <div className={styles.wtag}>On a board</div>
                <h3>Take a seat</h3>
                <p>
                  Much of a town&apos;s real work happens on its{" "}
                  <b>boards and commissions</b> — planning, zoning, parks, and
                  more. Seats are volunteer, usually a few years, and towns are{" "}
                  <b>frequently looking to fill them.</b> It&apos;s one of the
                  highest-leverage, lowest-visibility ways to shape where you
                  live.
                </p>
                <div className={styles.detail}>
                  <div className={styles.dl}>
                    <span className={styles.k}>How</span>
                    <span className={styles.v}>
                      Most seats are appointed — you submit a short interest form
                      or letter to the city.
                    </span>
                  </div>
                  <div className={styles.dl}>
                    <span className={styles.k}>Time</span>
                    <span className={styles.v}>
                      Typically one or two evening meetings a month, plus reading
                      the packet.
                    </span>
                  </div>
                  <div className={styles.dl}>
                    <span className={styles.k}>Start</span>
                    <span className={styles.v}>
                      Attend a meeting or two first to see what the body actually
                      does.
                    </span>
                  </div>
                </div>
                <Link className={styles.wcta} href="/app">
                  See which boards have openings
                  <Arrow />
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.note}>
            <svg viewBox="0 0 24 24">
              <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
            <span>
              Specifics like meeting times and contacts — City Hall sits at{" "}
              {hall.address} — come from {name}&apos;s public record and can
              change. <b>Always confirm the current details</b> against the
              city&apos;s official notice before you go or send.
            </span>
          </div>
        </section>

        <div className={styles.followband}>
          <div className="sec-eyebrow">Stay in the loop</div>
          <h2 className="serif">
            Follow what you care about — and we&apos;ll tell you when it moves.
          </h2>
          <p>
            The hardest part of taking part is <b>knowing in time.</b> Follow a
            topic or a body, and Commonwealth emails you when something new is
            posted to the record — an agenda drops, a decision lands, a comment
            window opens.
          </p>
          <div className={styles.chips}>
            {town.topics.map((topic) => (
              <span className={styles.chip} key={topic.id}>
                <svg viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {topic.label}
              </span>
            ))}
          </div>
          <p className={styles.fine}>
            A pointer, not a profile — you choose what to follow, and we never
            guess it from what you read.
          </p>
          <div className={styles.ctarow}>
            <Link className="btn light" href="/app">
              Follow a topic
              <Arrow />
            </Link>
            <Link className={`btn ghost ${styles.btnDark}`} href="/settings">
              Manage your digest
            </Link>
          </div>
        </div>

        <section className={styles.closing}>
          <div className="sec-eyebrow">One more way</div>
          <h2 className="sec-title serif">Support the record itself.</h2>
          <p className={styles.csub}>
            Commonwealth is free for every resident because supporters keep it
            that way. Anyone can support it — no one can control it.
          </p>
          <div className={`${styles.ctarow} ${styles.center}`}>
            <Link className="btn primary" href="/about">
              How support works
              <Arrow />
            </Link>
            <Link className="btn ghost" href="/app">
              Open your {name}
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </>
  );
}
