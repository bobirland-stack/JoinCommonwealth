"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The resident app's five-tab bottom bar (Phase 1 shell). Tabs are structural
 * only — the surfaces they point at are placeholders until Phase 3/4.
 */
const TABS: { href: string; label: string }[] = [
  { href: "/app", label: "Your Town" },
  { href: "/app/happening", label: "Happening" },
  { href: "/app/government", label: "Government" },
  { href: "/app/take-part", label: "Take part" },
  { href: "/app/you", label: "You" },
];

export default function BottomBar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Resident app"
      style={{
        position: "fixed",
        insetInline: 0,
        bottom: 0,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        background: "var(--card)",
        borderTop: "1px solid var(--line)",
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-current={active ? "page" : undefined}
            className="tap"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0.5rem 0.25rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              textDecoration: "none",
              color: active ? "var(--moss)" : "var(--mut)",
              fontWeight: active ? 600 : 400,
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
