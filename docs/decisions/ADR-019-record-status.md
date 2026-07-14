# ADR-019 — The honest record lifecycle: recordStatus

**Status:** Accepted · 2026-07-13

## Context

A resident reading a meeting page needs to know what they are looking at. An
agenda is a plan. Held minutes are a draft. Approved minutes are the settled
record. These are different documents with different weight, and a mirror that
blurs them is dishonest even when every fact in it is correct.

`Meeting.status` already exists, but it tracks scheduling (upcoming, held,
closed-out, cancelled). Open Civic Data's event status is about scheduling too.
Neither describes where a meeting sits in the minutes lifecycle. We need a
separate field for that, because the same held meeting can carry proposed
minutes one week and approved minutes the next, with no change to its schedule.

## Decision

Add `recordStatus` to `Meeting` as a companion to `status`, not a replacement.
It is a Commonwealth-specific field and a deliberate deviation from OCD, for the
reason above. The lifecycle, as implemented in `data/towns/schema.ts` (the
`RecordStatus` union), is frozen at these five values:

- `agenda` — agenda posted, meeting not yet held
- `held` — meeting held, minutes not yet posted
- `proposed` — proposed minutes posted, not yet approved
- `approved` — minutes approved, the settled record
- `corrected` — approved, then corrected (see the corrections log)

A meeting moves forward through these states as the public record does. A record
entered from proposed minutes carries `proposed`, and flips to `approved` only
when a later meeting approves those minutes, sourced to that later meeting.

## Consequences

- Every meeting surface can state plainly which document a resident is reading,
  and that statement is sourced.
- The field is optional so historical meetings without a known lifecycle state
  still validate.
- The five values are fixed. Adding a state later is possible if the record
  demands it; renaming or removing one is a breaking change to every town's
  data and is not done lightly.

## Notes

This ratifies the field as already built. The implementation predates this
record; this ADR freezes it rather than proposing something new.
