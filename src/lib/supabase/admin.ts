import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for privileged auth admin operations (create /
 * delete users). SERVICE-SIDE ONLY — never import this from a client component;
 * the key bypasses RLS. Used exclusively by the owner user-management actions,
 * which re-check that the caller is the owner before doing anything.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — required for user management.",
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
