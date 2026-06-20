// Domain types mirroring the Supabase schema. Hand-written for the MVP; can be
// replaced with generated types (`supabase gen types typescript`) later.

export type Role = "owner" | "coach";
export type AthleteStatus = "active" | "frozen" | "former";
export type Gender = "male" | "female" | "other";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type CommunicationStyle =
  | "direct"
  | "supportive"
  | "technical"
  | "high-energy";
export type GoalStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "cancelled";
export type NoteCategory =
  | "training"
  | "nutrition"
  | "injury"
  | "motivation"
  | "general";
export type Exercise = "squat" | "deadlift" | "bench_press" | "pull_up";
export type Movement = Exercise | "overhead_press";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Athlete {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  gender: Gender | null;
  birth_date: string | null;
  height_cm: number | null;
  start_date: string | null;
  status: AthleteStatus;
  primary_coach_id: string | null;
  secondary_coach_id: string | null;
}

export interface AthleteCurrent {
  athlete_id: string;
  measured_on: string;
  weight: number | null;
  body_fat: number | null;
  muscle_mass: number | null;
}

export interface Personality {
  athlete_id: string;
  motivation_styles: string[];
  communication_style: CommunicationStyle | null;
  notes: string | null;
}

export interface Insights {
  athlete_id: string;
  strengths: string[];
  improvements: string[];
}

export interface Goal {
  id: string;
  athlete_id: string;
  title: string;
  description: string | null;
  target_value: number | null;
  current_value: number | null;
  due_date: string | null;
  horizon_days: 30 | 90 | 180 | null;
  status: GoalStatus;
}

export interface CoachNote {
  id: string;
  athlete_id: string;
  coach_id: string | null;
  category: NoteCategory;
  note: string;
  created_at: string;
}

export interface ExercisePerformance {
  id: string;
  athlete_id: string;
  date: string;
  exercise: Exercise;
  weight: number;
  reps: number;
  estimated_1rm: number;
}

export interface Assessment {
  id: string;
  athlete_id: string;
  date: string;
  strength_score: number | null;
  endurance_score: number | null;
  mobility_score: number | null;
  stability_score: number | null;
  coordination_score: number | null;
  awareness_score: number | null;
  experience_level: ExperienceLevel | null;
  injury_notes: string | null;
}

export interface MovementAssessment {
  id: string;
  athlete_id: string;
  date: string;
  movement: Movement;
  score: number | null;
  notes: string | null;
  issues: string[];
}

export interface AthleteScores {
  athlete_id: string;
  consistency: number | null;
  discipline: number | null;
  technique: number | null;
  progress: number | null;
  engagement: number | null;
  overall: number | null;
}
