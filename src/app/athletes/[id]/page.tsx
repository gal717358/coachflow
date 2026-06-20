import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAthleteSnapshot } from "@/lib/queries";
import {
  COMMUNICATION_LABELS,
  exerciseLabel,
  formatDate,
  goalPercent,
  MOTIVATION_STYLE_LABELS,
  NOTE_CATEGORY_LABELS,
} from "@/lib/format";

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold leading-tight">{value}</div>
      {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

export default async function AthleteSnapshotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const snap = await getAthleteSnapshot(id);
  if (!snap) notFound();

  const {
    current,
    bmi,
    personality,
    insights,
    scores,
    latestNote,
    topGoal,
    recentLifts,
  } = snap;

  const pct = topGoal
    ? goalPercent(topGoal.current_value, topGoal.target_value)
    : null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Summary card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>סיכום</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label="מטרה"
              value={topGoal ? topGoal.title : "—"}
              sub={pct != null ? `${pct}% הושלמו` : undefined}
            />
            <Metric
              label="משקל"
              value={current?.weight != null ? `${current.weight} ק"ג` : "—"}
              sub={
                current?.measured_on
                  ? `נכון ל-${formatDate(current.measured_on)}`
                  : undefined
              }
            />
            <Metric
              label="אחוז שומן"
              value={current?.body_fat != null ? `${current.body_fat}%` : "—"}
            />
            <Metric label="BMI" value={bmi != null ? `${bmi}` : "—"} />
          </div>
        </CardContent>
      </Card>

      {/* Coach rating */}
      <Card>
        <CardHeader>
          <CardTitle>דירוג מאמן</CardTitle>
        </CardHeader>
        <CardContent>
          {scores ? (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {scores.overall ?? "—"}
                </span>
                <span className="text-sm text-muted-foreground">/ 10 כולל</span>
              </div>
              <dl className="space-y-1.5 text-sm">
                {(
                  [
                    ["עקביות", scores.consistency],
                    ["משמעת", scores.discipline],
                    ["טכניקה", scores.technique],
                    ["התקדמות", scores.progress],
                    ["מעורבות", scores.engagement],
                  ] as const
                ).map(([label, v]) => (
                  <div key={label} className="flex items-center gap-2">
                    <dt className="w-24 text-muted-foreground">{label}</dt>
                    <Progress value={(v ?? 0) * 10} className="h-1.5 flex-1" />
                    <dd className="w-6 text-end font-medium">{v ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">טרם דורג.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick insights */}
      <Card>
        <CardHeader>
          <CardTitle>תובנות מהירות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              חוזקות עיקריות
            </div>
            <ul className="space-y-1.5 text-sm">
              {(insights?.strengths ?? []).slice(0, 3).map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-primary">▲</span>
                  {s}
                </li>
              ))}
              {!insights?.strengths.length && (
                <li className="text-muted-foreground">—</li>
              )}
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              תחומים לשיפור
            </div>
            <ul className="space-y-1.5 text-sm">
              {(insights?.improvements ?? []).slice(0, 3).map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-amber-500">▼</span>
                  {s}
                </li>
              ))}
              {!insights?.improvements.length && (
                <li className="text-muted-foreground">—</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Personality */}
      <Card>
        <CardHeader>
          <CardTitle>איך לאמן אותם</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {(personality?.motivation_styles ?? []).map((m) => (
              <Badge key={m} variant="secondary">
                {MOTIVATION_STYLE_LABELS[m] ?? m}
              </Badge>
            ))}
          </div>
          {personality?.communication_style ? (
            <div className="text-sm">
              <span className="text-muted-foreground">תקשורת: </span>
              <span className="font-medium">
                {COMMUNICATION_LABELS[personality.communication_style]}
              </span>
            </div>
          ) : null}
          {personality?.notes ? (
            <p className="text-sm leading-relaxed">{personality.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              טרם הוגדר פרופיל אישיות.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Latest note */}
      <Card>
        <CardHeader>
          <CardTitle>הערה אחרונה</CardTitle>
        </CardHeader>
        <CardContent>
          {latestNote ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">
                  {NOTE_CATEGORY_LABELS[latestNote.category]}
                </Badge>
                <span>{formatDate(latestNote.created_at)}</span>
                {latestNote.coachName ? (
                  <span>· {latestNote.coachName}</span>
                ) : null}
              </div>
              <p className="text-sm leading-relaxed">״{latestNote.note}״</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">אין הערות עדיין.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent performance */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>ביצועים אחרונים</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLifts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {recentLifts.map((l) => (
                <div key={l.exercise} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    {exerciseLabel(l.exercise)}
                  </div>
                  <div className="text-lg font-semibold">
                    {l.weight} ק"ג × {l.reps}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    1RM משוער {l.estimated_1rm} ק"ג · {formatDate(l.date)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              אין רשומות ביצועים עדיין.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
