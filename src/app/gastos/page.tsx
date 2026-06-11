import { getDashboardData } from "@/db/queries";
import { getAccountsList, getCategories } from "@/db/mutations";
import { Nav } from "@/components/ui/Nav";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { SpendBreakdown } from "@/components/dashboard/SpendBreakdown";
import { AddTransaction } from "@/components/transactions/AddTransaction";
import { eur, pct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function GastosPage() {
  const data = await getDashboardData();
  if (!data) {
    return (
      <main className="mx-auto max-w-md px-5 pb-24 pt-2">
        <Nav />
        <p className="mt-10 text-center text-ink/50">Configura tu perfil para ver tus gastos.</p>
        <BottomNav />
      </main>
    );
  }

  const [accounts, categories] = await Promise.all([getAccountsList(), getCategories()]);

  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-2">
      <Nav />
      <h1 className="mt-2 px-1 text-xl font-bold">Tus gastos</h1>
      <p className="px-1 text-sm text-ink/50">Analiza en qué se va tu dinero y dónde recortar.</p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card className="col-span-1">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Gasto este mes</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{eur(data.thisMonth.expenses)}</p>
        </Card>
        <Card className="col-span-1">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/45">Tasa de ahorro</p>
          <p
            className={`mt-1 text-2xl font-bold tabular-nums ${
              data.thisMonth.savingsRate < 0 ? "text-danger" : "text-success"
            }`}
          >
            {pct(data.thisMonth.savingsRate)}
          </p>
        </Card>

        <SpendBreakdown data={data} />

        <Card className="col-span-2" variant="inset">
          <p className="text-sm text-ink/55">
            Pronto: detección de suscripciones, alertas de comisiones y avisos cuando una categoría
            se dispara — con consejos para recortar sin agobios.
          </p>
        </Card>
      </div>

      <AddTransaction
        accounts={accounts.map((a) => ({ id: a.id, name: a.name, type: a.type }))}
        categories={categories.map((c) => ({ name: c.name, kind: c.kind }))}
      />
      <BottomNav />
    </main>
  );
}
