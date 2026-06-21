import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AssessmentForm } from "@/components/forms/assessment-form";
import { MovementForm } from "@/components/forms/movement-form";
import {
  canCurrentUserEdit,
  getAssessments,
  getMovementAssessments,
} from "@/lib/queries";
import {
  ASSESSMENT_DIMENSIONS,
  EXPERIENCE_LABELS,
  formatDate,
  movementLabel,
  MOVEMENT_ISSUE_LABELS,
  titleCase,
} from "@/lib/format";
import type { Assessment } from "@/lib/types";

export default async function AssessmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [assessments, movements, canEdit] = await Promise.all([
    getAssessments(id),
    getMovementAssessments(id),
    canCurrentUserEdit(id),
  ]);
  const latest = assessments[0] ?? null;

  return (
    <div className="space-y-5">
      {/* Fitness assessment */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>הערכת כושר חדשה</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentForm athleteId={id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            הערכת כושר
            {latest ? (
              <span className="ms-2 text-sm font-normal text-muted-foreground">
                אחרון {formatDate(latest.date)}
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latest ? (
            <LatestAssessment a={latest} />
          ) : (
            <p className="text-sm text-muted-foreground">
              אין הערכת כושר עדיין.
            </p>
          )}

          {assessments.length > 1 && (
            <div className="mt-6">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                הערכות קודמות
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-start text-muted-foreground">
                      <th className="py-2 pe-4 font-medium">תאריך</th>
                      {ASSESSMENT_DIMENSIONS.map((d) => (
                        <th key={d.key} className="py-2 pe-4 font-medium">
                          {d.label}
                        </th>
                      ))}
                      <th className="py-2 pe-4 font-medium">רמה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.slice(1).map((a) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-2 pe-4 font-medium">
                          {formatDate(a.date)}
                        </td>
                        {ASSESSMENT_DIMENSIONS.map((d) => (
                          <td key={d.key} className="py-2 pe-4">
                            {(a[d.key as keyof Assessment] as number) ?? "—"}
                          </td>
                        ))}
                        <td className="py-2 pe-4">
                          {a.experience_level
                            ? EXPERIENCE_LABELS[a.experience_level]
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movement assessment */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>הערכת תנועה חדשה</CardTitle>
          </CardHeader>
          <CardContent>
            <MovementForm athleteId={id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>הערכות תנועה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              אין הערכות תנועה עדיין.
            </p>
          ) : (
            movements.map((m) => (
              <div key={m.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {movementLabel(m.movement)}
                    </span>
                    {m.score != null && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {m.score}/10
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(m.date)}
                  </span>
                </div>
                {m.issues.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.issues.map((i) => (
                      <Badge key={i} variant="secondary" className="bg-amber-500/10 text-amber-700">
                        {MOVEMENT_ISSUE_LABELS[i] ?? titleCase(i)}
                      </Badge>
                    ))}
                  </div>
                )}
                {m.notes ? (
                  <p className="mt-2 text-sm leading-relaxed">{m.notes}</p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LatestAssessment({ a }: { a: Assessment }) {
  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {ASSESSMENT_DIMENSIONS.map((d) => {
          const v = a[d.key as keyof Assessment] as number | null;
          return (
            <div key={d.key} className="flex items-center gap-3 text-sm">
              <dt className="w-28 text-muted-foreground">{d.label}</dt>
              <Progress value={(v ?? 0) * 10} className="h-1.5 flex-1" />
              <dd className="w-8 text-end font-medium">{v ?? "—"}</dd>
            </div>
          );
        })}
      </dl>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {a.experience_level && (
          <span>
            <span className="text-muted-foreground">ניסיון: </span>
            <span className="font-medium">
              {EXPERIENCE_LABELS[a.experience_level]}
            </span>
          </span>
        )}
      </div>
      {a.injury_notes && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
          <span className="font-medium text-amber-700">היסטוריית פציעות: </span>
          {a.injury_notes}
        </div>
      )}
    </div>
  );
}
