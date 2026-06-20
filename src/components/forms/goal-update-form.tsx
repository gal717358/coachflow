"use client";

import { useActionState } from "react";
import { updateGoal, type FormState } from "@/app/athletes/[id]/actions";
import { Input } from "@/components/ui/input";
import { GOAL_STATUS_LABELS } from "@/lib/format";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";
import type { Goal } from "@/lib/types";

const initial: FormState = { ok: false };

export function GoalUpdateForm({
  athleteId,
  goal,
}: {
  athleteId: string;
  goal: Goal;
}) {
  const action = updateGoal.bind(null, athleteId, goal.id);
  const [state, formAction] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-xs text-muted-foreground">
        נוכחי
        <Input
          name="current_value"
          type="number"
          step="any"
          defaultValue={goal.current_value ?? ""}
          className="h-9 w-28"
        />
      </label>
      <label className="grid gap-1 text-xs text-muted-foreground">
        סטטוס
        <select
          name="status"
          defaultValue={goal.status}
          className={`${selectClass} w-40`}
        >
          {Object.entries(GOAL_STATUS_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton>שמור</SubmitButton>
      <FormMessage state={state} success="עודכן." />
    </form>
  );
}
