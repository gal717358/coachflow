import type {
  AthleteStatus,
  Exercise,
  ExperienceLevel,
  Gender,
  GoalStatus,
  Movement,
  NoteCategory,
} from "./types";

/** Age in whole years from a YYYY-MM-DD birth date. */
export function age(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) years--;
  return years;
}

/** BMI from weight (kg) and height (cm), rounded to one decimal. */
export function bmi(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined,
): number | null {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function fullName(a: { first_name: string; last_name: string }): string {
  return `${a.first_name} ${a.last_name}`;
}

export function initials(a: {
  first_name: string;
  last_name: string;
}): string {
  return `${a.first_name[0] ?? ""}${a.last_name[0] ?? ""}`;
}

const EXERCISE_LABELS: Record<Exercise, string> = {
  squat: "סקוואט",
  deadlift: "דדליפט",
  bench_press: "לחיצת חזה",
  pull_up: "מתח",
};

const MOVEMENT_LABELS: Record<Movement, string> = {
  ...EXERCISE_LABELS,
  overhead_press: "לחיצת כתפיים",
};

export function exerciseLabel(e: Exercise): string {
  return EXERCISE_LABELS[e];
}

export function movementLabel(m: Movement): string {
  return MOVEMENT_LABELS[m];
}

export const MOVEMENTS: Movement[] = [
  "squat",
  "deadlift",
  "bench_press",
  "pull_up",
  "overhead_press",
];

export function titleCase(s: string): string {
  return s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: "זכר",
  female: "נקבה",
  other: "אחר",
};

export const STATUS_LABELS: Record<AthleteStatus, string> = {
  active: "פעיל",
  frozen: "מוקפא",
  former: "לשעבר",
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: "טרם החל",
  in_progress: "בתהליך",
  completed: "הושלם",
  cancelled: "בוטל",
};

export const MOTIVATION_STYLE_LABELS: Record<string, string> = {
  "needs-encouragement": "זקוק לעידוד",
  competitive: "תחרותי",
  "data-driven": "מונחה נתונים",
  social: "חברתי",
  independent: "עצמאי",
  "achievement-focused": "ממוקד הישגים",
};

export const COMMUNICATION_LABELS: Record<string, string> = {
  direct: "ישיר",
  supportive: "תומך",
  technical: "טכני",
  "high-energy": "אנרגטי",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: "מתחיל",
  intermediate: "בינוני",
  advanced: "מתקדם",
};

/** Dimensions of a fitness assessment, in display order. */
export const ASSESSMENT_DIMENSIONS: { key: string; label: string }[] = [
  { key: "strength_score", label: "כוח" },
  { key: "endurance_score", label: "סיבולת" },
  { key: "mobility_score", label: "ניידות" },
  { key: "stability_score", label: "יציבות" },
  { key: "coordination_score", label: "קואורדינציה" },
  { key: "awareness_score", label: "מודעות גוף" },
];

/** Movement faults (multi-select on a movement assessment). */
export const MOVEMENT_ISSUE_LABELS: Record<string, string> = {
  knee_valgus: "קריסת ברכיים פנימה",
  limited_ankle_mobility: "ניידות קרסול מוגבלת",
  poor_bracing: "נעילת ליבה לקויה",
  shoulder_restriction: "מגבלת כתף",
  hip_restriction: "מגבלת ירך",
};

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  training: "אימון",
  nutrition: "תזונה",
  injury: "פציעה",
  motivation: "מוטיבציה",
  general: "כללי",
};

/** Goal completion 0–100 from current/target, clamped. */
export function goalPercent(
  current: number | null,
  target: number | null,
): number | null {
  if (current == null || target == null || target === 0) return null;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

/** Compact date for chart axes, e.g. "מרץ 26". */
export function shortDate(d: string): string {
  return new Date(d).toLocaleDateString("he-IL", {
    month: "short",
    year: "2-digit",
  });
}

export function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
