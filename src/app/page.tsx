import Link from "next/link";
import { getDashboardData } from "@/db/queries";
import { getAccountsList, getCategories } from "@/db/mutations";
import { Nav } from "@/components/ui/Nav";
import { StatTile } from "@/components/ui/StatTile";
import { Hero } from "@/components/dashboard/Hero";
import { ThisMonth } from "@/components/dashboard/ThisMonth";
import { NetWorthChart } from "@/components/dashboard/NetWorthChart";
import { SpendBreakdown } from "@/components/dashboard/SpendBreakdown";
import { CoachingCard } from "@/components/dashboard/CoachingCard";
import { AddTransaction } from "@/components/transactions/AddTransaction";
import { eur } from "@/lib/format";

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

  const [accounts, categories] = await Promise.all([getAccountsList(), getCategories()]);
  const runway = Number.isFinite(data.monthsRunway) ? data.monthsRunway.toFixed(1) : "∞";

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-2">
      <Nav active="dashboard" />

      {/* Grid of neumorphic tiles — wide gaps so the soft shadows don't overlap. */}
      <div className="mt-4 grid grid-cols-2 gap-5">
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
      </div>

      <AddTransaction
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, type: a.type }))}
        categories={categories.map((c) => ({ name: c.name, kind: c.kind }))}
      />
    </main>
  );
}
