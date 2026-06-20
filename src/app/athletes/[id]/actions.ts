"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canEditAthlete } from "@/lib/permissions";
import type { Athlete } from "@/lib/types";

export interface FormState {
  ok: boolean;
  error?: string;
}

const NOTE_CATEGORIES = ["training", "nutrition", "injury", "motivation", "general"];
const GOAL_STATUSES = ["not_started", "in_progress", "completed", "cancelled"];
const EXERCISES = ["squat", "deadlift", "bench_press", "pull_up"];
const MOVEMENTS = ["squat", "deadlift", "bench_press", "pull_up", "overhead_press"];
const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];
const MOVEMENT_ISSUES = [
  "knee_valgus",
  "limited_ankle_mobility",
  "poor_bracing",
  "shoulder_restriction",
  "hip_restriction",
];
const HORIZONS = ["30", "90", "180"];
const MOTIVATION_STYLES = [
  "needs-encouragement",
  "competitive",
  "data-driven",
  "social",
  "independent",
  "achievement-focused",
];
const COMMUNICATION_STYLES = ["direct", "supportive", "technical", "high-energy"];

/** Parse a textarea into a trimmed, non-empty string list (one item per line). */
function lines(v: FormDataEntryValue | null): string[] {
  return str(v)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** A 1–10 score field: blank → null, out-of-range/non-numeric → undefined. */
function score(v: FormDataEntryValue | null): number | null | undefined {
  if (v == null || String(v).trim() === "") return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 10) return undefined;
  return n;
}

/** Fetch the athlete and verify the current user may edit it. */
async function authorize(athleteId: string) {
  const supabase = await createClient();
  const user = await currentUser();
  const { data } = await supabase
    .from("athletes")
    .select("id, primary_coach_id, secondary_coach_id")
    .eq("id", athleteId)
    .maybeSingle();
  const athlete = data as Pick<
    Athlete,
    "id" | "primary_coach_id" | "secondary_coach_id"
  > | null;

  if (!athlete) return { error: "Athlete not found." as const };
  if (!canEditAthlete(user, athlete)) {
    return { error: "You don't have permission to edit this athlete." as const };
  }
  return { supabase, user: user!, athlete };
}

/** Owner-only guard (assigning coaches is an owner capability per PRD). */
async function authorizeOwner(athleteId: string) {
  const supabase = await createClient();
  const user = await currentUser();
  if (!user || user.role !== "owner")
    return { error: "Only the studio owner can reassign coaches." as const };
  const { data } = await supabase
    .from("athletes")
    .select("id")
    .eq("id", athleteId)
    .maybeSingle();
  if (!data) return { error: "Athlete not found." as const };
  return { supabase, user };
}

