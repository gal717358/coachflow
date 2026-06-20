import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GoalForm } from "@/components/forms/goal-form";
import { GoalUpdateForm } from "@/components/forms/goal-update-form";
import { canCurrentUserEdit, getGoals } from "@/lib/queries";
import { formatDate, GOAL_STATUS_LABELS, goalPercent } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export default async function GoalsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [goals, canEdit] = await Promise.all([
    getGoals(id),
    canCurrentUserEdit(id),
  ]);

  return (
    <div className="space-y-5">
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Add Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm athleteId={id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No goals yet.</p>
          ) : (
            goals.map((g) => {
              const pct = goalPercent(g.current_value, g.target_value);
              return (
                <div key={g.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{g.title}</div>
                      {g.description ? (
                        <p className="text-sm text-muted-foreground">
                          {g.description}
                        </p>
                      ) : null}
                    </div>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[g.status] ?? ""}
                    >
                      {GOAL_STATUS_LABELS[g.status]}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      {g.current_value ?? "—"} / {g.target_value ?? "—"}
                    </span>
                    {g.horizon_days ? <span>{g.horizon_days}-day</span> : null}
                    <span>Due {formatDate(g.due_date)}</span>
                  </div>

                  {pct != null && (
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={pct} className="h-1.5 flex-1" />
                      <span className="w-10 text-end text-xs font-medium">
                        {pct}%
                      </span>
                    </div>
                  )}

                  {canEdit && (
                    <div className="mt-4 border-t pt-3">
                      <GoalUpdateForm athleteId={id} goal={g} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
