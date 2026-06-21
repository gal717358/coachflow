"use client";

import { useActionState, useEffect, useRef } from "react";
import { addAssessment, type FormState } from "@/app/athletes/[id]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ASSESSMENT_DIMENSIONS, EXPERIENCE_LABELS } from "@/lib/format";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function AssessmentForm({ athleteId }: { athleteId: string }) {
  const action = addAssessment.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="a-date">תאריך</Label>
        <Input id="a-date" name="date" type="date" required />
      </div>

      <div>
        <div className="mb-2 text-sm font-medium">ציונים (1–10)</div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ASSESSMENT_DIMENSIONS.map((d) => (
            <div key={d.key} className="grid gap-2">
              <Label htmlFor={d.key}>{d.label}</Label>
              <Input
                id={d.key}
                name={d.key}
                type="number"
                min="1"
                max="10"
                step="1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="experience_level">רמת ניסיון</Label>
        <select
          id="experience_level"
          name="experience_level"
          className={selectClass}
          defaultValue=""
        >
          <option value="">—</option>
          {Object.entries(EXPERIENCE_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="injury_notes">היסטוריית פציעות</Label>
        <Textarea
          id="injury_notes"
          name="injury_notes"
          rows={2}
          placeholder="לדוגמה: שחזור רצועה צולבת; רגישות בגב תחתון"
        />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>שמור הערכה</SubmitButton>
        <FormMessage state={state} success="ההערכה נשמרה." />
      </div>
    </form>
  );
}
