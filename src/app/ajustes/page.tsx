import Link from "next/link";
import { getProfile } from "@/db/queries";
import { Nav } from "@/components/ui/Nav";
import { BottomNav } from "@/components/ui/BottomNav";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const profile = await getProfile();
  if (!profile) {
    return (
      <main className="mx-auto max-w-md px-5 pb-24 pt-2">
        <Nav />
        <p className="mt-10 text-center text-ink/50">
          Configura tu perfil primero.{" "}
          <Link href="/onboarding" className="font-bold text-teal">
            Empezar
          </Link>
        </p>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-2">
      <Nav />
      <h1 className="mt-3 text-xl font-bold">Ajustes</h1>
      <p className="text-sm text-ink/50">Afina tus supuestos FIRE. Todo recalcula al instante.</p>

      <div className="mt-5">
        <SettingsForm
          initial={{
            name: profile.name,
            age: profile.age,
            retirementMonthlySpend: Number(profile.retirementMonthlySpend ?? 0),
            swrPct: Math.round(Number(profile.swr) * 1000) / 10,
            returnPct: Math.round(Number(profile.expectedReturn) * 1000) / 10,
            rewardStyle: profile.rewardStyle as "quiet" | "loud",
          }}
        />
      </div>
      <BottomNav />
    </main>
  );
}
