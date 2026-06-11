import Link from "next/link";
import { getDashboardData } from "@/db/queries";
import { getAccountsList, getCategories } from "@/db/mutations";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/dashboard/Hero";
import { ThisMonth } from "@/components/dashboard/ThisMonth";
import { NetWorthChart } from "@/components/dashboard/NetWorthChart";
import { SecondaryStats } from "@/components/dashboard/SecondaryStats";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { SpendBreakdown } from "@/components/dashboard/SpendBreakdown";
import { CoachingCard } from "@/components/dashboard/CoachingCard";
import { AddTransaction } from "@/components/transactions/AddTransaction";

// DB-backed reads must run per-request, not be statically cached at build.
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="text-2xl font-bold">Bienvenido a FIRE Tracker</h1>
        <p className="mt-2 text-gray-600">Aún no has configurado tu perfil.</p>
        <Link
          href="/onboarding"
          className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
        >
          Empezar
        </Link>
      </main>
    );
  }

  const [accounts, categories] = await Promise.all([getAccountsList(), getCategories()]);

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-2">
      <Nav active="dashboard" />
      <div className="mt-3 space-y-4">
        <Hero data={data} />
        <ThisMonth data={data} />
        <NetWorthChart series={data.netWorthSeries} />
        <StreakBadge data={data} />
        <SecondaryStats data={data} />
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
