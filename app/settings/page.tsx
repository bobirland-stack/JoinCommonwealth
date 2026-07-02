"use client";

/* ============================================================================
   Settings — the one FUNCTIONAL surface in the marketing/shell layer (Phase 2g).
   ----------------------------------------------------------------------------
   Unlike the other converted pages this one carries real, persisted state, so
   it is a client component. All persistence flows through the shared store in
   src/lib/follows.ts (real localStorage under `cw:settings:v1`) — the SAME
   module and key the resident app (Phase 3–4) reuses, so a follow set here
   shows up in the app and vice-versa. This page never touches localStorage or
   a town JSON directly.

   Two V1 scope changes vs. the reference (applied deliberately):
     1. The digest section is a single weekly-newsletter signup — the reference's
        Weekly/Changes/Off frequency picker and the "Urgent alerts" toggle are
        removed. There is no newsletter backend yet (that's Phase 5), so the
        email is stored locally and we say so plainly.
     2. `window.storage` (the artifact shim) is replaced by real localStorage,
        owned by the follows store.

   The follow pills are data-driven from `town.topics` (via src/town.ts), so the
   list is correct for any town — the reference's 8 hardcoded pills are gone.

   Hydration: the first render (server + client) uses empty defaults so markup
   matches; a mount effect loads the stored settings, reflects them in state,
   and applies the body classes. Because Next keeps the <body> element across
   client-side navigation, an applied bigtext/contrast class persists as you
   move between pages within a session; tokens.css owns those global rules.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { town } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import {
  type Settings,
  type Prefs,
  defaultSettings,
  getSettings,
  subscribe,
  toggleFollow,
  setEmail as storeSetEmail,
  setPref,
  clearAll,
  exportJSON,
} from "@/src/lib/follows";
import "@/src/styles/site.css";
import styles from "./settings.module.css";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Mirror the two class-backed prefs onto <body> so they take effect globally. */
function applyBodyClasses(prefs: Prefs): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("bigtext", prefs.bigtext);
  document.body.classList.toggle("contrast", prefs.contrast);
}

