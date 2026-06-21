"use client";

import { useActionState } from "react";
import { reassignCoaches, type FormState } from "@/app/athletes/[id]/actions";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/types";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function ReassignForm({
  athleteId,
  users,
  primaryId,
  secondaryId,
}: {
  athleteId: string;
  users: User[];
  primaryId: string | null;
  secondaryId: string | null;
}) {
  const action = reassignCoaches.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="primary_coach_id">מאמן ראשי</Label>
          <select
            id="primary_coach_id"
            name="primary_coach_id"
            className={selectClass}
            defaultValue={primaryId ?? ""}
          >
            <option value="">— בחר —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === "owner" ? "בעלים" : "מאמן"})
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="secondary_coach_id">מאמן משני (אופציונלי)</Label>
          <select
            id="secondary_coach_id"
            name="secondary_coach_id"
            className={selectClass}
            defaultValue={secondaryId ?? ""}
          >
            <option value="">— ללא —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === "owner" ? "בעלים" : "מאמן"})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>שמור שיוך</SubmitButton>
        <FormMessage state={state} success="המאמנים שויכו מחדש." />
      </div>
    </form>
  );
}
