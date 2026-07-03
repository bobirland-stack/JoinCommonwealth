/* ============================================================================
   supabase.ts — the seam for the curation workspace's database.
   ----------------------------------------------------------------------------
   The one module that knows how to reach Supabase. It mirrors the town seam
   (src/town.ts): everything that talks to the database goes through here, and
   nowhere else imports the Supabase client directly.

   The connection comes from two build-time environment variables:

     NEXT_PUBLIC_SUPABASE_URL       the project URL from the Supabase dashboard
     NEXT_PUBLIC_SUPABASE_ANON_KEY  the project's anon (public) key

   Both are set in the hosting platform's environment settings, the same place
   Phase 7's flag endpoint lives (repository Variables, wired through the deploy
   workflow). Neither value is ever committed to the repo. The anon key is safe
   to ship in the browser bundle by design: it can do nothing on its own,
   because row-level security requires a signed-in collaborator for every read
   and write.

   Until both variables are set, getSupabase() returns null and
   isSupabaseConfigured is false, so a caller can be honest about the workspace
   not being connected yet rather than crashing. The screens that use this are
   Tasks 2 and 3.
   ========================================================================== */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True once both connection values are present in the build. */
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

let client: SupabaseClient | null = null;

/**
 * The shared Supabase client, or null if the connection is not configured yet.
 * Built once and reused. Callers should check the result before using it.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (client === null) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}
