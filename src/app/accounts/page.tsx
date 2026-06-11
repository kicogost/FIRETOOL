import Link from "next/link";
import { getAccountsWithBalance } from "@/db/queries";
import { deleteAccountAction } from "@/app/actions/accounts";
import { Nav } from "@/components/ui/Nav";
import { Card } from "@/components/ui/Card";
import { AddAccountForm } from "@/components/accounts/AddAccountForm";
import { ACCOUNT_TYPE_LABELS } from "@/lib/labels";
import { eur } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccountsWithBalance();

  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-2">
      <Nav active="accounts" />

      <h1 className="mt-3 text-xl font-bold">Tus cuentas</h1>
      <p className="text-sm text-gray-500">
        Las cuentas de inversión cuentan para tu número FIRE; las deudas restan.
      </p>

      <div className="mt-4 space-y-3">
        {accounts.map((a) => (
          <Card key={a.id} className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{a.name}</p>
                <p className="text-xs text-gray-500">
                  {ACCOUNT_TYPE_LABELS[a.type]}
                  {a.isInvested && " · inversión"}
                  {a.type === "debt" && " · deuda"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold tabular-nums ${a.type === "debt" ? "text-red-600" : ""}`}
                >
                  {a.type === "debt" ? `−${eur(a.balance)}` : eur(a.balance)}
                </span>
                <form action={deleteAccountAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    aria-label={`Eliminar ${a.name}`}
                    className="text-gray-300 hover:text-red-500"
                  >
                    ✕
                  </button>
                </form>
              </div>
            </div>
          </Card>
        ))}

        {accounts.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            Aún no tienes cuentas. Añade la primera para empezar.
          </p>
        )}

        <AddAccountForm />
      </div>

      <Link
        href="/import"
        className="mt-6 block text-center text-sm font-medium text-emerald-700"
      >
        Importar movimientos desde CSV →
      </Link>
    </main>
  );
}
