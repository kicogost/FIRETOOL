import Link from "next/link";
import { getSpendingAnalysis, getProfile } from "@/db/queries";
import { getAccountsList, getCategories } from "@/db/mutations";
import { Nav } from "@/components/ui/Nav";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { SpendingInsights } from "@/components/gastos/SpendingInsights";
import { CategoryBreakdown } from "@/components/gastos/CategoryBreakdown";
import { AddTransaction } from "@/components/transactions/AddTransaction";
import { eur, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GastosPage() {
  const profile = await getProfile();
  if (!profile) {
    return (
      <main className="mx-auto max-w-md px-5 pb-24 pt-2">
        <Nav />
        <p className="mt-10 text-center text-ink/50">Configura tu perfil para ver tus gastos.</p>
        <BottomNav />
      </main>
    );
  }

  const [analysis, accounts, categories] = await Promise.all([
    getSpendingAnalysis(),
    getAccountsList(),
    getCategories(),
  ]);

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-2">
      <Nav />
      <div className="flex items-end justify-between px-1">
        <div>
          <h1 className="mt-2 text-xl font-bold">Tus gastos</h1>
          <p className="text-sm text-ink/50">En qué se va tu dinero, y dónde puedes recortar.</p>
        </div>
        <Link href="/historial" className="pb-1 text-xs font-bold text-teal">
          Historial →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card className="col-span-1">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Gasto este mes</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{eur(analysis.totalExpenses)}</p>
        </Card>
        <Card className="col-span-1">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Tasa de ahorro</p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${
              analysis.savingsRate < 0 ? "text-danger" : "text-success"
            }`}
          >
            {pct(analysis.savingsRate)}
          </p>
        </Card>

        <SpendingInsights insights={analysis.insights} />
        <CategoryBreakdown items={analysis.byCategory} />
      </div>

      <AddTransaction
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, type: a.type }))}
        categories={categories.map((c) => ({ name: c.name, kind: c.kind }))}
      />
      <BottomNav />
    </main>
  );
}
