"use client";

/* ============================================================================
   FollowButton — follow/unfollow a topic (Phase 3).
   ----------------------------------------------------------------------------
   Toggles a topic through the shared store (src/lib/follows.ts) on the same
   localStorage key the Settings page uses, so a follow set in the app shows up
   in Settings and the reverse. aria-pressed tracks the state; changing it
   shows a toast.

   Hydration: the first render (server + client) shows "Follow" so the markup
   matches; a mount effect reads the real stored state and subscribes, so a
   change made anywhere (another card, Settings, another tab) stays reflected.
   ========================================================================== */

import { useEffect, useState } from "react";
import { isFollowing, subscribe, toggleFollow } from "@/src/lib/follows";
import { useAppShell } from "./AppShell";
import { IconCheck, IconPlus } from "./icons";

export default function FollowButton({ topic }: { topic: string }) {
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

  return (
    <button className="followbtn" aria-pressed={on} onClick={onClick}>
      {on ? <IconCheck /> : <IconPlus />}
      {on ? "Following" : "Follow"}
    </button>
  );
}
