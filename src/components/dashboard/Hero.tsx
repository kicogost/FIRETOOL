import { eur, pct, formatDate, fireDatePhrase } from "@/lib/format";
import type { DashboardData } from "@/db/queries";

/**
 * Hero tile: progress to FIRE. The projected FIRE date is the single most
 * important number in the product (PRD §3), so it gets the largest type.
 * Bento peach accent surface with dark ink text.
 */
export function Hero({ data }: { data: DashboardData }) {
  const { progress, fireNumberValue, investedNetWorthValue, projection, isCoastFire } = data;
  const barPct = Math.min(100, progress * 100);

  return (
    <section className="col-span-2 rounded-tile bg-peach p-6 text-ink shadow-tile">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
        Tu libertad financiera
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-5xl font-bold tabular-nums">{pct(progress)}</span>
        <span className="text-ink/60">de {eur(fireNumberValue)}</span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-success transition-[width] duration-700 ease-out"
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="mt-1.5 font-mono text-xs text-ink/60">
        {eur(investedNetWorthValue)} invertidos
      </p>

      <div className="mt-5 border-t border-ink/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
          Fecha FIRE proyectada
        </p>
        {projection.onTrack && projection.date ? (
          <>
            <p className="font-mono text-2xl font-bold">{formatDate(projection.date)}</p>
            <p className="text-sm text-ink/60">{fireDatePhrase(projection)}</p>
          </>
        ) : (
          <p className="text-xl font-semibold">Aún no vas por buen camino</p>
        )}
      </div>

      {isCoastFire && (
        <div className="mt-4 inline-block rounded-full bg-ink/10 px-3 py-1 text-sm font-semibold">
          🎉 ¡Has alcanzado Coast FIRE!
        </div>
      )}
    </section>
  );
}
