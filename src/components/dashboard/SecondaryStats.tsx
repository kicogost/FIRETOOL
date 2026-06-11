import { Card } from "@/components/ui/Card";
import { eur } from "@/lib/format";
import type { DashboardData } from "@/db/queries";

export function SecondaryStats({ data }: { data: DashboardData }) {
  const { monthsRunway, coastFireValue, netWorthValue } = data;
  const runway = Number.isFinite(monthsRunway) ? monthsRunway.toFixed(1) : "∞";
  const runwayOk = monthsRunway >= 3;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="!p-4">
        <p className="text-xs text-gray-500">Patrimonio neto</p>
        <p className="mt-1 text-base font-bold tabular-nums">{eur(netWorthValue)}</p>
      </Card>
      <Card className="!p-4">
        <p className="text-xs text-gray-500">Colchón</p>
        <p className={`mt-1 text-base font-bold tabular-nums ${runwayOk ? "" : "text-amber-600"}`}>
          {runway} <span className="text-xs font-normal text-gray-400">meses</span>
        </p>
      </Card>
      <Card className="!p-4">
        <p className="text-xs text-gray-500">Coast FIRE</p>
        <p className="mt-1 text-base font-bold tabular-nums">{eur(coastFireValue)}</p>
      </Card>
    </div>
  );
}
