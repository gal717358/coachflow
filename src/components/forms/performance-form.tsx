"use client";

import { useActionState, useEffect, useRef } from "react";
import { addPerformance, type FormState } from "@/app/athletes/[id]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exerciseLabel } from "@/lib/format";
import type { Exercise } from "@/lib/types";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };
const EXERCISES: Exercise[] = ["squat", "deadlift", "bench_press", "pull_up"];

export function PerformanceForm({ athleteId }: { athleteId: string }) {
  const action = addPerformance.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="exercise">Exercise</Label>
          <select id="exercise" name="exercise" className={selectClass} defaultValue="squat">
            {EXERCISES.map((e) => (
              <option key={e} value={e}>
                {exerciseLabel(e)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" name="weight" type="number" step="any" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="reps">Reps</Label>
          <Input id="reps" name="reps" type="number" min="1" required />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>Add entry</SubmitButton>
        <FormMessage state={state} success="Entry added. Estimated 1RM computed automatically." />
      </div>
    </form>
  );
}
