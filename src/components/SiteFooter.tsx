/* ============================================================================
   SiteFooter — the footer shared by every marketing page. Brand blurb, three
   link columns, and the honesty / "not affiliated" line.

   The honesty line reads the town name from the data seam (town.town.name) so
   it is correct for any town — a second town reskins it with zero edits here.
   Internal routes use next/link.
   ========================================================================== */

import Link from "next/link";
import { town } from "@/src/town";
import NewsletterSignup from "@/src/components/NewsletterSignup";
import "@/src/styles/site.css";

export default function SiteFooter() {
  return (
    <footer>
      <div className="foot-in">
        <div className="foot-brand">
          <Link className="brand" href="/">
            <span className="mark">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
              </svg>
            </span>
            <b>Commonwealth</b>
          </Link>
          <p>
            A free, nonprofit way to understand the place you live, built on the
            public record.
          </p>
          <div style={{ marginTop: 14 }}>
            <span className="pill">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              </svg>
              Nonprofit · independent
            </span>
          </div>
          <div style={{ marginTop: 20, maxWidth: 320 }}>
            <NewsletterSignup variant="footer" />
          </div>
        </div>

        <div className="foot-col">
          <h5>The app</h5>
          <Link href="/app">Open your town</Link>
          <Link href="/get-involved">Get involved</Link>
          <Link href="/settings">Settings</Link>
        </div>

        <div className="foot-col">
          <h5>About</h5>
          <Link href="/mission">Mission</Link>
          <Link href="/about">About us</Link>
          <Link href="/trust">Trust &amp; security</Link>
          <Link href="/transparency">Transparency</Link>
        </div>

        <div className="foot-col">
          <h5>Take part</h5>
          <Link href="/get-involved">Ways to be heard</Link>
          <Link href="/app">Follow a topic</Link>
          <Link href="/about">Support it</Link>
        </div>
      </div>

      <div className="foot-bottom">
        <div className="fb-in">
          <p className="disc">
            Commonwealth mirrors the public record and is{" "}
            <b>not affiliated with the City of {town.town.name}</b>. Content is
            real {town.town.name} data where noted; sample items are labeled.
          </p>
          <p>© 2026 Commonwealth</p>
        </div>
      </div>
    </footer>
  );
}
