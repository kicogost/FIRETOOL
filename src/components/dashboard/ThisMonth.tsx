import { Card } from "@/components/ui/Card";
import { eur, pct } from "@/lib/format";
import type { DashboardData } from "@/db/queries";

export function ThisMonth({ data }: { data: DashboardData }) {
  const { thisMonth, savingsRateTarget } = data;
  const onTarget = thisMonth.savingsRate >= savingsRateTarget;

  return (
    <Card title="Este mes">
      <div className="flex items-baseline justify-between">
        <span className="text-gray-600">Tasa de ahorro</span>
        <span
          className={`text-2xl font-bold tabular-nums ${
            thisMonth.savingsRate < 0 ? "text-red-600" : onTarget ? "text-emerald-600" : "text-gray-900"
          }`}
        >
          {pct(thisMonth.savingsRate)}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Objetivo: {pct(savingsRateTarget)} {onTarget ? "· ¡conseguido!" : ""}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Metric label="Ingresos" value={eur(thisMonth.income)} />
        <Metric label="Gastos" value={eur(thisMonth.expenses)} />
        <Metric label="Invertido" value={eur(thisMonth.contributions)} highlight />
      </div>
    </Card>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
