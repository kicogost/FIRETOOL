import { getUpdateData, getProfile } from "@/db/queries";
import { Nav } from "@/components/ui/Nav";
import { BottomNav } from "@/components/ui/BottomNav";
import { MonthlyUpdateForm } from "@/components/update/MonthlyUpdateForm";

export const dynamic = "force-dynamic";

export default async function ActualizarPage() {
  const profile = await getProfile();
  if (!profile) {
    return (
      <main className="mx-auto max-w-md px-5 pb-24 pt-2">
        <Nav />
        <p className="mt-10 text-center text-ink/50">Configura tu perfil primero.</p>
        <BottomNav />
      </main>
    );
  }

  const { accounts } = await getUpdateData();

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-2">
      <Nav />
      <h1 className="mt-3 text-xl font-bold">Actualizar el mes</h1>
      <p className="text-sm text-ink/55">
        Pon al día tus saldos en 30 segundos. Hazlo una vez al mes y tu progreso FIRE se mantiene
        exacto.
      </p>

      <div className="mt-5">
        <MonthlyUpdateForm
          accounts={accounts.map((a) => ({
            id: a.id,
            name: a.name,
            type: a.type,
            isInvested: a.isInvested,
            balance: a.balance,
          }))}
        />
      </div>
      <BottomNav />
    </main>
  );
}
