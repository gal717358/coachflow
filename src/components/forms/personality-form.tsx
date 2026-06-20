"use client";

import { useActionState } from "react";
import { savePersonality, type FormState } from "@/app/athletes/[id]/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COMMUNICATION_LABELS,
  MOTIVATION_STYLE_LABELS,
} from "@/lib/format";
import type { Personality } from "@/lib/types";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function PersonalityForm({
  athleteId,
  personality,
}: {
  athleteId: string;
  personality: Personality | null;
}) {
  const action = savePersonality.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);
  const selected = new Set(personality?.motivation_styles ?? []);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <div className="mb-2 text-sm font-medium">Motivation style</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(MOTIVATION_STYLE_LABELS).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="motivation_styles"
                value={value}
                defaultChecked={selected.has(value)}
                className="size-4 rounded border-input accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="communication_style">Communication style</Label>
        <select
          id="communication_style"
          name="communication_style"
          className={selectClass}
          defaultValue={personality?.communication_style ?? ""}
        >
          <option value="">—</option>
          {Object.entries(COMMUNICATION_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Coaching notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={personality?.notes ?? ""}
          placeholder="e.g. Responds best to positive reinforcement and measurable goals."
        />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>Save personality</SubmitButton>
        <FormMessage state={state} success="Saved." />
      </div>
    </form>
  );
}