export default function SettingsPage() {
  // Start from empty defaults so SSR and first client render agree; the mount
  // effect swaps in the real stored settings.
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [emailInput, setEmailInput] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  // Load persisted settings on mount, apply body classes, and stay in sync with
  // any other mounted component / open tab that writes the store.
  useEffect(() => {
    const sync = (s: Settings) => {
      setSettings(s);
      setEmailInput(s.email);
      applyBodyClasses(s.prefs);
    };
    sync(getSettings());
    const unsub = subscribe(sync);
    return () => {
      unsub();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  /* --- handlers --------------------------------------------------------- */

  const onToggleFollow = (id: string, label: string) => {
    const wasFollowing = settings.follows.includes(id);
    setSettings(toggleFollow(id));
    showToast(
      wasFollowing
        ? `Unfollowed ${label}`
        : `Following ${label} — you'll hear when it changes`,
    );
  };

  const onSaveEmail = () => {
    const v = emailInput.trim();
    if (v && !EMAIL_RE.test(v)) {
      showToast("That email doesn't look right");
      return;
    }
    setSettings(storeSetEmail(v));
    showToast(v ? "Newsletter email saved" : "Email cleared");
  };

  const onTogglePref = (key: keyof Prefs) => {
    const next = setPref(key, !settings.prefs[key]);
    setSettings(next);
    applyBodyClasses(next.prefs);
  };

  const onExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commonwealth-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Your data exported");
  };

  const onDelete = () => {
    const fresh = clearAll();
    setSettings(fresh);
    setEmailInput("");
    applyBodyClasses(fresh.prefs);
    showToast("Everything deleted");
  };

  const following = (id: string) => settings.follows.includes(id);

  /* --- render ----------------------------------------------------------- */

  return (
    <>
      <SiteNav />

      <div className={styles.wrap}>
        <div className={styles.phead}>
          <div className="eyebrow">Settings</div>
          <h1 className="serif">Your Commonwealth.</h1>
          <p className={styles.lede}>
            Control what you follow, how your newsletter reaches you, and how the
            app looks. Everything here is <b>yours</b> — chosen by you, and yours
            to change, export, or delete.
          </p>
        </div>

        {/* FOLLOWS — data-driven from town.topics */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.ci}>
              <svg viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
            </span>
            <div>
              <h2>What you follow</h2>
              <p>
                Pick the topics and bodies you want to hear about. A choice, never
                a guess.
              </p>
            </div>
          </div>
          <div className={styles.follows}>
            {town.topics.map((topic) => {
              const on = following(topic.id);
              return (
                <button
                  key={topic.id}
                  className={styles.fpill}
                  aria-pressed={on}
                  onClick={() => onToggleFollow(topic.id, topic.label)}
                >
                  <span className={styles.fpIc}>
                    {on ? (
                      <svg viewBox="0 0 24 24">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                  </span>
                  {topic.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* DIGEST — simplified single weekly-newsletter signup (V1 scope) */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.ci}>
              <svg viewBox="0 0 24 24">
                <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            </span>
            <div>
              <h2>Your digest</h2>
              <p>
                Get the weekly Commonwealth digest for your town by email. One
                email a week; unsubscribe anytime.
              </p>
            </div>
          </div>
          <div className={styles.emailrow}>
            <label htmlFor="email">Email for your weekly digest</label>
            <div className={styles.emailin}>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSaveEmail();
                }}
              />
              <button className={styles.savebtn} onClick={onSaveEmail}>
                Save
              </button>
            </div>
            <p className={styles.emailnote}>
              Saved to this device for now. Signup wiring to the email service
              comes in a later phase — nothing is sent yet.
            </p>
          </div>
        </section>

        {/* READING & DISPLAY */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.ci}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </span>
            <div>
              <h2>Reading &amp; display</h2>
              <p>Make it comfortable to read. These take effect right away.</p>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rc}>
              <div className={styles.rt}>Larger text</div>
              <div className={styles.rs}>Increase the base text size across the app.</div>
            </div>
            <button
              className={styles.toggle}
              aria-pressed={settings.prefs.bigtext}
              aria-label="Larger text"
              onClick={() => onTogglePref("bigtext")}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.rc}>
              <div className={styles.rt}>Higher contrast</div>
              <div className={styles.rs}>Darken text and lines for easier reading.</div>
            </div>
            <button
              className={styles.toggle}
              aria-pressed={settings.prefs.contrast}
              aria-label="Higher contrast"
              onClick={() => onTogglePref("contrast")}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.rc}>
              <div className={styles.rt}>Reduce motion</div>
              <div className={styles.rs}>
                Minimize animations and transitions. Also follows your device
                setting.
              </div>
            </div>
            <button
              className={styles.toggle}
              aria-pressed={settings.prefs.reducemotion}
              aria-label="Reduce motion"
              onClick={() => onTogglePref("reducemotion")}
            />
          </div>
        </section>

        {/* PRIVACY */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.ci}>
              <svg viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <div>
              <h2>Privacy &amp; your data</h2>
              <p>
                You are never the product. Here&apos;s everything we keep — and
                your control over it.
              </p>
            </div>
          </div>

          <div className={styles.privacyNote}>
            <svg viewBox="0 0 24 24">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>
              We keep only what you choose to give us: the topics you follow and,
              if you added it, your newsletter email.{" "}
              <b>
                No ads, no data sold, no tracking, and we never infer your
                interests from what you read.
              </b>{" "}
              <Link href="/trust">How trust &amp; security work →</Link>
            </span>
          </div>

          <div className={styles.actions}>
            <button className={styles.btn} onClick={onExport}>
              <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export my data
            </button>
            <button
              className={`${styles.btn} ${styles.danger}`}
              onClick={onDelete}
            >
              <svg viewBox="0 0 24 24">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>
              Delete everything
            </button>
          </div>
        </section>

        <div className={styles.spacer} />
      </div>

      {/* toast */}
      <div
        className={toast ? `${styles.toast} ${styles.on}` : styles.toast}
        role="status"
        aria-live="polite"
      >
        <svg viewBox="0 0 24 24">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span>{toast}</span>
      </div>

      <SiteFooter />
    </>
  );
}
