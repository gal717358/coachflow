import { createClient } from "./supabase/server";
import { bmi } from "./format";
import {
  deriveAlerts,
  isGoalDue,
  type AthleteAlerts,
} from "./alerts";
import type {
  Assessment,
  Athlete,
  AthleteCurrent,
  AthleteScores,
  CoachNote,
  Exercise,
  ExercisePerformance,
  ExperienceLevel,
  Goal,
  Insights,
  MovementAssessment,
  Personality,
  User,
} from "./types";

const EXERCISES: Exercise[] = ["squat", "deadlift", "bench_press", "pull_up"];

export interface AthleteListRow {
  athlete: Athlete;
  current: AthleteCurrent | null;
  primaryCoach: User | null;
  topGoal: string | null;
}

/**
 * Athletes visible to a user. Owner sees everyone; a coach sees only athletes
 * where they are the primary or secondary coach.
 */
export async function getAthletesForUser(
  user: User,
): Promise<AthleteListRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("athletes")
    .select("*")
    .order("first_name", { ascending: true });

  if (user.role === "coach") {
    query = query.or(
      `primary_coach_id.eq.${user.id},secondary_coach_id.eq.${user.id}`,
    );
  }

  const { data: athletes } = await query;
  const rows = (athletes ?? []) as Athlete[];
  if (rows.length === 0) return [];

  const ids = rows.map((a) => a.id);
  const coachIds = [
    ...new Set(rows.map((a) => a.primary_coach_id).filter(Boolean)),
  ] as string[];

  const [{ data: currents }, { data: coaches }, { data: goals }] =
    await Promise.all([
      supabase.from("athlete_current").select("*").in("athlete_id", ids),
      coachIds.length
        ? supabase.from("users").select("*").in("id", coachIds)
        : Promise.resolve({ data: [] as User[] }),
      supabase
        .from("goals")
        .select("*")
        .in("athlete_id", ids)
        .in("status", ["in_progress", "not_started"])
        .order("due_date", { ascending: true }),
    ]);

  const currentById = new Map(
    (currents as AthleteCurrent[] | null)?.map((c) => [c.athlete_id, c]) ?? [],
  );
  const coachById = new Map(
    (coaches as User[] | null)?.map((c) => [c.id, c]) ?? [],
  );
  const goalByAthlete = new Map<string, string>();
  for (const g of (goals as Goal[] | null) ?? []) {
    if (!goalByAthlete.has(g.athlete_id)) goalByAthlete.set(g.athlete_id, g.title);
  }

  return rows.map((athlete) => ({
    athlete,
    current: currentById.get(athlete.id) ?? null,
    primaryCoach: athlete.primary_coach_id
      ? coachById.get(athlete.primary_coach_id) ?? null
      : null,
    topGoal: goalByAthlete.get(athlete.id) ?? null,
  }));
}

export async function getNotes(
  athleteId: string,
): Promise<(CoachNote & { coachName: string | null })[]> {
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("coach_notes")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("created_at", { ascending: false });
  const rows = (notes as CoachNote[] | null) ?? [];
  const coachIds = [...new Set(rows.map((n) => n.coach_id).filter(Boolean))] as string[];
  const { data: coaches } = coachIds.length
    ? await supabase.from("users").select("id, name").in("id", coachIds)
    : { data: [] as Pick<User, "id" | "name">[] };
  const byId = new Map((coaches ?? []).map((c) => [c.id, c.name]));
  return rows.map((n) => ({
    ...n,
    coachName: n.coach_id ? byId.get(n.coach_id) ?? null : null,
  }));
}

export async function getAssessments(
  athleteId: string,
): Promise<Assessment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("assessments")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("date", { ascending: false });
  return (data as Assessment[] | null) ?? [];
}

export async function getMovementAssessments(
  athleteId: string,
): Promise<MovementAssessment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movement_assessments")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("date", { ascending: false });
  return (data as MovementAssessment[] | null) ?? [];
}

export interface CoachingProfile {
  personality: Personality | null;
  insights: Insights | null;
  scores: AthleteScores | null;
}

