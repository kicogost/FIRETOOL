"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { eur, formatMonth } from "@/lib/format";
import type { NetWorthPoint } from "@/db/queries";

type Range = "6m" | "1y" | "all";
const RANGES: { key: Range; label: string; months: number | null }[] = [
  { key: "6m", label: "6M", months: 6 },
  { key: "1y", label: "1A", months: 12 },
  { key: "all", label: "Todo", months: null },
];

export function NetWorthChart({ series }: { series: NetWorthPoint[] }) {
  const [range, setRange] = useState<Range>("1y");
  const months = RANGES.find((r) => r.key === range)!.months;
  const data = months ? series.slice(-months) : series;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500">Patrimonio neto</h2>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                range === r.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="month"
              tickFormatter={formatMonth}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              formatter={(v) => [eur(Number(v)), "Patrimonio"]}
              labelFormatter={(l) => formatMonth(String(l))}
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#059669"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
