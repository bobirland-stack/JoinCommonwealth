"use client";

/* ============================================================================
   SiteNav — the sticky top navigation shared by every marketing page.
   Brand mark + links + a mobile menu button. The mobile menu is driven by
   React state (useState), not the inline onclick from the reference HTML.
   Internal routes use next/link. There is nothing town-specific here.

   The active link is derived from the current pathname (usePathname), so each
   page marks its own nav item without threading a prop — home renders
   <SiteNav /> unchanged, /mission lights up "Mission", and so on.
   ========================================================================== */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/src/styles/site.css";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /** A nav link is active when the current route matches its href. */
  const isActive = (href: string) => pathname === href;

  return (
    <header className="nav">
      <div className="nav-in">
        <Link className="brand" href="/">
          <span className="mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
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
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <nav className={open ? "navlinks open" : "navlinks"} id="nl">
          <Link href="/mission" className={isActive("/mission") ? "active" : undefined}>
            Mission
          </Link>
          <Link href="/about" className={isActive("/about") ? "active" : undefined}>
            About
          </Link>
          <Link href="/trust" className={isActive("/trust") ? "active" : undefined}>
            Trust &amp; security
          </Link>
          <Link
            href="/transparency"
            className={isActive("/transparency") ? "active" : undefined}
          >
            Transparency
          </Link>
          <Link
            href="/get-involved"
            className={isActive("/get-involved") ? "active" : undefined}
          >
            Get involved
          </Link>
          <Link
            href="/support"
            className={isActive("/support") ? "active" : undefined}
          >
            Support
          </Link>
          <Link className="cta" href="/app">
            Open your town
          </Link>
        </nav>
      </div>
    </header>
  );
}
