import { getMonthlyHistory, getProfile } from "@/db/queries";
import { Nav } from "@/components/ui/Nav";
import { BottomNav } from "@/components/ui/BottomNav";
import { HistoryChart } from "@/components/history/HistoryChart";
import { eur, pct, formatMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

const monthLong = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

export default async function HistorialPage() {
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

  const history = await getMonthlyHistory();

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-2">
      <Nav />
      <h1 className="mt-3 text-xl font-bold">Tu historial</h1>
      <p className="text-sm capitalize text-ink/55">
        {monthLong.format(now)} · quedan {daysLeft} días del mes
      </p>

      {history.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink/50">
          Aún no hay historial. Registra movimientos y actualiza tus saldos cada mes para empezar a
          verlo aquí.
        </p>
      ) : (
        <>
          <div className="mt-5">
            <HistoryChart summaries={history} />
          </div>

          <h2 className="mt-7 px-1 text-sm font-bold uppercase tracking-wide text-ink/45">
            Mes a mes
          </h2>
          <div className="mt-3 space-y-3">
            {history.slice(0, 12).map((m) => {
              const maxCat = Math.max(1, ...m.byCategory.map((c) => c.amount));
              return (
                <details key={m.month} className="rounded-2xl bg-surface p-4 shadow-neu-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <span className="font-bold capitalize">{formatMonth(m.month)}</span>
                    <span className="text-right text-sm">
                      <span className="font-bold tabular-nums">
                        {m.netWorth !== null ? eur(m.netWorth) : "—"}
                      </span>
                      <span className="block text-xs text-ink/50">
                        Ahorro {pct(m.savingsRate)}
                      </span>
                    </span>
                  </summary>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Mini label="Ingresos" value={eur(m.income)} />
                    <Mini label="Gastos" value={eur(m.expenses)} />
                    <Mini label="Invertido" value={eur(m.contributions)} highlight />
                  </div>

                  {m.byCategory.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {m.byCategory.slice(0, 6).map((c) => (
                        <li key={c.category}>
                          <div className="flex justify-between text-xs">
                            <span>{c.category}</span>
                            <span className="font-bold tabular-nums">{eur(c.amount)}</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface shadow-neu-inset">
                            <div
                              className="h-full rounded-full bg-teal"
                              style={{ width: `${(c.amount / maxCat) * 100}%` }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              );
            })}
          </div>
        </>
      )}
      <BottomNav />
    </main>
  );
}

function Mini({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-surface p-2.5 shadow-neu-inset">
      <p className="text-[10px] uppercase text-ink/45">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${highlight ? "text-teal" : "text-ink"}`}>{value}</p>
    </div>
  );
}
