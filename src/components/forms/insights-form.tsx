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
          <Label htmlFor="strengths">Top strengths</Label>
          <Textarea
            id="strengths"
            name="strengths"
            rows={4}
            defaultValue={(insights?.strengths ?? []).join("\n")}
            placeholder="One per line"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="improvements">Improvement areas</Label>
          <Textarea
            id="improvements"
            name="improvements"
            rows={4}
            defaultValue={(insights?.improvements ?? []).join("\n")}
            placeholder="One per line"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        One item per line. The Snapshot shows the top three of each.
      </p>
      <div className="flex items-center gap-3">
        <SubmitButton>Save insights</SubmitButton>
        <FormMessage state={state} success="Saved." />
      </div>
    </form>
  );
}
