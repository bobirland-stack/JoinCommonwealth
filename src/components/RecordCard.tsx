/* ============================================================================
   RecordCard — a sourced content card (Phase 3).
   ----------------------------------------------------------------------------
   The plain card used for the digest feed: a source marker and an optional
   follow button on top, then the title and body. An optional short tag kicker
   is shown when provided. Every card is sourced; the marker is what carries the
   provenance and the sample label.
   ========================================================================== */

import type { Source } from "@/data/towns/schema";
import SourceMarker from "./SourceMarker";
import FollowButton from "./FollowButton";

interface RecordCardProps {
  source: Source;
  title: string;
  body: string;
  /** Followable topic id; when set, a follow button appears on the card. */
  topic?: string;
  /** Honey "Happening" marker variant instead of "From the record". */
  happening?: boolean;
  /** Adds the "Drafted" row to the source panel. */
  drafted?: boolean;
  /** Optional short kicker above the title. */
  tag?: string;
}

export default function RecordCard({
  source,
  title,
  body,
  topic,
  happening,
  drafted,
  tag,
}: RecordCardProps) {
  return (
    <div className="rec">
      <div className="rtop">
        <SourceMarker
          source={source}
          happening={happening}
          drafted={drafted}
          text={`${title}. ${body}`}
        />
        {topic && <FollowButton topic={topic} />}
      </div>
      {tag && <div className="rtag">{tag}</div>}
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  );
}
