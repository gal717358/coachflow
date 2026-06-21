import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeasurementForm } from "@/components/forms/measurement-form";
import { TrendChart } from "@/components/charts/trend-chart";
import { canCurrentUserEdit, getMeasurements } from "@/lib/queries";
import { formatDate, shortDate } from "@/lib/format";

const COLS: [key: string, label: string][] = [
  ["weight", "משקל"],
  ["body_fat", "אחוז שומן"],
  ["muscle_mass", "שריר"],
  ["waist", "מותניים"],
  ["hips", "ירכיים"],
  ["arm", "זרוע"],
];

export default async function MeasurementsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [rows, canEdit] = await Promise.all([
    getMeasurements(id),
    canCurrentUserEdit(id),
  ]);

  const asc = [...rows].reverse();
  const trend = (key: "weight" | "body_fat" | "muscle_mass") =>
    asc.map((r) => ({
      date: shortDate(r.date),
      value: r[key] != null ? Number(r[key]) : null,
    }));

  return (
    <div className="space-y-5">
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>הוספת מדידה</CardTitle>
          </CardHeader>
          <CardContent>
            <MeasurementForm athleteId={id} />
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>מגמות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <TrendChart
                title="משקל"
                unit=' ק"ג'
                color="var(--chart-1)"
                data={trend("weight")}
              />
              <TrendChart
                title="אחוז שומן"
                unit="%"
                color="var(--chart-3)"
                data={trend("body_fat")}
              />
              <TrendChart
                title="מסת שריר"
                unit=' ק"ג'
                color="var(--chart-2)"
                data={trend("muscle_mass")}
                goodDirection="up"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>היסטוריה</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין מדידות עדיין.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="py-2 pe-4 font-medium">תאריך</th>
                    {COLS.map(([key, label]) => (
                      <th key={key} className="py-2 pe-4 font-medium">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pe-4 font-medium">
                        {formatDate(r.date)}
                      </td>
                      {COLS.map(([key]) => (
                        <td key={key} className="py-2 pe-4">
                          {r[key] ?? "—"}
                        </td>
                      ))}
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
