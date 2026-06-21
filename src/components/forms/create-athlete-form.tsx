"use client";

import { useActionState } from "react";
import { createAthlete, type FormState } from "@/app/athletes/actions";
import type { User } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function CreateAthleteForm({
  coaches,
  defaultCoachId,
}: {
  coaches: User[];
  defaultCoachId?: string;
}) {
  const [state, formAction] = useActionState(createAthlete, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="first_name">שם פרטי</Label>
          <Input id="first_name" name="first_name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last_name">שם משפחה</Label>
          <Input id="last_name" name="last_name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">אימייל</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input id="phone" name="phone" type="tel" dir="ltr" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gender">מין</Label>
          <select id="gender" name="gender" className={selectClass} defaultValue="">
            <option value="">— לא צוין —</option>
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
            <option value="other">אחר</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="birth_date">תאריך לידה</Label>
          <Input id="birth_date" name="birth_date" type="date" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="height_cm">גובה (ס״מ)</Label>
          <Input id="height_cm" name="height_cm" type="number" step="0.1" min="0" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="start_date">תאריך תחילת אימון</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">סטטוס</Label>
          <select id="status" name="status" className={selectClass} defaultValue="active">
            <option value="active">פעיל</option>
            <option value="frozen">מוקפא</option>
            <option value="former">לשעבר</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="primary_coach_id">מאמן ראשי</Label>
          <select
            id="primary_coach_id"
            name="primary_coach_id"
            className={selectClass}
            defaultValue={defaultCoachId ?? ""}
          >
            <option value="">— ללא —</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="secondary_coach_id">מאמן משני</Label>
          <select
            id="secondary_coach_id"
            name="secondary_coach_id"
            className={selectClass}
            defaultValue=""
          >
            <option value="">— ללא —</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>צור מתאמן</SubmitButton>
        <FormMessage state={state} success="המתאמן נוצר." />
      </div>
    </form>
  );
}
