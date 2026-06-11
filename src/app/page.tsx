import Link from "next/link";
import { getDashboardData, getUpdateData } from "@/db/queries";
import { getAccountsList, getCategories } from "@/db/mutations";
import { Nav } from "@/components/ui/Nav";
import { BottomNav } from "@/components/ui/BottomNav";
import { StatTile } from "@/components/ui/StatTile";
import { Hero } from "@/components/dashboard/Hero";
import { ThisMonth } from "@/components/dashboard/ThisMonth";
import { NetWorthChart } from "@/components/dashboard/NetWorthChart";
import { SpendBreakdown } from "@/components/dashboard/SpendBreakdown";
import { CoachingCard } from "@/components/dashboard/CoachingCard";
import { AddTransaction } from "@/components/transactions/AddTransaction";
import { ShareProgress } from "@/components/share/ShareProgress";
import { eur, formatDate } from "@/lib/format";

// DB-backed reads must run per-request, not be statically cached at build.
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="text-2xl font-bold">Bienvenido a FIRE Tracker</h1>
        <p className="mt-2 text-ink/60">Aún no has configurado tu perfil.</p>
        <Link href="/onboarding" className="neu-btn-primary mt-6 inline-block">
          Empezar
        </Link>
      </main>
    );
  }

  const [accounts, categories, update] = await Promise.all([
    getAccountsList(),
    getCategories(),
    getUpdateData(),
  ]);
  const runway = Number.isFinite(data.monthsRunway) ? data.monthsRunway.toFixed(1) : "∞";

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-2">
      <Nav />
      <div className="mt-1 flex flex-wrap justify-end gap-x-4 gap-y-1 px-1">
        <Link href="/historial" className="text-xs font-bold text-teal">
          Historial →
        </Link>
        <Link href="/actualizar" className="text-xs font-bold text-teal">
          Actualizar saldos →
        </Link>
        <Link href="/accounts" className="text-xs font-bold text-teal">
          Gestionar cuentas →
        </Link>
      </div>

      {/* Grid of neumorphic tiles — wide gaps so the soft shadows don't overlap. */}
      <div className="mt-4 grid grid-cols-2 gap-5">
        {update.needsUpdate && (
          <Link
            href="/actualizar"
            className="col-span-2 block rounded-2xl bg-surface p-4 shadow-neu-sm"
          >
            <p className="text-sm font-bold text-teal">📅 Es un mes nuevo</p>
            <p className="mt-0.5 text-sm text-ink/65">
              Actualiza tus saldos para que tu progreso FIRE siga exacto. Tardas 30 segundos →
            </p>
          </Link>
        )}
        <Hero data={data} />
        <ThisMonth data={data} />

        <StatTile label="Patrimonio neto" value={eur(data.netWorthValue)} />
        <StatTile
          label="Colchón"
          value={
            <>
              {runway} <span className="text-xs font-normal text-ink/40">meses</span>
            </>
          }
          valueClassName={data.monthsRunway < 3 ? "text-warn" : ""}
        />
        <StatTile label="Coast FIRE" value={eur(data.coastFireValue)} />
        <StatTile
          label="Racha"
          value={
            <>
              {data.streak.current} 🔥
            </>
          }
          sub={`Mejor: ${data.streak.best}`}
        />

        {data.latestMilestone ? (
          <StatTile
            className="col-span-2"
            label="Último logro"
            value={<span className="text-base">🏅 {data.latestMilestone.title}</span>}
            sub={data.latestMilestone.description}
          />
        ) : (
          <StatTile
            className="col-span-2"
            label="Último logro"
            value={<span className="text-base text-ink/40">Invierte para tu primer logro</span>}
          />
        )}

        <NetWorthChart series={data.netWorthSeries} />
        <SpendBreakdown data={data} />
        <CoachingCard data={data} />
        <ShareProgress
          progress={data.progress}
          fireNumber={data.fireNumberValue}
          invested={data.investedNetWorthValue}
          netWorth={data.netWorthValue}
          fireDateLabel={data.projection.onTrack && data.projection.date ? formatDate(data.projection.date) : null}
        />
      </div>

      <AddTransaction
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, type: a.type }))}
        categories={categories.map((c) => ({ name: c.name, kind: c.kind }))}
      />
      <BottomNav />
    </main>
  );
}
