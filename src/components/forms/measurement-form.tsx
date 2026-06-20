"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMeasurement, type FormState } from "@/app/athletes/[id]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

const FIELDS: [name: string, label: string][] = [
  ["weight", 'משקל (ק"ג)'],
  ["body_fat", "אחוז שומן (%)"],
  ["muscle_mass", 'מסת שריר (ק"ג)'],
  ["waist", 'היקף מותניים (ס"מ)'],
  ["hips", 'היקף ירכיים (ס"מ)'],
  ["arm", 'היקף זרוע (ס"מ)'],
];

export function MeasurementForm({ athleteId }: { athleteId: string }) {
  const action = addMeasurement.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {FIELDS.map(([name, label]) => (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} name={name} type="number" step="any" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>Add measurement</SubmitButton>
        <FormMessage state={state} success="Measurement added." />
      </div>
    </form>
  );
}
