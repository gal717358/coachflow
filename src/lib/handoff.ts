// Rule-based athlete handoff synthesis (PRD module 11). Turns captured data into
// a coach-to-coach summary. AI-generated summaries are a documented V2 item;
// this is deterministic so it works offline and is auditable.

import {
  ASSESSMENT_DIMENSIONS,
  EXPERIENCE_LABELS,
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
  if (avg != null) levelParts.push(`avg fitness ${avg}/10`);
  const currentLevel = levelParts.length ? levelParts.join(" · ") : "Not yet assessed";

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
  const motivationTriggers = (personality?.motivation_styles ?? []).map(titleCase);

  // --- Communication preferences ------------------------------------------
  const communication: string[] = [];
  if (personality?.communication_style)
    communication.push(`Prefers ${titleCase(personality.communication_style)} communication`);
  if (personality?.notes) communication.push(personality.notes);

  // --- Retention risks -----------------------------------------------------
  const retentionRisks: string[] = [];
  if (status === "frozen")
    retentionRisks.push("Membership is frozen — re-engagement needed on return.");
  if (status === "former")
    retentionRisks.push("Former member — win-back conversation required.");
  if (scores?.consistency != null && scores.consistency <= 5)
    retentionRisks.push(`Low consistency rating (${scores.consistency}/10).`);
  if (scores?.engagement != null && scores.engagement <= 5)
    retentionRisks.push(`Low engagement rating (${scores.engagement}/10).`);
  if (scores?.progress != null && scores.progress <= 5)
    retentionRisks.push(`Limited recent progress (${scores.progress}/10).`);
  const noteAge = daysSince(latestNote?.created_at ?? null);
  if (noteAge == null)
    retentionRisks.push("No coach notes on record yet.");
  else if (noteAge > 30)
    retentionRisks.push(`No coach contact logged in ${noteAge} days.`);
  if (topGoal) {
    const overdue = topGoal.due_date && new Date(topGoal.due_date) < new Date();
    if (overdue) retentionRisks.push(`Active goal "${topGoal.title}" is past due.`);
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
    `ATHLETE HANDOFF — ${name}`,
    "",
    "PROFESSIONAL SUMMARY",
    `Current level: ${h.professional.currentLevel}`,
    section("Strengths", h.professional.strengths),
    section("Weaknesses", h.professional.weaknesses),
    section("Injury considerations", h.professional.injuries),
    "",
    "PERSONALITY SUMMARY",
    section("Motivation triggers", h.personality.motivationTriggers),
    section("Communication preferences", h.personality.communication),
    section("Retention risks", h.personality.retentionRisks),
  ].join("\n");
}
