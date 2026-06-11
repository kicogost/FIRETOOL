import { Card } from "@/components/ui/Card";
import { eur, pct } from "@/lib/format";
import type { DashboardData } from "@/db/queries";

export function ThisMonth({ data }: { data: DashboardData }) {
  const { thisMonth, savingsRateTarget } = data;
  const onTarget = thisMonth.savingsRate >= savingsRateTarget;

  return (
    <Card title="Este mes" className="col-span-2">
      <div className="flex items-baseline justify-between">
        <span className="text-ink/60">Tasa de ahorro</span>
        <span
          className={`font-mono text-2xl font-bold tabular-nums ${
            thisMonth.savingsRate < 0 ? "text-danger" : onTarget ? "text-success" : "text-ink"
          }`}
        >
          {pct(thisMonth.savingsRate)}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink/40">
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
    <div className="rounded-2xl bg-cream p-3">
      <p className="text-xs text-ink/50">{label}</p>
      <p className={`font-mono text-sm font-semibold ${highlight ? "text-success" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
