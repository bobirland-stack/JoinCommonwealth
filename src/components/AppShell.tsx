"use client";

/* ============================================================================
   AppShell — the resident-app shell + shared behavior (Phase 3).
   ----------------------------------------------------------------------------
   Wraps every /app route. It renders the persistent chrome (top bar, footnote,
   the "How this works" pill and bottom sheet, the toast, and the bottom tab
   bar) and provides the shared behaviors the leaf components depend on, through
   one React context:

     - showToast(msg)      a small transient message (follow changes, video
                           chips, "view original", etc.)
     - openHow()           opens the How-this-works sheet from anywhere
     - openSourceId / setOpenSourceId
                           the single-open-at-a-time coordination for the source
                           panels: opening one closes any other. Escape and an
                           outside click both close the open panel.

   The reference swapped views with a show() function and toggled the sheet /
   panels by hand with the DOM. Here the shell is one client component; each tab
   is a route rendered as {children}, and the behavior is React state.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { town } from "@/src/town";
import BottomBar from "@/app/app/BottomBar";
import SearchResults from "./SearchResults";
import {
  IconArrow,
  IconCheck,
  IconHome,
  IconMark,
  IconSearch,
  IconShieldCheck,
} from "./icons";

/* --- context -------------------------------------------------------------- */

interface AppShellValue {
  showToast: (msg: string) => void;
  openHow: () => void;
  openSourceId: string | null;
  setOpenSourceId: (id: string | null) => void;
}

const AppShellContext = createContext<AppShellValue | null>(null);

/** Access the shell's shared behaviors. Throws if used outside <AppShell>. */
export function useAppShell(): AppShellValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within <AppShell>");
  }
  return ctx;
}

/* --- provider + chrome ---------------------------------------------------- */

export default function AppShell({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState("");
  const [howOpen, setHowOpen] = useState(false);
  const [openSourceId, setOpenSourceId] = useState<string | null>(null);

  // Search: `rawQuery` is what the resident typed; `query` is the lightly
  // debounced value the results view actually runs on. A non-empty `query`
  // swaps the results view in for the active tab, in the same column.
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  // Debounce lightly (150ms) so a fast typist doesn't re-search every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery.trim()), 150);
    return () => clearTimeout(t);
  }, [rawQuery]);

  // Changing tabs (a Link in the bottom bar) clears search and returns to the
  // tab, mirroring the reference's show() clearing the query on navigation.
  useEffect(() => {
    setRawQuery("");
    setQuery("");
  }, [pathname]);

  const clearSearch = useCallback(() => {
    setRawQuery("");
    setQuery("");
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  const openHow = useCallback(() => setHowOpen(true), []);
  const closeHow = useCallback(() => setHowOpen(false), []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  /* Escape closes the sheet and any open source panel. A pointer-down outside
     a marker or its panel closes the panel (mirrors the reference). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHowOpen(false);
        setOpenSourceId(null);
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && (t.closest(".prov") || t.closest(".srcpanel"))) return;
      setOpenSourceId(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  /* Sheet focus management: move focus into the sheet on open, trap Tab inside
     it, and return focus to the pill on close. */
  useEffect(() => {
    if (!howOpen) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const focusables = () =>
      Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    sheet.addEventListener("keydown", onKey);
    return () => {
      sheet.removeEventListener("keydown", onKey);
      pillRef.current?.focus();
    };
  }, [howOpen]);

  return (
    <AppShellContext.Provider
      value={{ showToast, openHow, openSourceId, setOpenSourceId }}
    >
      <div className="app">
        {/* top bar — brand + Home, then the record search. */}
        <div className="top">
          <div className="tr">
            <span className="mark">
              <IconMark />
            </span>
            <b>Commonwealth</b>
            <Link className="home" href="/">
              <IconHome />
              Home
            </Link>
          </div>
          <label className="search">
            <IconSearch />
            <input
              type="search"
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  clearSearch();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder={`Search ${town.town.name}'s record…`}
              aria-label={`Search ${town.town.name}'s record`}
            />
          </label>
        </div>

        {query ? <SearchResults query={query} /> : children}

        <div className="footnote">
          Preview built on {town.town.name}&apos;s public record. Content is real
          where sourced. Sample items are labeled.{" "}
          <b>Not affiliated with the City of {town.town.name}.</b>
        </div>
      </div>

      <BottomBar />

      {/* toast */}
      <div
        className={toast ? "toast on" : "toast"}
        role="status"
        aria-live="polite"
      >
        <IconCheck />
        <span>{toast}</span>
      </div>

      {/* persistent "How this works" pill */}
      <button
        ref={pillRef}
        className="howpill"
        onClick={openHow}
        aria-haspopup="dialog"
        aria-expanded={howOpen}
      >
        <IconShieldCheck />
        How this works
      </button>

      {/* how-this-works sheet */}
      <div
        className={howOpen ? "howscrim on" : "howscrim"}
        onClick={closeHow}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className={howOpen ? "howsheet on" : "howsheet"}
        role="dialog"
        aria-modal="true"
        aria-label="How this works"
        inert={!howOpen}
      >
        <div className="howgrab" />
        <div className="howhd">
          <div className="hh-hi">How this works</div>
          <h2 className="serif">Every summary, in four steps.</h2>
        </div>
        <div className="howbd">
          <div className="minipipe">
            <div className="mstep s1">
              <b>The source</b>
              <span className="mtag">Authority</span>
              <p>One official public document: an agenda, minutes, a vote, or a notice.</p>
            </div>
            <div className="mstep s2">
              <b>Software drafts</b>
              <span className="mtag">Constrained</span>
              <p>Restates it in plain language under fixed rules. Nothing added.</p>
            </div>
            <div className="mstep s3">
              <b>A person reviews</b>
              <span className="mtag">Responsible</span>
              <p>Checks it against the source, and can hold or reject it.</p>
            </div>
            <div className="mstep s4">
              <b>Published</b>
              <span className="mtag">You can check</span>
              <p>With a link to the source, so you can always see for yourself.</p>
            </div>
          </div>
          <div className="howpromise">
            <b>
              The source is the authority. A person is responsible. The software
              never has the last word.
            </b>{" "}
            Tap &ldquo;From the record&rdquo; on any item to see exactly where it
            came from.
          </div>
          <div className="howcta">
            <Link className="p" href="/transparency" onClick={closeHow}>
              See full transparency
              <IconArrow />
            </Link>
            <Link className="g" href="/trust" onClick={closeHow}>
              Trust &amp; security
            </Link>
          </div>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