export async function getCoachingProfile(
  athleteId: string,
): Promise<CoachingProfile> {
  const supabase = await createClient();
  const [{ data: personality }, { data: insights }, { data: scores }] =
    await Promise.all([
      supabase
        .from("athlete_personality")
        .select("*")
        .eq("athlete_id", athleteId)
        .maybeSingle(),
      supabase
        .from("athlete_insights")
        .select("*")
        .eq("athlete_id", athleteId)
        .maybeSingle(),
      supabase
        .from("athlete_scores")
        .select("*")
        .eq("athlete_id", athleteId)
        .maybeSingle(),
    ]);
  return {
    personality: (personality as Personality | null) ?? null,
    insights: (insights as Insights | null) ?? null,
    scores: (scores as AthleteScores | null) ?? null,
  };
}

export async function getGoals(athleteId: string): Promise<Goal[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("due_date", { ascending: true });
  return (data as Goal[] | null) ?? [];
}

export async function getMeasurements(athleteId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("date", { ascending: false });
  return data ?? [];
}

export async function getPerformance(
  athleteId: string,
): Promise<ExercisePerformance[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercise_performance")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("date", { ascending: false });
  return (data as ExercisePerformance[] | null) ?? [];
}

/** Whether the current stub-auth user may edit this athlete's data. */
export async function canCurrentUserEdit(athleteId: string): Promise<boolean> {
  const { currentUser } = await import("./auth");
  const { canEditAthlete } = await import("./permissions");
  const supabase = await createClient();
  const [user, { data }] = await Promise.all([
    currentUser(),
    supabase
      .from("athletes")
      .select("primary_coach_id, secondary_coach_id")
      .eq("id", athleteId)
      .maybeSingle(),
  ]);
  if (!data) return false;
  return canEditAthlete(
    user,
    data as Pick<Athlete, "primary_coach_id" | "secondary_coach_id">,
  );
}

export interface AthleteHeader {
  athlete: Athlete;
  primaryCoach: User | null;
  secondaryCoach: User | null;
}

/** Minimal athlete + coach names for the shared athlete layout header. */
export async function getAthleteHeader(
  athleteId: string,
): Promise<AthleteHeader | null> {
  const supabase = await createClient();
  const { data: athlete } = await supabase
    .from("athletes")
    .select("*")
    .eq("id", athleteId)
    .maybeSingle();
  if (!athlete) return null;
  const a = athlete as Athlete;

  const coachIds = [a.primary_coach_id, a.secondary_coach_id].filter(
    Boolean,
  ) as string[];
  const { data: coaches } = coachIds.length
    ? await supabase.from("users").select("*").in("id", coachIds)
    : { data: [] as User[] };
  const byId = new Map((coaches as User[] | null)?.map((c) => [c.id, c]) ?? []);

  return {
    athlete: a,
    primaryCoach: a.primary_coach_id ? byId.get(a.primary_coach_id) ?? null : null,
    secondaryCoach: a.secondary_coach_id
      ? byId.get(a.secondary_coach_id) ?? null
      : null,
  };
}

export interface RosterRow extends AthleteListRow {
  lastAssessment: string | null;
  experienceLevel: ExperienceLevel | null;
  goalDue: boolean;
  alerts: AthleteAlerts;
}

/**
 * Roster enriched with derived assessment/goal status for the dashboard,
 * notifications, and filters. Owner sees all; a coach sees their roster.
 */
export async function getRoster(user: User): Promise<RosterRow[]> {
  const base = await getAthletesForUser(user);
  if (base.length === 0) return [];
  const ids = base.map((r) => r.athlete.id);
  const supabase = await createClient();

  const [{ data: assessments }, { data: goals }] = await Promise.all([
    supabase
      .from("assessments")
      .select("athlete_id, date, experience_level")
      .in("athlete_id", ids)
      .order("date", { ascending: false }),
    supabase
      .from("goals")
      .select("athlete_id, due_date, status")
      .in("athlete_id", ids)
      .in("status", ["not_started", "in_progress"]),
  ]);

  // Latest assessment per athlete (rows are date-desc, so first wins).
  const latest = new Map<string, { date: string; level: ExperienceLevel | null }>();
  for (const a of (assessments as {
    athlete_id: string;
    date: string;
    experience_level: ExperienceLevel | null;
  }[]) ?? []) {
    if (!latest.has(a.athlete_id))
      latest.set(a.athlete_id, { date: a.date, level: a.experience_level });
  }

  // Any active goal due within the review window.
  const goalDue = new Map<string, boolean>();
  for (const g of (goals as { athlete_id: string; due_date: string | null }[]) ??
    []) {
    if (isGoalDue(g.due_date)) goalDue.set(g.athlete_id, true);
  }

  return base.map((row) => {
    const la = latest.get(row.athlete.id) ?? null;
    const due = goalDue.get(row.athlete.id) ?? false;
    return {
      ...row,
      lastAssessment: la?.date ?? null,
      experienceLevel: la?.level ?? null,
      goalDue: due,
      alerts: deriveAlerts(la?.date ?? null, due),
    };
  });
}

