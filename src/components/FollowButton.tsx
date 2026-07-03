"use client";

/* ============================================================================
   FollowButton — follow/unfollow a topic (Phase 3, extended Phase 4).
   ----------------------------------------------------------------------------
   Toggles a topic through the shared store (src/lib/follows.ts) on the same
   localStorage key the Settings page uses, so a follow set in the app shows up
   in Settings and the reverse. aria-pressed tracks the state; changing it
   shows a toast.

   Two visual variants share ONE store binding (no copy-pasted follow logic):
     - "button" (default): the compact "Follow" / "Following" pill used on
       cards, thread headers, and body cards.
     - "chip": the wider labeled chip the You tab's follow manager uses, showing
       the topic's own label. Pass `label` for this variant.

   Hydration: the first render (server + client) shows the not-following state so
   the markup matches; a mount effect reads the real stored state and subscribes,
   so a change made anywhere (another card, Settings, another tab, the You tab)
   stays reflected.
   ========================================================================== */

import { useEffect, useState } from "react";
import { isFollowing, subscribe, toggleFollow } from "@/src/lib/follows";
import { useAppShell } from "./AppShell";
import { IconCheck, IconPlus } from "./icons";

interface FollowButtonProps {
  topic: string;
  /** "button" (compact pill) or "chip" (labeled chip for the You manager). */
  variant?: "button" | "chip";
  /** The chip's visible label (e.g. the topic label). Ignored for "button". */
  label?: string;
}

export default function FollowButton({
  topic,
  variant = "button",
  label,
}: FollowButtonProps) {
  const { showToast } = useAppShell();
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isFollowing(topic));
    sync();
    return subscribe(sync);
  }, [topic]);

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFollowing = isFollowing(topic);
    toggleFollow(topic);
    showToast(
      wasFollowing ? "Unfollowed" : "Following. You'll hear when it changes",
    );
  };

  if (variant === "chip") {
    // The plus glyph gets the muted `.plus` treatment when not following.
    return (
      <button className="fchip" aria-pressed={on} onClick={onClick}>
        <svg
          className={on ? undefined : "plus"}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {on ? (
            <path d="M20 6 9 17l-5-5" />
          ) : (
            <path d="M12 5v14M5 12h14" />
          )}
        </svg>
        {label}
      </button>
    );
  }

  return (
    <button className="followbtn" aria-pressed={on} onClick={onClick}>
      {on ? <IconCheck /> : <IconPlus />}
      {on ? "Following" : "Follow"}
    </button>
  );
}
