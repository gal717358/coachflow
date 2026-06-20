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
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Temporary password</Label>
          <Input
            id="password"
            name="password"
            type="text"
            minLength={6}
            placeholder="min 6 characters"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="role">Role</Label>
          <select id="role" name="role" className={selectClass} defaultValue="coach">
            <option value="coach">Coach</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>Create user</SubmitButton>
        <FormMessage state={state} success="User created." />
      </div>
    </form>
  );
}
