"use client";

import { useState, useTransition } from "react";
import { addTransactionAction, type CelebrationPayload } from "@/app/actions/transactions";
import { Celebration } from "@/components/celebrate/Celebration";
import { TX_TYPE_LABELS, ACCOUNT_TYPE_LABELS, type TxType } from "@/lib/labels";
import type { AccountType } from "@/lib/fire";

interface AccountOption {
  id: string;
  name: string;
  type: AccountType;
}
interface CategoryOption {
  name: string;
  kind: "income" | "expense";
}

const TX_TYPES: TxType[] = ["expense", "income", "contribution", "withdrawal"];

/**
 * Floating action button + modal to log a transaction. The most common action,
 * kept max two taps away at all times (PRD §8).
 */
export function AddTransaction({
  accounts,
  categories,
}: {
  accounts: AccountOption[];
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TxType>("expense");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<CelebrationPayload | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const showCategory = type === "income" || type === "expense";
  const relevantCategories = categories.filter((c) =>
    type === "income" ? c.kind === "income" : c.kind === "expense",
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await addTransactionAction(formData);
        setOpen(false);
        setType("expense");
        // Celebrate only positive movement (new badge, a sooner FIRE date, or
        // newly getting on track toward FIRE).
        const worthCelebrating =
          result.newMilestones.length > 0 ||
          (result.fireDateDaysEarlier ?? 0) > 0 ||
          result.becameOnTrack;
        if (worthCelebrating) setCelebration(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo ha ido mal.");
      }
    });
  }

  return (
    <>
      {celebration && (
        <Celebration payload={celebration} onClose={() => setCelebration(null)} />
      )}
      <button
        onClick={() => setOpen(true)}
        aria-label="Añadir movimiento"
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-3xl text-white shadow-neu transition active:shadow-neu-inset"
      >
        +
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-surface p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Nuevo movimiento</h2>
              <button onClick={() => setOpen(false)} className="text-ink/40" aria-label="Cerrar">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="type" value={type} />

              <div className="grid grid-cols-4 gap-2">
                {TX_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`rounded-xl px-2 py-2 text-xs font-medium ${
                      type === t ? "bg-teal text-white" : "bg-surface text-ink/60"
                    }`}
                  >
                    {TX_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="text-sm text-ink/60">Importe (€)</span>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  autoFocus
                  className="mt-1 w-full rounded-xl shadow-neu-inset px-3 py-2 text-lg"
                />
              </label>

              <label className="block">
                <span className="text-sm text-ink/60">Cuenta</span>
                <select
                  name="accountId"
                  required
                  className="mt-1 w-full rounded-xl shadow-neu-inset bg-surface px-3 py-2"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({ACCOUNT_TYPE_LABELS[a.type]})
                    </option>
                  ))}
                </select>
              </label>

              {showCategory && (
                <label className="block">
                  <span className="text-sm text-ink/60">Categoría</span>
                  <select
                    name="category"
                    className="mt-1 w-full rounded-xl shadow-neu-inset bg-surface px-3 py-2"
                  >
                    <option value="">Sin categoría</option>
                    {relevantCategories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="text-sm text-ink/60">Fecha</span>
                <input
                  name="date"
                  type="date"
                  defaultValue={today}
                  className="mt-1 w-full rounded-xl shadow-neu-inset px-3 py-2"
                />
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={pending || accounts.length === 0}
                className="w-full rounded-xl bg-teal py-3 font-semibold text-white disabled:opacity-50"
              >
                {pending ? "Guardando…" : "Guardar movimiento"}
              </button>
              {accounts.length === 0 && (
                <p className="text-center text-xs text-amber-600">
                  Primero crea una cuenta en la sección Cuentas.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
