import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceForm } from "@/components/forms/performance-form";
import {
  PerformanceChart,
  type PerfSeries,
} from "@/components/charts/performance-chart";
import { canCurrentUserEdit, getPerformance } from "@/lib/queries";
import { exerciseLabel, formatDate, shortDate } from "@/lib/format";
import type { Exercise, ExercisePerformance } from "@/lib/types";

const EXERCISES: Exercise[] = ["squat", "deadlift", "bench_press", "pull_up"];

const SERIES: PerfSeries[] = [
  { key: "squat", label: "Squat", color: "var(--chart-1)" },
  { key: "deadlift", label: "Deadlift", color: "var(--chart-2)" },
  { key: "bench_press", label: "Bench Press", color: "var(--chart-3)" },
  { key: "pull_up", label: "Pull-Up", color: "var(--chart-4)" },
];

/** Merge entries into one row per date with best e1RM per exercise. */
function progressionData(rows: ExercisePerformance[]) {
  const byDate = new Map<string, Record<string, string | number | null>>();
  for (const r of [...rows].sort((a, b) => (a.date < b.date ? -1 : 1))) {
    const row = byDate.get(r.date) ?? { date: shortDate(r.date) };
    const prev = row[r.exercise];
    row[r.exercise] =
      prev == null ? r.estimated_1rm : Math.max(Number(prev), r.estimated_1rm);
    byDate.set(r.date, row);
  }
  return [...byDate.values()];
}

function personalRecords(rows: ExercisePerformance[]) {
  const prs = new Map<
    Exercise,
    { maxWeight: number; maxReps: number; best1rm: number }
  >();
  for (const r of rows) {
    const cur = prs.get(r.exercise) ?? {
      maxWeight: 0,
      maxReps: 0,
      best1rm: 0,
    };
    prs.set(r.exercise, {
      maxWeight: Math.max(cur.maxWeight, r.weight),
      maxReps: Math.max(cur.maxReps, r.reps),
      best1rm: Math.max(cur.best1rm, r.estimated_1rm),
    });
  }
  return prs;
}

export default async function PerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rows, canEdit] = await Promise.all([
    getPerformance(id),
    canCurrentUserEdit(id),
  ]);
  const prs = personalRecords(rows);
  const chartData = progressionData(rows);
  const chartSeries = SERIES.filter((s) =>
    rows.some((r) => r.exercise === s.key),
  );

  return (
    <div className="space-y-5">
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Log Lift</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceForm athleteId={id} />
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estimated 1RM Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={chartData} series={chartSeries} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {EXERCISES.map((e) => {
              const pr = prs.get(e);
              return (
                <div key={e} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">
                    {exerciseLabel(e)}
                  </div>
                  <div className="text-lg font-semibold">
                    {pr ? `${pr.best1rm} kg` : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pr
                      ? `best e1RM · max ${pr.maxWeight}kg · ${pr.maxReps} reps`
                      : "no entries"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="py-2 pe-4 font-medium">Date</th>
                    <th className="py-2 pe-4 font-medium">Exercise</th>
                    <th className="py-2 pe-4 font-medium">Weight</th>
                    <th className="py-2 pe-4 font-medium">Reps</th>
                    <th className="py-2 pe-4 font-medium">Est. 1RM</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pe-4 font-medium">
                        {formatDate(r.date)}
                      </td>
                      <td className="py-2 pe-4">{exerciseLabel(r.exercise)}</td>
                      <td className="py-2 pe-4">{r.weight} kg</td>
                      <td className="py-2 pe-4">{r.reps}</td>
                      <td className="py-2 pe-4">{r.estimated_1rm} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
