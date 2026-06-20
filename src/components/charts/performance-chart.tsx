"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface PerfSeries {
  key: string;
  label: string;
  color: string;
}

/** Estimated-1RM progression, one line per exercise. Data rows are keyed by
 *  date with one column per exercise key (sparse values allowed). */
export function PerformanceChart({
  data,
  series,
}: {
  data: Record<string, string | number | null>[];
  series: PerfSeries[];
}) {
  if (data.length < 2) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Log at least two dated entries to chart 1RM progression.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 12, bottom: 0, left: 0 }}>
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
          width={44}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid var(--border)",
          }}
          formatter={(v, name) => [`${v} kg`, name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
