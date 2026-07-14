# ADR-023 — The topic taxonomy: a fixed followable set

**Status:** Accepted · 2026-07-13

## Context

Topics are the units a resident follows. A thread, a record, a digest entry, and
a body each point at a topic id, and a follow is a subscription to that id. This
makes topic ids load-bearing. If an id changes, every follow pointed at it
breaks silently, and every piece of content tagged with it goes quiet for the
people who asked to hear about it.

Because renaming an id is a silent break, the set of topics has to be a
deliberate decision, ratified once, rather than something that drifts as content
is added. This ADR ratifies the taxonomy that already lives in
`data/towns/clawson.json`.

## Decision

The Clawson topic set is these 18 ids, frozen as their id and label pairs:

| id | label |
|---|---|
| `council` | City Council |
| `planning` | Planning Commission |
| `zoning` | Zoning & development |
| `budget` | Budget & taxes |
| `parks` | Parks & events |
| `water` | Your water |
| `schools` | Schools |
| `ballot` | Elections & ballot |
| `dda` | Downtown & DDA |
| `parks-rec` | Parks & recreation |
| `library` | Library |
| `traffic` | Traffic & safety |
| `historical` | History & museum |
| `board-of-review` | Property assessments |
| `ethics` | Ethics |
| `compensation` | Elected pay |
| `elections` | City elections |
| `infrastructure` | Roads & water |

**The naming rule.** Adding a topic is allowed and cheap. Renaming or removing a
topic id is forbidden, because it breaks existing follows and orphans tagged
content. A label may be reworded for clarity as long as the id is untouched.

## Consequences

- Content and follows can rely on these ids being permanent.
- New content tags a thread or record to the closest existing topic. When
  nothing fits, the answer is to add a new topic id, never to repurpose an old
  one.
- The set carries two near-neighbor pairs on purpose: `parks` and `parks-rec`,
  and `ballot` and `elections`. They are kept as-is under the naming rule. A
  future consolidation would add a new id and leave the old ones in place
  rather than rename either.

## Supersedes

This supersedes the planning brief's "starter fifteen" topics. The live
taxonomy is 18 topics, and that as-built set is what is ratified here. The
"starter fifteen" label is retired.
