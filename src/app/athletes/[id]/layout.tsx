import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AthleteTabs } from "@/components/athlete-tabs";
import { currentUser } from "@/lib/auth";
import { getAthleteHeader } from "@/lib/queries";
import { canEditAthlete } from "@/lib/permissions";
import {
  age,
  fullName,
  GENDER_LABELS,
  initials,
  STATUS_LABELS,
} from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  frozen: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  former: "bg-muted text-muted-foreground",
};

export default async function AthleteLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;
  const [header, user] = await Promise.all([
    getAthleteHeader(id),
    currentUser(),
  ]);
  if (!header) notFound();

  const { athlete, primaryCoach, secondaryCoach } = header;
  const a = age(athlete.birth_date);
  const canEdit = canEditAthlete(user, athlete);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        → כל המתאמנים
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials(athlete)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {fullName(athlete)}
            </h1>
            <div className="text-sm text-muted-foreground">
              {a != null ? `בן/בת ${a}` : "—"}
              {athlete.gender ? ` · ${GENDER_LABELS[athlete.gender]}` : ""}
              {primaryCoach ? ` · מאמן ${primaryCoach.name}` : ""}
              {secondaryCoach ? ` ו${secondaryCoach.name}` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!canEdit && (
            <span className="text-xs text-muted-foreground">צפייה בלבד</span>
          )}
          <Badge
            variant="outline"
            className={`${STATUS_STYLES[athlete.status] ?? ""} text-sm`}
          >
            {STATUS_LABELS[athlete.status]}
          </Badge>
        </div>
      </div>

      <AthleteTabs athleteId={id} />

      {children}
    </div>
  );
}
