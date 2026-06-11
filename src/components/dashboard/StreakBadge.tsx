import { Card } from "@/components/ui/Card";
import type { DashboardData } from "@/db/queries";

export function StreakBadge({ data }: { data: DashboardData }) {
  const { streak, latestMilestone } = data;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="!p-4">
        <p className="text-xs text-gray-500">Racha</p>
        <p className="mt-1 text-2xl font-bold tabular-nums">
          {streak.current} {streak.current === 1 ? "mes" : "meses"} 🔥
        </p>
        <p className="text-xs text-gray-400">Mejor racha: {streak.best}</p>
      </Card>
      <Card className="!p-4">
        <p className="text-xs text-gray-500">Último logro</p>
        {latestMilestone ? (
          <>
            <p className="mt-1 text-sm font-bold">🏅 {latestMilestone.title}</p>
            <p className="text-xs text-gray-400">{latestMilestone.description}</p>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-400">Invierte para ganar tu primer logro.</p>
        )}
      </Card>
    </div>
  );
}
