"use client";

import { useActionState } from "react";
import { saveInsights, type FormState } from "@/app/athletes/[id]/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Insights } from "@/lib/types";
import { FormMessage } from "./shared";
import { SubmitButton } from "./submit-button";

const initial: FormState = { ok: false };

export function InsightsForm({
  athleteId,
  insights,
}: {
  athleteId: string;
  insights: Insights | null;
}) {
  const action = saveInsights.bind(null, athleteId);
  const [state, formAction] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="strengths">חוזקות עיקריות</Label>
          <Textarea
            id="strengths"
            name="strengths"
            rows={4}
            defaultValue={(insights?.strengths ?? []).join("\n")}
            placeholder="פריט בכל שורה"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="improvements">תחומים לשיפור</Label>
          <Textarea
            id="improvements"
            name="improvements"
            rows={4}
            defaultValue={(insights?.improvements ?? []).join("\n")}
            placeholder="פריט בכל שורה"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        פריט בכל שורה. תמונת המצב מציגה את שלושת הראשונים מכל אחד.
      </p>
      <div className="flex items-center gap-3">
        <SubmitButton>שמור תובנות</SubmitButton>
        <FormMessage state={state} success="נשמר." />
      </div>
    </form>
  );
}
