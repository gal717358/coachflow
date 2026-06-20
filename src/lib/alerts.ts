// Derived "needs attention" logic shared by the dashboard, notifications, and
// roster filters (PRD: missing assessment, 90-day reassessment, 30-day goal
// review).

export const REASSESSMENT_DAYS = 90;
export const GOAL_REVIEW_DAYS = 30;

export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

/** True if the athlete has never been assessed or the last one is stale. */
export function isAssessmentDue(lastAssessment: string | null): boolean {
  const d = daysSince(lastAssessment);
  return d == null || d > REASSESSMENT_DAYS;
}

/** True if an active goal is overdue or due within the review window. */
export function isGoalDue(dueDate: string | null): boolean {
  const d = daysUntil(dueDate);
  return d != null && d <= GOAL_REVIEW_DAYS;
}

export type AlertKind = "missing_assessment" | "reassessment_due" | "goal_due";

export interface AthleteAlerts {
  lastAssessment: string | null;
  assessmentDue: boolean;
  goalDue: boolean;
  kinds: AlertKind[];
}

export function deriveAlerts(
  lastAssessment: string | null,
  goalDue: boolean,
): AthleteAlerts {
  const kinds: AlertKind[] = [];
  if (lastAssessment == null) kinds.push("missing_assessment");
  else if (isAssessmentDue(lastAssessment)) kinds.push("reassessment_due");
  if (goalDue) kinds.push("goal_due");
  return {
    lastAssessment,
    assessmentDue: isAssessmentDue(lastAssessment),
    goalDue,
    kinds,
  };
}

export const ALERT_LABELS: Record<AlertKind, string> = {
  missing_assessment: "אין הערכה",
  reassessment_due: "נדרשת הערכה מחדש",
  goal_due: "סקירת מטרה",
};
