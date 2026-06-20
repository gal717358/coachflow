import { cn } from "@/lib/utils";

/** Native <select> styled to match the ShadCN Input. */
export const selectClass = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs",
  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
);

export function FormMessage({
  state,
  success,
}: {
  state: { ok: boolean; error?: string };
  success: string;
}) {
  if (state.error) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }
  if (state.ok) {
    return <p className="text-sm text-primary">{success}</p>;
  }
  return null;
}
