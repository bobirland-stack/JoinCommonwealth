"use client";

/* ============================================================================
   SiteNav — the sticky top navigation shared by every marketing page.
   Brand mark + links + a mobile menu button. The mobile menu is driven by
   React state (useState), not the inline onclick from the reference HTML.
   Internal routes use next/link. There is nothing town-specific here.
   ========================================================================== */

import { useState } from "react";
import Link from "next/link";
import "@/src/styles/site.css";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="nav-in">
        <Link className="brand" href="/">
          <span className="mark">
            <svg viewBox="0 0 24 24">
              <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
            </svg>
          </span>
          <b>Commonwealth</b>
        </Link>

        <button
          className="menubtn"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <nav className={open ? "navlinks open" : "navlinks"} id="nl">
          <Link href="/mission">Mission</Link>
          <Link href="/about">About</Link>
          <Link href="/trust">Trust &amp; security</Link>
          <Link href="/transparency">Transparency</Link>
          <Link href="/get-involved">Get involved</Link>
          <Link className="cta" href="/app">
            Open your town
          </Link>
        </nav>
      </div>
    </header>
  );
}
