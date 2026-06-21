"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface FormState {
  ok: boolean;
  error?: string;
}

const ROLES = ["owner", "coach"];

async function requireOwner() {
  const user = await currentUser();
  if (!user || user.role !== "owner")
    return { error: "רק בעל הסטודיו יכול לנהל משתמשים." as const };
  return { user };
}

function str(v: FormDataEntryValue | null): string {
  return (v == null ? "" : String(v)).trim();
}

export async function createUser(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const guard = await requireOwner();
  if ("error" in guard) return { ok: false, error: guard.error };

  const name = str(formData.get("name"));
  const email = str(formData.get("email"));
  const password = str(formData.get("password"));
  const role = str(formData.get("role"));

  if (!name) return { ok: false, error: "שם הוא שדה חובה." };
  if (!email) return { ok: false, error: "אימייל הוא שדה חובה." };
  if (password.length < 6)
    return { ok: false, error: "הסיסמה חייבת להכיל לפחות 6 תווים." };
  if (!ROLES.includes(role)) return { ok: false, error: "תפקיד לא תקין." };

  const admin = createAdminClient();
  // email_confirm so the account can sign in immediately; the
  // on_auth_user_created trigger creates the public.users profile from metadata.
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/users");
  return { ok: true };
}

export async function updateUserRole(
  userId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const guard = await requireOwner();
  if ("error" in guard) return { ok: false, error: guard.error };
  if (userId === guard.user.id)
    return { ok: false, error: "אינך יכול לשנות את התפקיד של עצמך." };

  const role = str(formData.get("role"));
  if (!ROLES.includes(role)) return { ok: false, error: "תפקיד לא תקין." };

  // Regular session client → exercises the RLS users_modify (owner) policy.
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/users");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteUser(
  userId: string,
  _prev: FormState,
  _formData: FormData,
): Promise<FormState> {
  const guard = await requireOwner();
  if ("error" in guard) return { ok: false, error: guard.error };
  if (userId === guard.user.id)
    return { ok: false, error: "אינך יכול למחוק את החשבון של עצמך." };

  // Deleting the auth user cascades to public.users; any athletes they coached
  // have their coach set to null (FK on delete set null) — reassign via Transfer.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/users");
  revalidatePath("/", "layout");
  return { ok: true };
}
