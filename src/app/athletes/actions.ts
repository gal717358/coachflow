"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface FormState {
  ok: boolean;
  error?: string;
}

const GENDERS = ["male", "female", "other"];
const STATUSES = ["active", "frozen", "former"];

function str(v: FormDataEntryValue | null): string {
  return (v == null ? "" : String(v)).trim();
}

/** Empty string → null, so optional columns stay NULL instead of "". */
function orNull(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

export async function createAthlete(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // Owner + any coach may add athletes. RLS (athletes_modify) only permits
  // owners to write, so — like createUser — we use the admin client and
  // enforce the actor's permission here in code.
  const user = await currentUser();
  if (!user || (user.role !== "owner" && user.role !== "coach"))
    return { ok: false, error: "אין לך הרשאה להוסיף מתאמנים." };

  const first_name = str(formData.get("first_name"));
  const last_name = str(formData.get("last_name"));
  if (!first_name) return { ok: false, error: "שם פרטי הוא שדה חובה." };
  if (!last_name) return { ok: false, error: "שם משפחה הוא שדה חובה." };

  const gender = orNull(formData.get("gender"));
  if (gender && !GENDERS.includes(gender))
    return { ok: false, error: "מין לא תקין." };

  const status = str(formData.get("status")) || "active";
  if (!STATUSES.includes(status))
    return { ok: false, error: "סטטוס לא תקין." };

  const heightRaw = orNull(formData.get("height_cm"));
  let height_cm: number | null = null;
  if (heightRaw !== null) {
    const n = Number(heightRaw);
    if (!Number.isFinite(n) || n <= 0)
      return { ok: false, error: "גובה לא תקין." };
    height_cm = n;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("athletes")
    .insert({
      first_name,
      last_name,
      email: orNull(formData.get("email")),
      phone: orNull(formData.get("phone")),
      gender,
      birth_date: orNull(formData.get("birth_date")),
      height_cm,
      start_date: orNull(formData.get("start_date")),
      status,
      primary_coach_id: orNull(formData.get("primary_coach_id")),
      secondary_coach_id: orNull(formData.get("secondary_coach_id")),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  redirect(`/athletes/${data.id}`);
}
