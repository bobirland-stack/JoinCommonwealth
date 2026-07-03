"use client";

/* ============================================================================
   You — the resident app follow manager (Phase 4).
   ----------------------------------------------------------------------------
   What the resident follows, and where to manage it. The topic chips read and
   write through the SAME shared store (src/lib/follows.ts) that Settings and
   every FollowButton use, so a change here shows up immediately in Settings and
   on any follow button in the app, and the reverse. The chips are the "chip"
   variant of the shared FollowButton — one store binding, no copied logic.

   The header count reflects the live follow set. Hydration matches the app's
   other client surfaces: the first render (server + client) shows the empty
   state so the markup agrees, then a mount effect reads the stored follows and
   subscribes for changes.

   Topics render from town.topics. The "Manage" links point at the real routes:
   /settings for digest and privacy, /trust for trust & security.
   ========================================================================== */

import { useEffect, useState } from "react";
import Link from "next/link";
import { town } from "@/src/town";
import { getSettings, subscribe } from "@/src/lib/follows";
import FollowButton from "@/src/components/FollowButton";

export default function YouPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getSettings().follows.length);
    sync();
    return subscribe(sync);
  }, []);

  const following = count > 0;

  return (
    <main className="view">
      <div className="hi">You</div>
      <div className="h1 serif">Your Commonwealth.</div>
      <div className="sub">
        What you follow, and where to manage it. You choose it yourself. We never
        guess it from what you read.
      </div>

      <div className="youhead">
        <div className="yn">{following ? "🔔" : "👋"}</div>
        <h3>
          {following
            ? `You're following ${count} topic${count > 1 ? "s" : ""}`
            : "Follow what matters to you"}
        </h3>
        <p>
          {following
            ? "We'll email you when any of these show up in the record."
            : "Tap a topic below and we'll tell you when something new is posted."}
        </p>
      </div>

      <div className="section-h">
        <h2>Topics &amp; bodies</h2>
        <span className="ln" />
      </div>
      <div className="follow-grid">
        {town.topics.map((t) => (
          <FollowButton key={t.id} topic={t.id} variant="chip" label={t.label} />
        ))}
      </div>

      <div className="section-h">
        <h2>Manage</h2>
        <span className="ln" />
      </div>

      <Link className="linkrow" href="/settings">
        <svg className="li" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
        <div className="lt">
          <b>Your digest</b>
          <span>Your newsletter email and how it reaches you</span>
        </div>
        <svg className="ch" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>

      <Link className="linkrow" href="/settings">
        <svg className="li" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <div className="lt">
          <b>Privacy &amp; your data</b>
          <span>Export or delete anytime. You&apos;re never the product</span>
        </div>
        <svg className="ch" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>

      <Link className="linkrow" href="/trust">
        <svg className="li" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
        <div className="lt">
          <b>Trust &amp; security</b>
          <span>How this stays neutral and safe</span>
        </div>
        <svg className="ch" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
    </main>
  );
}
