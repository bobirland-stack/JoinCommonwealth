/* ============================================================================
   config.ts — the one client-visible build setting (Phase 7, Part 2).
   ----------------------------------------------------------------------------
   FLAG_ENDPOINT is the URL of the small serverless function that turns a flag
   into a GitHub Issue. It is set at build time from NEXT_PUBLIC_FLAG_ENDPOINT
   (a repository variable, wired through the deploy workflow) and is inlined
   into the static build.

   It is empty until that function is deployed and the variable is set. When it
   is empty, the flag flow tells the resident honestly that nothing was sent,
   rather than pretending the flag went through.
   ========================================================================== */

export const FLAG_ENDPOINT = process.env.NEXT_PUBLIC_FLAG_ENDPOINT ?? "";

/* ----------------------------------------------------------------------------
   SUBMISSION_ENDPOINT is the URL of the small serverless function that turns a
   scout submission into a GitHub Issue for the curator team (Stage A, Task 2,
   Part 2). It reuses the exact pattern Phase 7 established for flags: one tiny
   Cloudflare Worker, one GitHub token held in the dashboard, one repository
   variable wired through the deploy workflow. It is set at build time from
   NEXT_PUBLIC_SUBMISSION_ENDPOINT and inlined into the static build.

   It is empty until that function is deployed and the variable is set. When it
   is empty, a submission still saves to the database; the notify step simply
   reports honestly that no notice was sent, rather than pretending one was.
   ---------------------------------------------------------------------------- */
export const SUBMISSION_ENDPOINT =
  process.env.NEXT_PUBLIC_SUBMISSION_ENDPOINT ?? "";

/* ----------------------------------------------------------------------------
   PUBLISH_ENDPOINT is the URL of the small serverless function that turns an
   approved, reviewed meeting into a commit on data/towns/clawson.json and a
   pull request (Stage A, Task 3). It is the same serverless pattern as the flag
   and submission functions, with one difference: committing a file and opening
   a pull request needs a GitHub token with Contents and Pull requests access,
   not just Issues. That token lives only in the worker's dashboard, never in
   this repo. The URL is set at build time from NEXT_PUBLIC_PUBLISH_ENDPOINT and
   inlined into the static build.

   It is empty until that function is deployed and the variable is set. Unlike a
   submission, a publish cannot fall back to "saved anyway": the whole point is
   the commit. So when this is empty, the publish screen says plainly that it
   cannot publish yet, rather than marking a meeting published with no record
   behind it.
   ---------------------------------------------------------------------------- */
export const PUBLISH_ENDPOINT = process.env.NEXT_PUBLIC_PUBLISH_ENDPOINT ?? "";
