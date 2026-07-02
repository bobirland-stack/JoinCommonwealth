# CLAUDE.md — standing conventions for this repo

Read this before making any change. These rules apply to every session and every task, including small ad-hoc edits.

## Voice standard (all user-facing copy)

Audience: ordinary residents of a small Midwestern town. Not tech people. Voice: professional, warm, plainspoken, clear.

- No em dashes (—) in any user-facing copy or in page metadata titles.
- No "not X, Y" rhetorical constructions. State the positive claim directly.
- No aphorisms or taglines that need decoding.
- Simple sentence structure. One idea per sentence. Semicolons discouraged. Contractions welcome.
- No startup or AI vocabulary: leverage, high-leverage, robust, seamless, empower, ecosystem, journey, delve, "by construction", "measurement-first", "unit of value", surface (as a verb).
- The tone is never adversarial. Residents, supporters, and the city are part of the same community. Frame independence as fairness that protects everyone, including the city. Never imply that anyone would tamper with the record.
- Protected phrases, never change these: the footer honesty line ("Commonwealth mirrors the public record and is not affiliated with the City of …"), "From the record", "Where this comes from", "How this works", "Something look wrong?", "A person stands behind every recap", "Anyone can support it. Everyone sees the same record.", "Know the place you live."

## Architecture rules

- Data is separate from app, always. All town facts live in `data/towns/*.json`. Components depend on the schema types in `data/towns/schema.ts`, never on Clawson specifically.
- One seam: every component reads town data through `src/town.ts`. Never import a town JSON directly.
- Reuse shared components (`SiteNav`, `SiteFooter`). Never rebuild copies of them. Follow the page conventions already established by existing pages.
- Do not edit `data/towns/*.json` unless the task is explicitly a data update. Record titles mirror the public record and keep their original formatting, including any dashes.
- Only change what the task asks for. No drive-by refactors or cleanups.

## Workflow

- Verify before any PR: `npx tsc --noEmit` passes under strict, and `npm run build` completes.
- Always commit to a branch and open a pull request. Never push directly to main.
- In the PR description, list what changed and confirm the checks above.
