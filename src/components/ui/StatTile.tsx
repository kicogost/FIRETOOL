import { Card } from "./Card";

/** A compact 1×1 bento stat cell: label + a big mono value (+ optional sub). */
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
      <p className="text-xs text-ink/50">{label}</p>
      <p className={`mt-1 font-mono text-lg font-bold tabular-nums ${valueClassName}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/40">{sub}</p>}
    </Card>
  );
}
