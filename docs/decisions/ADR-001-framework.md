# ADR-001 — Framework: Next.js (App Router), static-first

**Status:** Accepted · 2026-07-01
**Supersedes:** the earlier Vite SPA assumption (technical review, 2026-07-01)

## Context

Commonwealth V1 is a reading product over curated data plus a signup form:
no accounts, no per-request data, no backend. The record it mirrors — every
meeting, thread, and record page — should be real, crawlable, deep-linkable
HTML, because indexability and shareability are *product properties* of a
public-record mirror, not tech preferences.

## Options considered

1. **Vite + React SPA.** Fast, simple, but client-renders its routes — the
   record is not crawlable HTML without extra work, and deep-linking to a
   thread is a client concern rather than a real URL.
2. **Next.js (App Router), static generation.** File-based routing maps 1:1
   onto the route list; every route pre-renders to HTML at build time; keeps
   a two-way door to later needs (a `/data` route handler, incremental
   regeneration when towns multiply, auth for the member view).
3. **A static-site generator (Astro/Eleventy).** Great at static HTML, but a
   worse fit for the interactive resident app (follows, search, flag flow).

## Decision

**Option 2 — Next.js, App Router, static generation. No per-request SSR in
V1** (there is no per-request data). The win is per-route pre-rendered HTML
plus a growth path — NOT "SSR instead of fetching" (a static site is already
maximally cached).

## Consequences

- The record is real, crawlable, deep-linkable HTML — a trust property.
- Zero loading states, zero API surface to secure, free CDN hosting on Vercel.
- Plain CSS custom properties (existing tokens); no Tailwind build step.
- Client-side interactivity (follows, search, flag flow) is still allowed —
  the static rule constrains how the *town record* arrives, nothing else.

## How this stays a two-way door

Components are plain React consuming the typed `Town` object through
`src/town.ts` (see ADR-002). The framework is a shell around the schema and
is **never load-bearing inside components** — if Next ever chafes, the
components port to any React host unchanged.
