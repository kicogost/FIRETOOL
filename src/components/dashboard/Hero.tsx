import { eur, pct, formatDate, fireDatePhrase } from "@/lib/format";
import type { DashboardData } from "@/db/queries";

/**
 * Hero: progress to FIRE. The projected FIRE date is the single most important
 * number in the product (PRD §3), so it gets the largest type.
 */
export function Hero({ data }: { data: DashboardData }) {
  const { progress, fireNumberValue, investedNetWorthValue, projection, isCoastFire } = data;
  const barPct = Math.min(100, progress * 100);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-md">
      <p className="text-sm font-medium text-emerald-100">Tu independencia financiera</p>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums">{pct(progress)}</span>
        <span className="text-emerald-100">
          de {eur(fireNumberValue)}
        </span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/25">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-700 ease-out"
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-emerald-100">
        {eur(investedNetWorthValue)} invertidos
      </p>

      <div className="mt-5 border-t border-white/20 pt-4">
        <p className="text-sm text-emerald-100">Fecha FIRE proyectada</p>
        {projection.onTrack && projection.date ? (
          <>
            <p className="text-2xl font-bold">{formatDate(projection.date)}</p>
            <p className="text-sm text-emerald-100">{fireDatePhrase(projection)}</p>
          </>
        ) : (
          <p className="text-xl font-semibold">Aún no vas por buen camino</p>
        )}
      </div>

      {isCoastFire && (
        <div className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
          🎉 ¡Has alcanzado Coast FIRE!
        </div>
      )}
    </section>
  );
}
