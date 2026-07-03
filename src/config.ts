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
