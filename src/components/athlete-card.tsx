import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  age,
  EXPERIENCE_LABELS,
  fullName,
  initials,
  STATUS_LABELS,
} from "@/lib/format";
import { ALERT_LABELS } from "@/lib/alerts";
import type { RosterRow } from "@/lib/queries";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  frozen: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  former: "bg-muted text-muted-foreground",
};

export function AthleteCard({ row }: { row: RosterRow }) {
  const { athlete, current, primaryCoach, topGoal, experienceLevel, alerts } =
    row;
  const a = age(athlete.birth_date);

  return (
    <Link href={`/athletes/${athlete.id}`} className="group">
      <Card className="h-full gap-0 p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials(athlete)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold leading-tight group-hover:text-primary">
                {fullName(athlete)}
              </div>
              <div className="text-sm text-muted-foreground">
                {a != null ? `בן/בת ${a}` : "—"}
                {primaryCoach ? ` · ${primaryCoach.name}` : ""}
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={STATUS_STYLES[athlete.status] ?? ""}
          >
            {STATUS_LABELS[athlete.status]}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">משקל</div>
            <div className="font-medium">
              {current?.weight != null ? `${current.weight} ק"ג` : "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">אחוז שומן</div>
            <div className="font-medium">
              {current?.body_fat != null ? `${current.body_fat}%` : "—"}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-muted-foreground text-xs">מטרה מרכזית</div>
            {experienceLevel && (
              <span className="text-xs text-muted-foreground">
                {EXPERIENCE_LABELS[experienceLevel]}
              </span>
            )}
          </div>
          <div className="truncate text-sm font-medium">{topGoal ?? "—"}</div>
        </div>

        {alerts.kinds.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {alerts.kinds.map((k) => (
              <Badge
                key={k}
                variant="outline"
                className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[11px]"
              >
                {ALERT_LABELS[k]}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </Link>
  );
}
