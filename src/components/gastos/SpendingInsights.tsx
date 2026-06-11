import type { SpendingInsight, InsightTone } from "@/lib/spending";

const TONE_TITLE: Record<InsightTone, string> = {
  warn: "text-warn",
  tip: "text-teal",
  info: "text-ink",
  positive: "text-success",
};

export function SpendingInsights({ insights }: { insights: SpendingInsight[] }) {
  if (insights.length === 0) {
    return (
      <div className="col-span-2 rounded-2xl bg-surface p-5 shadow-neu-inset">
        <p className="text-sm text-ink/55">
          Registra tus gastos y aquí verás análisis y avisos para gastar mejor: suscripciones,
          comisiones, categorías que se disparan y tu tasa de ahorro.
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-2 space-y-3">
      {insights.map((i) => (
        <div key={i.key} className="flex gap-3 rounded-2xl bg-surface p-4 shadow-neu-sm">
          <div className="text-2xl leading-none">{i.icon}</div>
          <div>
            <p className={`text-sm font-bold ${TONE_TITLE[i.tone]}`}>{i.title}</p>
            <p className="mt-0.5 text-sm text-ink/60">{i.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
