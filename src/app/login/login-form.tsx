"use client";

import { useActionState, useRef } from "react";
import { signIn, type AuthState } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";

const initial: AuthState = {};

const DEMO_ACCOUNTS = [
  { label: "בעלים — דנה", email: "owner@studio.test" },
  { label: "מאמן — יוסי", email: "john@studio.test" },
  { label: "מאמנת — מאיה", email: "maya@studio.test" },
];
const DEMO_PASSWORD = "coachflow123";

export function LoginForm() {
  const [state, action] = useActionState(signIn, initial);
  const formRef = useRef<HTMLFormElement>(null);

  function quickLogin(email: string) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("email") as HTMLInputElement).value = email;
    (form.elements.namedItem("password") as HTMLInputElement).value =
      DEMO_PASSWORD;
    form.requestSubmit();
  }

  return (
    <form ref={formRef} action={action} className="space-y-4">
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

      <div className="relative py-2 text-center">
        <span className="bg-card relative z-10 px-2 text-xs text-muted-foreground">
          או כניסת הדגמה
        </span>
        <span className="absolute inset-x-0 top-1/2 border-t" />
      </div>

      <div className="grid gap-2">
        {DEMO_ACCOUNTS.map((a) => (
          <Button
            key={a.email}
            type="button"
            variant="outline"
            onClick={() => quickLogin(a.email)}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </form>
  );
}
