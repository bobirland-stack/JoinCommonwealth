# ADR-002 — The data seam: bundled town JSON behind one typed module

**Status:** Accepted · 2026-07-01

## Context

Portability is the spine (Build Plan Decision #2): a second town must be a
second JSON file, never a code fork. This requires (a) a single typed contract
describing a town, and (b) a single place the town record is loaded, so no
component ever becomes town-aware or learns how the data arrives.

## Decision

- **`data/towns/schema.ts`** is the contract — the `Town` interface and every
  nested type. Components depend on THESE TYPES, never on Clawson (dependency
  inversion; the §12.5 bounded-core rule expressed as code).
- **`data/towns/clawson.json`** is the record, bundled into the build. "The
  data IS the deploy": every change to the record is a reviewed git commit — a
  version-controlled audit trail of the mirror itself.
- **`src/town.ts`** is the seam — the ONE module that imports the JSON,
  validates its structure, and exports the typed `town` object plus small
  derived accessors. Everything else imports from here.

## Consequences

- Swapping `*.json` of the same shape re-skins the whole app (the §7
  portability test proves it: Berkley in ~30 minutes, zero component changes).
- A malformed town record fails loudly at load (`validateTown`) instead of
  rendering silently-wrong.
- V1 gets zero loading states and no data API to secure.

## How this stays a two-way door

Introducing fetching later — per-topic digests, live flags, multi-town
loading, a `/data` route handler — changes **`src/town.ts` only**, zero
components, because every component already consumes the typed object through
this seam. The named upgrade path: replace the static import with an async
loader and add `zod` runtime validation against `schema.ts` (the current
`validateTown` is the V1-appropriate floor, not the ceiling).

**The failure mode this guards against:** any component that imports
`clawson.json` (or any town JSON) directly has broken the seam and the door.
That is the one import the codebase must never contain.
