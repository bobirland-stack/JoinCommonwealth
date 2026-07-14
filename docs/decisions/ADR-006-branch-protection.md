# ADR-006 — Branch protection: a person stands behind every recap

**Status:** Accepted · 2026-07-13

## Context

Commonwealth's promise is that a person stands behind every recap and that the
mirror matches the public record. That promise has to be structural, not a habit
someone remembers on a good day. Two things make it structural: an automated
check that no record with an unsourced claim can ship, and a human review that
someone read the record against its source before it went public.

The policy has been enacted in practice already. CLAUDE.md requires a branch and
a pull request for every change and forbids pushing to main. The publish pipeline
opens a pull request and waits for a human merge. This ADR records that decision
so it is a named rule rather than an unwritten one.

## Decision

Nothing reaches the published branch (`main`) without both of these:

1. **The record-check gate passes.** CI runs the source-check gate
   (`npm run check-sources`), the strict typecheck, and the build. The gate
   rejects any meeting, agenda item, thread, thread step, or companion that
   lacks a source, and any reference that does not resolve.
2. **One approving review.** A person reviews the change before it merges. For a
   record, that review is the reading of the recap against its source.

These are enforced as GitHub branch-protection rules on `main`: required status
checks plus one required approval. The rule stays on even when the team is one
person. A solo founder reviews the diff as a distinct step from writing it, so
the review is a real second look rather than a formality.

## Consequences

- The merge that ships a record is the moment a human vouches for it. That merge
  is the entry in the verification log.
- No record can ship with an unsourced claim, because the gate blocks the merge.
- Working solo is slower by one deliberate review step per change. That cost is
  the point.

## Notes

The record-check gate itself is defined alongside this decision (the
`scripts/check-sources.ts` script and the CI workflow that runs it). Branch
protection is a GitHub-side setting the repository owner enables; this ADR is the
decision it enforces.
