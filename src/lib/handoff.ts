// Rule-based athlete handoff synthesis (PRD module 11). Turns captured data into
// a coach-to-coach summary. AI-generated summaries are a documented V2 item;
// this is deterministic so it works offline and is auditable.

import {
  ASSESSMENT_DIMENSIONS,
  COMMUNICATION_LABELS,
  EXPERIENCE_LABELS,
  MOTIVATION_STYLE_LABELS,
  MOVEMENT_ISSUE_LABELS,
  movementLabel,
  titleCase,
} from "./format";
import type {
  Assessment,
  AthleteCurrent,
  AthleteScores,
  CoachNote,
  Goal,
  Insights,
  MovementAssessment,
  Personality,
} from "./types";

export interface Handoff {
  professional: {
    currentLevel: string;
    strengths: string[];
    weaknesses: string[];
    injuries: string[];
  };
  personality: {
    motivationTriggers: string[];
    communication: string[];
    retentionRisks: string[];
  };
}

export interface HandoffInput {
  status: string;
  latestAssessment: Assessment | null;
  movements: MovementAssessment[];
  insights: Insights | null;
  personality: Personality | null;
  scores: AthleteScores | null;
  current: AthleteCurrent | null;
  latestNote: CoachNote | null;
  topGoal: Goal | null;
}

function avgScore(a: Assessment | null): number | null {
  if (!a) return null;
  const vals = ASSESSMENT_DIMENSIONS.map(
    (d) => a[d.key as keyof Assessment] as number | null,
  ).filter((v): v is number => v != null);
  if (vals.length === 0) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function buildHandoff(input: HandoffInput): Handoff {
  const {
    status,
    latestAssessment: a,
    movements,
    insights,
    personality,
    scores,
    topGoal,
    latestNote,
  } = input;

  // --- Current level -------------------------------------------------------
  const avg = avgScore(a);
  const levelParts: string[] = [];
  if (a?.experience_level) levelParts.push(EXPERIENCE_LABELS[a.experience_level]);
  if (avg != null) levelParts.push(`כושר ממוצע ${avg}/10`);
  const currentLevel = levelParts.length ? levelParts.join(" · ") : "טרם הוערך";

  // --- Strengths -----------------------------------------------------------
  const strengths = [...(insights?.strengths ?? [])];
  if (a) {
    for (const d of ASSESSMENT_DIMENSIONS) {
      const v = a[d.key as keyof Assessment] as number | null;
      if (v != null && v >= 8) strengths.push(`${d.label} (${v}/10)`);
    }
  }

  // --- Weaknesses ----------------------------------------------------------
  const weaknesses = [...(insights?.improvements ?? [])];
  if (a) {
    for (const d of ASSESSMENT_DIMENSIONS) {
      const v = a[d.key as keyof Assessment] as number | null;
      if (v != null && v <= 5) weaknesses.push(`${d.label} (${v}/10)`);
    }
  }
  // Movement faults, tagged with the movement they showed up in.
  for (const m of movements) {
    for (const issue of m.issues) {
      weaknesses.push(
        `${MOVEMENT_ISSUE_LABELS[issue] ?? titleCase(issue)} (${movementLabel(m.movement)})`,
      );
    }
  }

  // --- Injury considerations ----------------------------------------------
  const injuries: string[] = [];
  if (a?.injury_notes) injuries.push(a.injury_notes);
  if (latestNote?.category === "injury") injuries.push(latestNote.note);

  // --- Motivation triggers -------------------------------------------------
  const motivationTriggers = (personality?.motivation_styles ?? []).map(
    (m) => MOTIVATION_STYLE_LABELS[m] ?? titleCase(m),
  );

  // --- Communication preferences ------------------------------------------
  const communication: string[] = [];
  if (personality?.communication_style)
    communication.push(
      `מעדיף/ה תקשורת ${COMMUNICATION_LABELS[personality.communication_style] ?? personality.communication_style}`,
    );
  if (personality?.notes) communication.push(personality.notes);

  // --- Retention risks -----------------------------------------------------
  const retentionRisks: string[] = [];
  if (status === "frozen")
    retentionRisks.push("המנוי מוקפא — נדרשת חזרה לקשר עם החזרה.");
  if (status === "former")
    retentionRisks.push("מתאמן/ת לשעבר — נדרשת שיחת החזרה.");
  if (scores?.consistency != null && scores.consistency <= 5)
    retentionRisks.push(`דירוג עקביות נמוך (${scores.consistency}/10).`);
  if (scores?.engagement != null && scores.engagement <= 5)
    retentionRisks.push(`דירוג מעורבות נמוך (${scores.engagement}/10).`);
  if (scores?.progress != null && scores.progress <= 5)
    retentionRisks.push(`התקדמות מועטה לאחרונה (${scores.progress}/10).`);
  const noteAge = daysSince(latestNote?.created_at ?? null);
  if (noteAge == null)
    retentionRisks.push("אין הערות מאמן רשומות עדיין.");
  else if (noteAge > 30)
    retentionRisks.push(`לא תועד קשר מאמן ב-${noteAge} הימים האחרונים.`);
  if (topGoal) {
    const overdue = topGoal.due_date && new Date(topGoal.due_date) < new Date();
    if (overdue) retentionRisks.push(`מטרה פעילה "${topGoal.title}" עברה את תאריך היעד.`);
  }

  return {
    professional: { currentLevel, strengths, weaknesses, injuries },
    personality: { motivationTriggers, communication, retentionRisks },
  };
}

/** Plain-text rendering for copy-to-clipboard / email. */
export function handoffToText(name: string, h: Handoff): string {
  const section = (title: string, items: string[]) =>
    `${title}:\n${items.length ? items.map((i) => `  • ${i}`).join("\n") : "  • —"}`;
  return [
    `סיכום העברת מתאמן — ${name}`,
    "",
    "סיכום מקצועי",
    `רמה נוכחית: ${h.professional.currentLevel}`,
    section("חוזקות", h.professional.strengths),
    section("חולשות", h.professional.weaknesses),
    section("שיקולי פציעה", h.professional.injuries),
    "",
    "סיכום אישיות",
    section("טריגרים למוטיבציה", h.personality.motivationTriggers),
    section("העדפות תקשורת", h.personality.communication),
    section("סיכוני נטישה", h.personality.retentionRisks),
  ].join("\n");
}
