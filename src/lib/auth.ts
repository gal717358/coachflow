import { createClient } from "./supabase/server";
import type { User } from "./types";

/**
 * Auth helpers backed by Supabase Auth. The session lives in cookies (managed by
 * the SSR client + middleware); the app's role/profile data lives in
 * public.users, keyed by the auth user id.
 */

export async function listUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, email, role")
    .order("role", { ascending: true })
    .order("name", { ascending: true });
  return (data ?? []) as User[];
}

/** The signed-in user's profile, or null if not authenticated. */
export async function currentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .maybeSingle();
  return (data as User | null) ?? null;
}
