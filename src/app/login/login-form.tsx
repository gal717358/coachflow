"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";

const initial: AuthState = {};

export function LoginForm() {
  const [state, action] = useActionState(signIn, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">אימייל</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">סיסמה</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <SubmitButton>התחברות</SubmitButton>
    </form>
  );
}
