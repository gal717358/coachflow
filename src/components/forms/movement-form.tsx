"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addMovementAssessment,
  type FormState,
} from "@/app/athletes/[id]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MOVEMENT_ISSUE_LABELS, MOVEMENTS, movementLabel } from "@/lib/format";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function MovementForm({ athleteId }: { athleteId: string }) {
  const action = addMovementAssessment.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="grid gap-2">
          <Label htmlFor="m-date">Date</Label>
          <Input id="m-date" name="date" type="date" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="movement">Movement</Label>
          <select id="movement" name="movement" className={selectClass} defaultValue="squat">
            {MOVEMENTS.map((m) => (
              <option key={m} value={m}>
                {movementLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2 sm:max-w-[8rem]">
        <Label htmlFor="score">Score (1–10)</Label>
        <Input id="score" name="score" type="number" min="1" max="10" step="1" />
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">Movement issues</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(MOVEMENT_ISSUE_LABELS).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="issues"
                value={value}
                className="size-4 rounded border-input accent-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} placeholder="Technique observations" />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>Add movement assessment</SubmitButton>
        <FormMessage state={state} success="Movement assessment added." />
      </div>
    </form>
  );
}
