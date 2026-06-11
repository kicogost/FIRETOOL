import { Card } from "./Card";

/** A compact neumorphic stat cell: label + a big value (+ optional sub). */
export function StatTile({
  label,
  value,
  sub,
  valueClassName = "",
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <p className="text-xs font-bold uppercase tracking-wide text-ink/45">{label}</p>
      <p className={`mt-1.5 text-lg font-bold tabular-nums ${valueClassName}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/40">{sub}</p>}
    </Card>
  );
}
