import { eur, pct, formatDate, fireDatePhrase } from "@/lib/format";
import type { DashboardData } from "@/db/queries";

/**
 * Hero tile: progress to FIRE. The projected FIRE date is the single most
 * important number in the product (PRD §3), so it gets the largest type.
 * Neumorphic raised surface; the progress bar is an inset channel with a teal fill.
 */
export function Hero({ data }: { data: DashboardData }) {
  const { progress, fireNumberValue, investedNetWorthValue, projection, isCoastFire } = data;
  const barPct = Math.min(100, progress * 100);

  return (
    <section className="col-span-2 rounded-2xl bg-surface p-6 shadow-neu">
      <p className="text-xs font-bold uppercase tracking-wide text-teal">
        Tu libertad financiera
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-bold tabular-nums text-ink">{pct(progress)}</span>
        <span className="text-ink/50">de {eur(fireNumberValue)}</span>
      </div>

      <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-surface shadow-neu-inset">
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-700 ease-out"
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-ink/50">{eur(investedNetWorthValue)} invertidos</p>

      <div className="mt-5 rounded-2xl bg-surface p-4 shadow-neu-inset">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
          Fecha FIRE proyectada
        </p>
        {projection.onTrack && projection.date ? (
          <>
            <p className="mt-1 text-2xl font-bold text-ink">{formatDate(projection.date)}</p>
            <p className="text-sm text-ink/50">{fireDatePhrase(projection)}</p>
          </>
        ) : (
          <p className="mt-1 text-xl font-semibold text-ink">Aún no vas por buen camino</p>
        )}
      </div>

      {isCoastFire && (
        <div className="mt-4 inline-block rounded-xl bg-surface px-3 py-1.5 text-sm font-bold text-teal shadow-neu-sm">
          🎉 ¡Has alcanzado Coast FIRE!
        </div>
      )}
    </section>
  );
}
