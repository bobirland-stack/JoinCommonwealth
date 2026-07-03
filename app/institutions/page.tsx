"use client";

/* ============================================================================
   Town institutions — the resident-facing institutions page (Phase 9).
   ----------------------------------------------------------------------------
   The library, the historical society, the senior center, and the downtown
   authority, each with a short profile and the specific streams a resident can
   follow. It is a static, non-tab page reached by a link from the Your Town
   tab, not a sixth item in the bottom tab bar. It lives in the marketing/shell
   layer like /settings: SiteNav on top, SiteFooter below, its own toast.

   Every institution and every followable stream reads from the data seam
   (src/town.ts); nothing is hardcoded to Clawson, so the page reskins for any
   town. Following a stream writes to the SAME shared store and localStorage key
   the topic follows use (src/lib/follows.ts), in its own institutionFollows
   list. Each stream is followed on its own; it is never all-or-nothing.

   This is the resident-facing half only. There is no institution-facing posting
   or console tool here; that is a separate, later, different-audience feature.

   Hydration: the first render (server + client) shows the empty follow state so
   the markup agrees, then a mount effect loads the stored follows and subscribes
   for changes made anywhere else in the app.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { town } from "@/src/town";
import SiteNav from "@/src/components/SiteNav";
import SiteFooter from "@/src/components/SiteFooter";
import {
  type Settings,
  defaultSettings,
  getSettings,
  subscribe,
  streamKey,
  toggleFollowStream,
} from "@/src/lib/follows";
import "@/src/styles/site.css";
import styles from "./institutions.module.css";

export default function InstitutionsPage() {
  // Start from empty defaults so SSR and first client render agree; the mount
  // effect swaps in the real stored settings and keeps them in sync.
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  useEffect(() => {
    setSettings(getSettings());
    const unsub = subscribe(setSettings);
    return () => {
      unsub();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const following = (institutionId: string, streamId: string) =>
    settings.institutionFollows.includes(streamKey(institutionId, streamId));

  const onToggle = (institutionId: string, streamId: string, label: string) => {
    const wasFollowing = following(institutionId, streamId);
    setSettings(toggleFollowStream(institutionId, streamId));
    showToast(
      wasFollowing
        ? `Unfollowed ${label}`
        : `Following ${label}. You'll hear when it changes`,
    );
  };

  return (
    <>
      <SiteNav />

      <div className={styles.wrap}>
        <div className={styles.phead}>
          <Link className={styles.back} href="/app">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Your {town.town.name}
          </Link>
          <div className="eyebrow">Town institutions</div>
          <h1 className="serif">The places that keep {town.town.name} going.</h1>
          <p className={styles.lede}>
            Your library, historical society, senior center, and downtown. Follow
            just the parts you care about. You can follow one stream from a place
            without following the rest.
          </p>
        </div>

        {town.institutions.map((inst) => (
          <section className={styles.card} key={inst.id}>
            <div className={styles.chead}>
              <span className={styles.icon}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
                </svg>
              </span>
              <div className={styles.htext}>
                <div className={styles.name}>{inst.name}</div>
                <span className={styles.kind}>{inst.kind}</span>
              </div>
            </div>

            <p className={styles.summary}>{inst.summary}</p>

            {inst.address && (
              <div className={styles.addr}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 22s8-4 8-10a8 8 0 1 0-16 0c0 6 8 10 8 10Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                {inst.address}
              </div>
            )}

            <div className={styles.streamsHead}>What you can follow</div>
            <div className={styles.streams}>
              {inst.streams.map((s) => {
                const on = following(inst.id, s.id);
                return (
                  <div className={styles.stream} key={s.id}>
                    <button
                      className={styles.chip}
                      aria-pressed={on}
                      onClick={() => onToggle(inst.id, s.id, s.label)}
                    >
                      <span className={styles.mk} aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />
                        </svg>
                      </span>
                      {s.label}
                      <span className={styles.state} aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          {on ? (
                            <path d="M20 6 9 17l-5-5" />
                          ) : (
                            <path d="M12 5v14M5 12h14" />
                          )}
                        </svg>
                      </span>
                    </button>
                    <p className={styles.streamDesc}>{s.description}</p>
                  </div>
                );
              })}
            </div>

            <div className={styles.prov}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              From the record: <b>{inst.source.label}</b>
              {inst.source.date ? ` · ${inst.source.date}` : ""}
            </div>
          </section>
        ))}

        <div className={styles.note}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>
            What you follow is yours. Manage it anytime on the{" "}
            <Link href="/app/you">You</Link> tab, or in{" "}
            <Link href="/settings">Settings</Link>.
          </span>
        </div>

        <div className={styles.spacer} />
      </div>

      <div
        className={toast ? `${styles.toast} ${styles.on}` : styles.toast}
        role="status"
        aria-live="polite"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <span>{toast}</span>
      </div>

      <SiteFooter />
    </>
  );
}
