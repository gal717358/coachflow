"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "", label: "תמונת מצב" },
  { slug: "profile", label: "פרופיל" },
  { slug: "notes", label: "הערות" },
  { slug: "goals", label: "מטרות" },
  { slug: "assessments", label: "הערכות" },
  { slug: "measurements", label: "מדידות" },
  { slug: "performance", label: "ביצועים" },
  { slug: "transfer", label: "העברה" },
];

export function AthleteTabs({ athleteId }: { athleteId: string }) {
  const pathname = usePathname();
  const base = `/athletes/${athleteId}`;

  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b">
      {TABS.map((t) => {
        const href = t.slug ? `${base}/${t.slug}` : base;
        const active = t.slug ? pathname === href : pathname === base;
        return (
          <Link
            key={t.slug}
            href={href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
