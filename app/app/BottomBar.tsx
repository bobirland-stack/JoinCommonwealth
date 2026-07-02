"use client";

/* ============================================================================
   BottomBar — the resident app's five-tab bottom bar.
   ----------------------------------------------------------------------------
   Upgraded from the Phase 1 structural shell to match the reference tab bar:
   an icon over a label per tab, the current route marked with aria-current,
   arrow-key movement between tabs, and 44px+ targets (the CSS gives 60px).

   Each tab is a real route (Link), so the reference's show() view-swapping is
   just navigation here. The bar is fixed and centered to the 600px app column
   (see .tabbar in app.css) so it never stretches full-width on desktop.
   ========================================================================== */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { town } from "@/src/town";
import {
  IconTabCalendar,
  IconTabGov,
  IconTabHome,
  IconTabTake,
  IconTabYou,
} from "@/src/components/icons";

interface Tab {
  href: string;
  label: string;
  icon: ReactNode;
}

/** The "Your {town}" label comes from the data seam, never a hardcoded town. */
const TABS: Tab[] = [
  { href: "/app", label: `Your ${town.town.name}`, icon: <IconTabHome /> },
  { href: "/app/happening", label: "Happening", icon: <IconTabCalendar /> },
  { href: "/app/government", label: "Government", icon: <IconTabGov /> },
  { href: "/app/take-part", label: "Take part", icon: <IconTabTake /> },
  { href: "/app/you", label: "You", icon: <IconTabYou /> },
];

export default function BottomBar() {
  const pathname = usePathname();
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  // Left/Right arrow keys move focus between tabs (roving, mirrors reference).
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : TABS.length - 1;
    const next = linkRefs.current[(i + dir) % TABS.length];
    next?.focus();
  };

  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map((tab, i) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            aria-current={active ? "page" : undefined}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
