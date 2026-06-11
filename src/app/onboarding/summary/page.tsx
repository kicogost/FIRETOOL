import Link from "next/link";
import { getDashboardData } from "@/db/queries";
import { projectedFireDate } from "@/lib/fire";
import { eur, pct, formatDate, fireDatePhrase } from "@/lib/format";
import { FIRE_VARIANT_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

/**
 * "Tu punto de partida" — the payoff screen right after onboarding (PRD §5).
 * Shows the FIRE number and a projected date based on the user's monthly
 * surplus, so the cause-and-effect of saving is felt within two minutes.
 */
export default async function SummaryPage() {
  const data = await getDashboardData();
  if (!data) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <p className="text-gray-600">No hay datos. Vuelve a empezar.</p>
        <Link href="/onboarding" className="mt-4 inline-block font-semibold text-emerald-700">
          Ir al cuestionario
        </Link>
      </main>
    );
  }

  const surplus = Math.max(0, data.thisMonth.income - data.thisMonth.expenses);
  const projection = projectedFireDate({
    investedAssets: data.investedNetWorthValue,
    monthlyContribution: surplus,
    fireNumber: data.fireNumberValue,
    expectedAnnualReturn: Number(data.profile.expectedReturn),
    from: new Date(),
  });

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <p className="text-sm font-medium text-emerald-700">Tu punto de partida</p>
      <h1 className="mt-1 text-3xl font-bold leading-snug">
        Hola {data.profile.name}, esto es lo que sabemos hoy.
      </h1>

      <div className="mt-8 space-y-4">
        <Stat label="Tu número FIRE" value={eur(data.fireNumberValue)}
          sub={`Objetivo: ${FIRE_VARIANT_LABELS[data.profile.fireVariant] ?? ""}`} />
        <Stat label="Patrimonio invertido hoy" value={eur(data.investedNetWorthValue)}
          sub={`${pct(data.progress)} de tu meta`} />
        <Stat label="Ahorro mensual estimado" value={`${eur(surplus)}/mes`} />

        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
          <p className="text-sm text-emerald-100">Si inviertes tu ahorro cada mes…</p>
          {projection.onTrack && projection.date ? (
            <>
              <p className="mt-1 text-2xl font-bold">{formatDate(projection.date)}</p>
              <p className="text-sm text-emerald-100">
                serás libre {fireDatePhrase(projection)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-xl font-semibold">
              Aún no vas por buen camino — empieza invirtiendo cada mes.
            </p>
          )}
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 block rounded-xl bg-gray-900 py-3 text-center font-semibold text-white"
      >
        Ir a mi panel
      </Link>
      <p className="mt-3 text-center text-xs text-gray-400">
        Esto es educación financiera, no asesoramiento.
      </p>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-sm text-gray-400">{sub}</p>}
    </div>
  );
}
