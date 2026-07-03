"use client";

/* ============================================================================
   InstitutionStreamChip — follow/unfollow one institution stream (Phase 9).
   ----------------------------------------------------------------------------
   A resident follows an institution's streams one at a time: "library:events"
   is independent of "library:booksales". This chip toggles a single stream
   through the shared store (src/lib/follows.ts) on the SAME localStorage key
   the topic follows use, so nothing forks the storage.

   It reuses the You tab's follow-chip pattern (.fchip) but adds a small leading
   building glyph (.istream) so a resident can tell an institution-stream chip
   apart from a topic-follow chip. The store binding is shared, not copied.

   Hydration matches the app's other client chips: the first render shows the
   not-following state so server and client markup agree, then a mount effect
   reads the stored state and subscribes for changes made anywhere.
   ========================================================================== */

import { useEffect, useState } from "react";
import {
  isFollowingStream,
  subscribe,
  toggleFollowStream,
} from "@/src/lib/follows";
import { useAppShell } from "./AppShell";
import { IconMark } from "./icons";

interface InstitutionStreamChipProps {
  institutionId: string;
  streamId: string;
  /** Visible label, e.g. "Blair Memorial Library · Events & programs". */
  label: string;
}

export default function InstitutionStreamChip({
  institutionId,
  streamId,
  label,
}: InstitutionStreamChipProps) {
  const { showToast } = useAppShell();
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(isFollowingStream(institutionId, streamId));
    sync();
    return subscribe(sync);
  }, [institutionId, streamId]);

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFollowing = isFollowingStream(institutionId, streamId);
    toggleFollowStream(institutionId, streamId);
    showToast(
      wasFollowing ? "Unfollowed" : "Following. You'll hear when it changes",
    );
  };

  return (
    <button className="fchip istream" aria-pressed={on} onClick={onClick}>
      <span className="imk" aria-hidden="true">
        <IconMark />
      </span>
      {label}
      <svg
        className={on ? "state" : "state plus"}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {on ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 5v14M5 12h14" />}
      </svg>
    </button>
  );
}
