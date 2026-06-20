"use client";

import { useActionState, useEffect, useRef } from "react";
import { addNote, type FormState } from "@/app/athletes/[id]/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NOTE_CATEGORY_LABELS } from "@/lib/format";
import { FormMessage, selectClass } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function NoteForm({ athleteId }: { athleteId: string }) {
  const action = addNote.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="category">קטגוריה</Label>
        <select id="category" name="category" className={selectClass} defaultValue="general">
          {Object.entries(NOTE_CATEGORY_LABELS).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="note">הערה</Label>
        <Textarea id="note" name="note" rows={3} placeholder="מה קרה באימון הזה?" required />
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton>הוסף הערה</SubmitButton>
        <FormMessage state={state} success="ההערה נוספה." />
      </div>
    </form>
  );
}
