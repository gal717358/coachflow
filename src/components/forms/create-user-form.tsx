"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser, type FormState } from "@/app/users/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUser, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">שם</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">אימייל</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">סיסמה זמנית</Label>
          <Input
            id="password"
            name="password"
            type="text"
            minLength={6}
            placeholder="לפחות 6 תווים"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">תפקיד</Label>
          <select id="role" name="role" className={selectClass} defaultValue="coach">
            <option value="coach">מאמן</option>
            <option value="owner">בעלים</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>צור משתמש</SubmitButton>
        <FormMessage state={state} success="המשתמש נוצר." />
      </div>
    </form>
  );
}