/** Optional numeric field: blank → null, non-numeric → undefined (invalid). */
function num(v: FormDataEntryValue | null): number | null | undefined {
  if (v == null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: FormDataEntryValue | null): string {
  return (v == null ? "" : String(v)).trim();
}

function done(athleteId: string): FormState {
  revalidatePath(`/athletes/${athleteId}`, "layout");
  return { ok: true };
}

// --- Coach notes -----------------------------------------------------------
export async function addNote(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const category = str(formData.get("category"));
  const note = str(formData.get("note"));
  if (!NOTE_CATEGORIES.includes(category))
    return { ok: false, error: "Pick a valid category." };
  if (!note) return { ok: false, error: "Note can't be empty." };

  const { error } = await auth.supabase.from("coach_notes").insert({
    athlete_id: athleteId,
    coach_id: auth.user.id,
    category,
    note,
  });
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

// --- Goals -----------------------------------------------------------------
export async function addGoal(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const title = str(formData.get("title"));
  if (!title) return { ok: false, error: "Title is required." };
  const status = str(formData.get("status")) || "not_started";
  if (!GOAL_STATUSES.includes(status))
    return { ok: false, error: "Invalid status." };
  const horizonRaw = str(formData.get("horizon_days"));
  if (horizonRaw && !HORIZONS.includes(horizonRaw))
    return { ok: false, error: "Invalid time horizon." };

  const target = num(formData.get("target_value"));
  const current = num(formData.get("current_value"));
  if (target === undefined || current === undefined)
    return { ok: false, error: "Target/current must be numbers." };

  const { error } = await auth.supabase.from("goals").insert({
    athlete_id: athleteId,
    title,
    description: str(formData.get("description")) || null,
    target_value: target,
    current_value: current,
    due_date: str(formData.get("due_date")) || null,
    horizon_days: horizonRaw ? Number(horizonRaw) : null,
    status,
  });
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

/** Quick inline update of an existing goal's progress + status. */
export async function updateGoal(
  athleteId: string,
  goalId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const status = str(formData.get("status"));
  if (!GOAL_STATUSES.includes(status))
    return { ok: false, error: "Invalid status." };
  const current = num(formData.get("current_value"));
  if (current === undefined)
    return { ok: false, error: "Current value must be a number." };

  const { error } = await auth.supabase
    .from("goals")
    .update({ status, current_value: current })
    .eq("id", goalId)
    .eq("athlete_id", athleteId);
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

// --- Body measurements -----------------------------------------------------
export async function addMeasurement(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const date = str(formData.get("date"));
  if (!date) return { ok: false, error: "Date is required." };

  const fields = ["weight", "body_fat", "muscle_mass", "waist", "hips", "arm"];
  const values: Record<string, number | null> = {};
  for (const f of fields) {
    const v = num(formData.get(f));
    if (v === undefined) return { ok: false, error: `${f} must be a number.` };
    values[f] = v;
  }
  if (Object.values(values).every((v) => v === null))
    return { ok: false, error: "Enter at least one measurement." };

  const { error } = await auth.supabase
    .from("body_measurements")
    .insert({ athlete_id: athleteId, date, ...values });
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

// --- Fitness assessment ----------------------------------------------------
export async function addAssessment(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const date = str(formData.get("date"));
  if (!date) return { ok: false, error: "Date is required." };

  const scoreFields = [
    "strength_score",
    "endurance_score",
    "mobility_score",
    "stability_score",
    "coordination_score",
    "awareness_score",
  ];
  const scores: Record<string, number | null> = {};
  for (const f of scoreFields) {
    const v = score(formData.get(f));
    if (v === undefined)
      return { ok: false, error: "Scores must be whole numbers from 1 to 10." };
    scores[f] = v;
  }

  const experience = str(formData.get("experience_level"));
  if (experience && !EXPERIENCE_LEVELS.includes(experience))
    return { ok: false, error: "Invalid experience level." };

  const { error } = await auth.supabase.from("assessments").insert({
    athlete_id: athleteId,
    date,
    ...scores,
    experience_level: experience || null,
    injury_notes: str(formData.get("injury_notes")) || null,
  });
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

// --- Movement assessment ---------------------------------------------------
export async function addMovementAssessment(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const date = str(formData.get("date"));
  if (!date) return { ok: false, error: "Date is required." };
  const movement = str(formData.get("movement"));
  if (!MOVEMENTS.includes(movement))
    return { ok: false, error: "Pick a valid movement." };

  const sc = score(formData.get("score"));
  if (sc === undefined)
    return { ok: false, error: "Score must be a whole number from 1 to 10." };

  const issues = formData
    .getAll("issues")
    .map(String)
    .filter((i) => MOVEMENT_ISSUES.includes(i));

  const { error } = await auth.supabase.from("movement_assessments").insert({
    athlete_id: athleteId,
    date,
    movement,
    score: sc,
    issues,
    notes: str(formData.get("notes")) || null,
  });
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

// --- Coaching profile: personality / insights / rating ---------------------
export async function savePersonality(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const motivation = formData
    .getAll("motivation_styles")
    .map(String)
    .filter((m) => MOTIVATION_STYLES.includes(m));
  const communication = str(formData.get("communication_style"));
  if (communication && !COMMUNICATION_STYLES.includes(communication))
    return { ok: false, error: "Invalid communication style." };

  const { error } = await auth.supabase.from("athlete_personality").upsert(
    {
      athlete_id: athleteId,
      motivation_styles: motivation,
      communication_style: communication || null,
      notes: str(formData.get("notes")) || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "athlete_id" },
  );
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

export async function saveInsights(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const { error } = await auth.supabase.from("athlete_insights").upsert(
    {
      athlete_id: athleteId,
      strengths: lines(formData.get("strengths")),
      improvements: lines(formData.get("improvements")),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "athlete_id" },
  );
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

export async function saveScores(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const fields = ["consistency", "discipline", "technique", "progress", "engagement"];
  const values: Record<string, number | null> = {};
  for (const f of fields) {
    const v = score(formData.get(f));
    if (v === undefined)
      return { ok: false, error: "Ratings must be whole numbers from 1 to 10." };
    values[f] = v;
  }

  const { error } = await auth.supabase.from("athlete_scores").upsert(
    { athlete_id: athleteId, ...values, updated_at: new Date().toISOString() },
    { onConflict: "athlete_id" },
  );
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

// --- Coach reassignment (transfer) -----------------------------------------
export async function reassignCoaches(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorizeOwner(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const primary = str(formData.get("primary_coach_id"));
  const secondaryRaw = str(formData.get("secondary_coach_id"));
  const secondary = secondaryRaw || null;

  if (!primary) return { ok: false, error: "A primary coach is required." };
  if (secondary && secondary === primary)
    return { ok: false, error: "Secondary coach must differ from primary." };

  // Validate the chosen ids are real users.
  const ids = [primary, ...(secondary ? [secondary] : [])];
  const { data: users } = await auth.supabase
    .from("users")
    .select("id")
    .in("id", ids);
  if ((users?.length ?? 0) !== ids.length)
    return { ok: false, error: "Selected coach no longer exists." };

  const { error } = await auth.supabase
    .from("athletes")
    .update({ primary_coach_id: primary, secondary_coach_id: secondary })
    .eq("id", athleteId);
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}

// --- Exercise performance --------------------------------------------------
export async function addPerformance(
  athleteId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const auth = await authorize(athleteId);
  if ("error" in auth) return { ok: false, error: auth.error };

  const date = str(formData.get("date"));
  if (!date) return { ok: false, error: "Date is required." };
  const exercise = str(formData.get("exercise"));
  if (!EXERCISES.includes(exercise))
    return { ok: false, error: "Pick a valid exercise." };

  const weight = num(formData.get("weight"));
  const reps = num(formData.get("reps"));
  if (weight === undefined || weight === null)
    return { ok: false, error: "Weight is required." };
  if (reps === undefined || reps === null || reps < 1)
    return { ok: false, error: "Reps must be at least 1." };

  const { error } = await auth.supabase.from("exercise_performance").insert({
    athlete_id: athleteId,
    date,
    exercise,
    weight,
    reps,
  });
  if (error) return { ok: false, error: error.message };
  return done(athleteId);
}
