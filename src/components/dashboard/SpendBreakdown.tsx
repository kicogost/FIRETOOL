import { Card } from "@/components/ui/Card";
import { eur } from "@/lib/format";
import type { DashboardData } from "@/db/queries";

export function SpendBreakdown({ data }: { data: DashboardData }) {
  const { spendBreakdown } = data;
  const max = Math.max(1, ...spendBreakdown.map((c) => c.amount));

  return (
    <Card title="Gastos del mes" className="col-span-2">
      {spendBreakdown.length === 0 ? (
        <p className="text-sm text-ink/40">Sin gastos registrados este mes.</p>
      ) : (
        <ul className="space-y-3">
          {spendBreakdown.map((c) => (
            <li key={c.category}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  {c.category}
                  {c.fastestGrowing && (
                    <span className="rounded-full bg-warn/15 px-1.5 py-0.5 text-[10px] font-semibold text-warn">
                      ↑ en aumento
                    </span>
                  )}
                </span>
                <span className="font-mono font-semibold tabular-nums">{eur(c.amount)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream">
                <div
                  className={`h-full rounded-full ${c.fastestGrowing ? "bg-warn" : "bg-steel"}`}
                  style={{ width: `${(c.amount / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
