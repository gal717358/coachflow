"use client";

import { useActionState, useEffect, useRef } from "react";
import { addGoal, type FormState } from "@/app/athletes/[id]/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GOAL_STATUS_LABELS } from "@/lib/format";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function GoalForm({ athleteId }: { athleteId: string }) {
  const action = addGoal.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">כותרת</Label>
        <Input id="title" name="title" placeholder='לדוגמה: סקוואט 150 ק"ג' required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">תיאור</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor="current_value">נוכחי</Label>
          <Input id="current_value" name="current_value" type="number" step="any" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="target_value">יעד</Label>
          <Input id="target_value" name="target_value" type="number" step="any" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="horizon_days">טווח</Label>
          <select id="horizon_days" name="horizon_days" className={selectClass} defaultValue="90">
            <option value="30">30 ימים</option>
            <option value="90">90 ימים</option>
            <option value="180">180 ימים</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="due_date">תאריך יעד</Label>
          <Input id="due_date" name="due_date" type="date" />
        </div>
      </div>
      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="status">סטטוס</Label>
        <select id="status" name="status" className={selectClass} defaultValue="in_progress">
          {Object.entries(GOAL_STATUS_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>הוסף מטרה</SubmitButton>
        <FormMessage state={state} success="המטרה נוספה." />
      </div>
    </form>
  );
}
