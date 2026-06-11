"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { eur, pct, formatMonth } from "@/lib/format";
import type { MonthSummary } from "@/lib/history";

type Metric = "netWorth" | "savingsRate" | "expenses" | "contributions";

const METRICS: { key: Metric; label: string; kind: "line" | "bar"; fmt: (n: number) => string }[] = [
  { key: "netWorth", label: "Patrimonio", kind: "line", fmt: eur },
  { key: "savingsRate", label: "Ahorro", kind: "line", fmt: pct },
  { key: "expenses", label: "Gastos", kind: "bar", fmt: eur },
  { key: "contributions", label: "Invertido", kind: "bar", fmt: eur },
];

export function HistoryChart({ summaries }: { summaries: MonthSummary[] }) {
  const [metric, setMetric] = useState<Metric>("netWorth");
  const cfg = METRICS.find((m) => m.key === metric)!;

  // Oldest → newest, last 12 months, drop net-worth nulls only for that metric.
  const data = [...summaries]
    .reverse()
    .slice(-12)
    .map((m) => ({ month: m.month, value: m[metric] ?? 0 }));

  return (
    <div className="rounded-2xl bg-surface p-5 shadow-neu">
      <div className="flex flex-wrap gap-2">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              metric === m.key ? "bg-surface text-teal shadow-neu-inset" : "bg-surface text-ink/55 shadow-neu-sm"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fontSize: 11, fill: "rgba(30,41,56,0.45)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={16}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              formatter={(v) => [cfg.fmt(Number(v)), cfg.label]}
              labelFormatter={(l) => formatMonth(String(l))}
              contentStyle={{
                borderRadius: 14,
                border: "none",
                background: "#E7E5E4",
                boxShadow: "6px 6px 12px #c7c5c4, -6px -6px 12px #ffffff",
                fontSize: 12,
                color: "#1E2938",
              }}
            />
            {cfg.kind === "line" ? (
              <Line type="monotone" dataKey="value" stroke="#006666" strokeWidth={2.5} dot={false} />
            ) : (
              <Bar dataKey="value" fill="#006666" radius={[4, 4, 0, 0]} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
