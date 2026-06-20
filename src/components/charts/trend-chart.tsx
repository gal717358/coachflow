"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  date: string;
  value: number | null;
}

/** A single compact metric trend line (e.g. weight over time). */
export function TrendChart({
  title,
  unit,
  color,
  data,
  goodDirection = "down",
}: {
  title: string;
  unit: string;
  color: string;
  data: TrendPoint[];
  /** Which direction of change is positive for the athlete. */
  goodDirection?: "down" | "up" | "none";
}) {
  const points = data.filter((d) => d.value != null);
  const latest = points.at(-1)?.value ?? null;
  const first = points[0]?.value ?? null;
  const delta = latest != null && first != null ? latest - first : null;
  const good =
    delta == null || goodDirection === "none"
      ? null
      : goodDirection === "down"
        ? delta < 0
        : delta > 0;

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium">{title}</span>
        {latest != null && (
          <span className="text-sm text-muted-foreground">
            {latest}
            {unit}
            {delta != null && delta !== 0 && (
              <span
                className={
                  good ? "ms-1 text-emerald-600" : "ms-1 text-amber-600"
                }
              >
                ({delta > 0 ? "+" : ""}
                {Math.round(delta * 10) / 10})
              </span>
            )}
          </span>
        )}
      </div>
      {points.length < 2 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          Need at least two entries to chart a trend.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              width={44}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
              formatter={(v) => [`${v}${unit}`, title]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
