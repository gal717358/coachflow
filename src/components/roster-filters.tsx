"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { selectClass } from "@/components/forms/shared";
import type { User } from "@/lib/types";

export function RosterFilters({
  coaches,
  showCoachFilter,
}: {
  coaches: User[];
  showCoachFilter: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => {
      router.replace(next.toString() ? `/?${next}` : "/", { scroll: false });
    });
  }

  return (
    <div
      className={`mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 ${showCoachFilter ? "lg:grid-cols-5" : "lg:grid-cols-4"} ${pending ? "opacity-70" : ""}`}
    >
      <Input
        placeholder="חיפוש לפי שם…"
        defaultValue={params.get("q") ?? ""}
        onChange={(e) => setParam("q", e.target.value)}
        aria-label="חיפוש מתאמנים"
      />

      {showCoachFilter && (
        <select
          className={selectClass}
          defaultValue={params.get("coach") ?? ""}
          onChange={(e) => setParam("coach", e.target.value)}
          aria-label="סינון לפי מאמן"
        >
          <option value="">כל המאמנים</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      <select
        className={selectClass}
        defaultValue={params.get("status") ?? ""}
        onChange={(e) => setParam("status", e.target.value)}
        aria-label="סינון לפי סטטוס מנוי"
      >
        <option value="">כל הסטטוסים</option>
        <option value="active">פעיל</option>
        <option value="frozen">מוקפא</option>
        <option value="former">לשעבר</option>
      </select>

      <select
        className={selectClass}
        defaultValue={params.get("level") ?? ""}
        onChange={(e) => setParam("level", e.target.value)}
        aria-label="סינון לפי רמת כושר"
      >
        <option value="">כל הרמות</option>
        <option value="beginner">מתחיל</option>
        <option value="intermediate">בינוני</option>
        <option value="advanced">מתקדם</option>
      </select>

      <select
        className={selectClass}
        defaultValue={params.get("attention") ?? ""}
        onChange={(e) => setParam("attention", e.target.value)}
        aria-label="סינון לפי מצב טיפול"
      >
        <option value="">כל המצבים</option>
        <option value="assessment">נדרשת הערכה</option>
        <option value="goal">נדרשת סקירת מטרה</option>
        <option value="any">דורש טיפול</option>
      </select>
    </div>
  );
}
