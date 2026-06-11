import { Card } from "@/components/ui/Card";
import { eur, pct } from "@/lib/format";
import type { CategorySlice } from "@/lib/spending";

export function CategoryBreakdown({ items }: { items: CategorySlice[] }) {
  if (items.length === 0) {
    return (
      <Card title="Por categoría" className="col-span-2">
        <p className="text-sm text-ink/40">Sin gastos registrados este mes.</p>
      </Card>
    );
  }
  const max = Math.max(...items.map((c) => c.amount), 1);

  return (
    <Card title="Por categoría" className="col-span-2">
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.category}>
            <div className="flex items-center justify-between text-sm">
              <span>{c.category}</span>
              <span className="font-bold tabular-nums">
                {eur(c.amount)} <span className="text-xs font-normal text-ink/40">· {pct(c.share)}</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface shadow-neu-inset">
              <div className="h-full rounded-full bg-teal" style={{ width: `${(c.amount / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
