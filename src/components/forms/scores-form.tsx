"use client";

import { useActionState } from "react";
import { saveScores, type FormState } from "@/app/athletes/[id]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AthleteScores } from "@/lib/types";
import { FormMessage } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

const FIELDS: [key: keyof AthleteScores, label: string][] = [
  ["consistency", "Consistency"],
  ["discipline", "Discipline"],
  ["technique", "Technique"],
  ["progress", "Progress"],
  ["engagement", "Engagement"],
];

export function ScoresForm({
  athleteId,
  scores,
}: {
  athleteId: string;
  scores: AthleteScores | null;
}) {
  const action = saveScores.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {FIELDS.map(([key, label]) => (
          <div key={key} className="grid gap-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              name={key}
              type="number"
              min="1"
              max="10"
              step="1"
              defaultValue={(scores?.[key] as number | null) ?? ""}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>Save rating</SubmitButton>
        <FormMessage state={state} success="Saved." />
        {scores?.overall != null && (
          <span className="text-sm text-muted-foreground">
            Overall: <span className="font-medium text-foreground">{scores.overall}</span>/10
          </span>
        )}
      </div>
    </form>
  );
}
