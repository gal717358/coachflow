"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Copies the plain-text handoff to the clipboard for email/Slack. */
export function CopySummaryButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "הועתק!" : "העתק סיכום"}
    </Button>
  );
}
