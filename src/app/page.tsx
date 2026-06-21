import Link from "next/link";
import { AthleteCard } from "@/components/athlete-card";
import { RosterFilters } from "@/components/roster-filters";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currentUser, listUsers } from "@/lib/auth";
import { getRoster, type RosterRow } from "@/lib/queries";
import { ALERT_LABELS } from "@/lib/alerts";
import { fullName } from "@/lib/format";

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <Card className="gap-1 p-4">
      <div
        className={`text-2xl font-bold tracking-tight ${
          accent && Number(value) > 0 ? "text-amber-600" : ""
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}

function matches(row: RosterRow, sp: Record<string, string | undefined>) {
  if (sp.q && !fullName(row.athlete).toLowerCase().includes(sp.q.toLowerCase()))
    return false;
  if (
    sp.coach &&
    row.athlete.primary_coach_id !== sp.coach &&
    row.athlete.secondary_coach_id !== sp.coach
  )
    return false;
  if (sp.status && row.athlete.status !== sp.status) return false;
  if (sp.level && row.experienceLevel !== sp.level) return false;
  if (sp.attention === "assessment" && !row.alerts.assessmentDue) return false;
  if (sp.attention === "goal" && !row.goalDue) return false;
  if (sp.attention === "any" && row.alerts.kinds.length === 0) return false;
  return true;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [user, sp] = await Promise.all([currentUser(), searchParams]);
  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Card className="p-8 text-center text-muted-foreground">
          לא נמצאו משתמשים. הריצו את מיגרציית ובסיס הנתונים והזריעה, ואז רעננו.
        </Card>
      </div>
    );
  }

  const [roster, allUsers] = await Promise.all([getRoster(user), listUsers()]);
  const coaches = allUsers.filter((u) => u.role === "coach");

  // Studio overview (unfiltered).
  const active = roster.filter((r) => r.athlete.status === "active").length;
  const former = roster.filter((r) => r.athlete.status === "former").length;
  const assessmentsDue = roster.filter((r) => r.alerts.assessmentDue).length;
  const goalsDue = roster.filter((r) => r.goalDue).length;
  const attention = roster.filter((r) => r.alerts.kinds.length > 0);

  const filtered = roster.filter((r) => matches(r, sp));
  const isFiltered = Object.values(sp).some(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">סקירת הסטודיו</h1>
          <p className="text-sm text-muted-foreground">
            {user.role === "owner"
              ? "כל המתאמנים בסטודיו."
              : `המתאמנים שלך, ${user.name}.`}
          </p>
        </div>
        <Link href="/athletes/new" className={buttonVariants()}>
          הוספת מתאמן
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="סך המתאמנים" value={roster.length} />
        <Stat label="פעילים" value={active} />
        <Stat label="לשעבר" value={former} />
        <Stat label="הערכות נדרשות" value={assessmentsDue} accent />
        <Stat label="מטרות לסקירה" value={goalsDue} accent />
      </div>

      {attention.length > 0 && (
        <Card className="mb-8 p-5">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-semibold">דורש טיפול</h2>
            <Badge variant="secondary">{attention.length}</Badge>
          </div>
          <ul className="divide-y">
            {attention.map((r) => (
              <li key={r.athlete.id}>
                <Link
                  href={`/athletes/${r.athlete.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 hover:text-primary"
                >
                  <span className="font-medium">{fullName(r.athlete)}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {r.alerts.kinds.map((k) => (
                      <Badge
                        key={k}
                        variant="outline"
                        className="bg-amber-500/10 text-amber-700 border-amber-500/20"
                      >
                        {ALERT_LABELS[k]}
                      </Badge>
                    ))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <h2 className="mb-3 font-semibold">מתאמנים</h2>
      <RosterFilters coaches={coaches} showCoachFilter={user.role === "owner"} />

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          {isFiltered
            ? "אין מתאמנים התואמים לסינון."
            : "טרם שויכו אליך מתאמנים."}
        </Card>
      ) : (
        <>
          {isFiltered && (
            <p className="mb-3 text-sm text-muted-foreground">
              {filtered.length} מתוך {roster.length} מתאמנים
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((row) => (
              <AthleteCard key={row.athlete.id} row={row} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