export interface RecentLift {
  exercise: Exercise;
  weight: number;
  reps: number;
  estimated_1rm: number;
  date: string;
}

export interface AthleteSnapshot {
  athlete: Athlete;
  current: AthleteCurrent | null;
  bmi: number | null;
  personality: Personality | null;
  insights: Insights | null;
  scores: AthleteScores | null;
  primaryCoach: User | null;
  secondaryCoach: User | null;
  latestNote: (CoachNote & { coachName: string | null }) | null;
  topGoal: Goal | null;
  recentLifts: RecentLift[];
}

/** Everything the Snapshot screen needs, in one round of parallel queries. */
export async function getAthleteSnapshot(
  athleteId: string,
): Promise<AthleteSnapshot | null> {
  const supabase = await createClient();

  const { data: athlete } = await supabase
    .from("athletes")
    .select("*")
    .eq("id", athleteId)
    .maybeSingle();

  if (!athlete) return null;
  const a = athlete as Athlete;

  const coachIds = [a.primary_coach_id, a.secondary_coach_id].filter(
    Boolean,
  ) as string[];

  const [
    { data: current },
    { data: personality },
    { data: insights },
    { data: scores },
    { data: coaches },
    { data: notes },
    { data: goals },
    { data: lifts },
  ] = await Promise.all([
    supabase
      .from("athlete_current")
      .select("*")
      .eq("athlete_id", athleteId)
      .maybeSingle(),
    supabase
      .from("athlete_personality")
      .select("*")
      .eq("athlete_id", athleteId)
      .maybeSingle(),
    supabase
      .from("athlete_insights")
      .select("*")
      .eq("athlete_id", athleteId)
      .maybeSingle(),
    supabase
      .from("athlete_scores")
      .select("*")
      .eq("athlete_id", athleteId)
      .maybeSingle(),
    coachIds.length
      ? supabase.from("users").select("*").in("id", coachIds)
      : Promise.resolve({ data: [] as User[] }),
    supabase
      .from("coach_notes")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("goals")
      .select("*")
      .eq("athlete_id", athleteId)
      .in("status", ["in_progress", "not_started"])
      .order("due_date", { ascending: true })
      .limit(1),
    supabase
      .from("exercise_performance")
      .select("*")
      .eq("athlete_id", athleteId)
      .order("date", { ascending: false }),
  ]);

  const cur = (current as AthleteCurrent | null) ?? null;
  const coachById = new Map(
    (coaches as User[] | null)?.map((c) => [c.id, c]) ?? [],
  );

  // Latest lift per exercise, in a stable display order.
  const seen = new Map<Exercise, RecentLift>();
  for (const row of (lifts as ExercisePerformance[] | null) ?? []) {
    if (!seen.has(row.exercise)) {
      seen.set(row.exercise, {
        exercise: row.exercise,
        weight: row.weight,
        reps: row.reps,
        estimated_1rm: row.estimated_1rm,
        date: row.date,
      });
    }
  }
  const recentLifts = EXERCISES.map((e) => seen.get(e)).filter(
    (x): x is RecentLift => Boolean(x),
  );

  const note = (notes as CoachNote[] | null)?.[0] ?? null;

  return {
    athlete: a,
    current: cur,
    bmi: bmi(cur?.weight, a.height_cm),
    personality: (personality as Personality | null) ?? null,
    insights: (insights as Insights | null) ?? null,
    scores: (scores as AthleteScores | null) ?? null,
    primaryCoach: a.primary_coach_id
      ? coachById.get(a.primary_coach_id) ?? null
      : null,
    secondaryCoach: a.secondary_coach_id
      ? coachById.get(a.secondary_coach_id) ?? null
      : null,
    latestNote: note
      ? { ...note, coachName: note.coach_id ? coachById.get(note.coach_id)?.name ?? null : null }
      : null,
    topGoal: (goals as Goal[] | null)?.[0] ?? null,
    recentLifts,
  };
}
