# Commonwealth — V1

A free, nonprofit civic-and-community-information platform for one town
(Clawson, MI). A distribution platform built on, and permanently subordinate
to, a neutral public record. V1 is a reading product plus a hand-assembled
weekly newsletter — no accounts, no backend, no automated ingestion.

> **Not affiliated with the City of Clawson.** Commonwealth mirrors the public
> record; it never replaces it. Every entry links to and defers to its
> official source.

## What's in this commit (Phase 1 foundation — the data layer)

The load-bearing core the rest of the build hangs on. Built and verified first
because the schema is "the single most important file for portability."

```

commonwealth/
├── data/towns/
│   ├── schema.ts        # THE contract — the typed Town shape (build this first)
│   └── clawson.json     # the portable data layer (all Clawson facts)
├── src/
│   ├── town.ts          # THE data seam — loads + validates + exports typed town
│   └── styles/
│       └── tokens.css   # the design tokens (pine/moss/paper/honey…) + a11y floors
├── docs/decisions/
│   ├── ADR-001-framework.md   # Next.js, static-first — with reversal path
│   └── ADR-002-data-seam.md   # bundled JSON behind one typed module
└── tsconfig.json        # strict TypeScript

```

**Verified:** `npx tsc --noEmit` passes under `strict` — `clawson.json`
conforms to `schema.ts`. The seam loads, validates provenance, and exposes
typed accessors (`bodyById`, `topicLabel`, `threadById`, `byTopic`).

## The two rules that must never break

1. **Data is separate from app, always.** Everything town-specific lives in
   `data/towns/*.json`. A second town is a second JSON file — never a code
   fork. Components depend on `schema.ts` types, never on Clawson.
2. **One seam.** All town data flows through `src/town.ts`. No component ever
   imports a town JSON directly. This is the two-way door that lets fetching
   arrive later by changing one file. (ADR-002.)

## Provenance backbone

Every content item carries `source: { label, date, real }`.
`real: true` = verified fact; `real: false` = sample (must be labeled in UI).
`drafted: true` adds the "drafted by software under fixed rules" line.

## What's next (Build Plan phases)

- **Phase 1 (remainder):** `npx create-next-app` scaffold around this data
  layer; wire `tokens.css` globally; placeholder routes.
- **Phase 2:** port the 6 marketing pages (home, mission, about, trust,
  get-involved, transparency) from the reference HTML → React.
- **Phase 3:** resident-app shell + Your Town + Government tabs; shared
  components (`ProvenanceTag`, `RecordCard`, `Thread`, `FollowButton`).
- **Phase 4:** Happening / Take part / You; `localStorage` follows; search.
- **Phase 5:** the weekly newsletter build script + Buttondown signup.
- **Phase 6:** deploy to Vercel; accessibility + honesty pass; the Berkley
  portability test.

## Local dev

```bash
npm install
npx tsc --noEmit    # type-check the data layer against the schema
```

Full app scripts arrive with the Next.js scaffold (Phase 1 remainder).
