/* ============================================================================
   SearchResults — the in-place results view for the app top-bar search (Phase 4).
   ----------------------------------------------------------------------------
   When the resident types in the top-bar search, the shell renders this in place
   of the active tab, inside the same 600px app column. It runs the pure
   searchTown() over the town record and lays each hit out as a RecordCard — the
   same sourced card the digest uses — so every result carries its source marker
   and, where the hit has a topic, a follow button. The reference's empty state
   shows when nothing matches.
   ========================================================================== */

import { town } from "@/src/town";
import { searchTown } from "@/src/lib/search";
import RecordCard from "./RecordCard";

export default function SearchResults({ query }: { query: string }) {
  const results = searchTown(town, query);
  const noun = results.length === 1 ? "match" : "matches";
  // Build the whole line as one string so JSX whitespace can't drop a space.
  const summary = `${results.length} ${noun} in the record for “${query}”`;

  return (
    <main className="view" aria-label="Search results">
      <div className="hi">Search</div>
      <div className="h1 serif">Results</div>
      <div className="sub">{summary}</div>

      {results.length === 0 ? (
        <div className="emptysearch">
          Nothing found. Try a body, a topic, or an address.
        </div>
      ) : (
        results.map((r) => (
          <RecordCard
            key={r.key}
            source={r.source}
            title={r.title}
            body={r.body}
            topic={r.topic ?? undefined}
          />
        ))
      )}
    </main>
  );
}
