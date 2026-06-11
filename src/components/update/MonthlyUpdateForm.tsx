"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyMonthlyUpdateAction } from "@/app/actions/update";
import { ACCOUNT_TYPE_LABELS } from "@/lib/labels";
import type { AccountType } from "@/lib/fire";

interface AccountInput {
  id: string;
  name: string;
  type: AccountType;
  isInvested: boolean;
  balance: number;
}

export function MonthlyUpdateForm({ accounts }: { accounts: AccountInput[] }) {
  const router = useRouter();
  const [balances, setBalances] = useState<Record<string, string>>(
    Object.fromEntries(accounts.map((a) => [a.id, String(a.balance)])),
  );
  const invested = accounts.filter((a) => a.isInvested);
  const [contribAccount, setContribAccount] = useState(invested[0]?.id ?? "");
  const [contrib, setContrib] = useState("");
  const [pending, startTransition] = useTransition();

  const num = (s: string) => Math.max(0, Number(s) || 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await applyMonthlyUpdateAction({
        balances: accounts.map((a) => ({ accountId: a.id, balance: num(balances[a.id] ?? "0") })),
        contribution:
          contribAccount && num(contrib) > 0
            ? { accountId: contribAccount, amount: num(contrib) }
            : null,
      });
      router.push("/");
    });
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-ink/55">
        Aún no tienes cuentas. Créalas en la sección Cuentas para poder actualizarlas.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-2xl bg-surface p-5 shadow-neu">
        <p className="text-sm font-bold">Saldo actual de cada cuenta</p>
        <p className="mt-1 text-xs text-ink/55">
          Pon el valor de hoy (incluye lo que ha subido el mercado, no solo lo que aportaste).
        </p>
        <div className="mt-4 space-y-3">
          {accounts.map((a) => (
            <label key={a.id} className="flex items-center justify-between gap-3">
              <span className="text-sm">
                {a.name}
                <span className="block text-xs text-ink/45">
                  {ACCOUNT_TYPE_LABELS[a.type]}
                  {a.type === "debt" && " · deuda"}
                </span>
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={balances[a.id] ?? ""}
                  onChange={(e) => setBalances((p) => ({ ...p, [a.id]: e.target.value }))}
                  className="w-32 rounded-xl bg-surface px-3 py-2 text-right shadow-neu-inset outline-none"
                />
                <span className="text-ink/40">€</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {invested.length > 0 && (
        <div className="rounded-2xl bg-surface p-5 shadow-neu">
          <p className="text-sm font-bold">¿Cuánto has aportado este mes? (opcional)</p>
          <p className="mt-1 text-xs text-ink/55">
            Para tu racha y la proyección. No cambia el saldo (ya lo has puesto arriba).
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={contrib}
              onChange={(e) => setContrib(e.target.value)}
              placeholder="300"
              className="w-28 rounded-xl bg-surface px-3 py-2 shadow-neu-inset outline-none"
            />
            <span className="text-ink/40">€ a</span>
            <select
              value={contribAccount}
              onChange={(e) => setContribAccount(e.target.value)}
              className="flex-1 rounded-xl bg-surface px-3 py-2 shadow-neu-inset outline-none"
            >
              {invested.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button type="submit" disabled={pending} className="neu-btn-primary w-full">
        {pending ? "Guardando…" : "Guardar actualización del mes"}
      </button>
      <p className="text-center text-xs text-ink/45">
        Tus gastos del mes se registran aparte, en la sección Gastos.
      </p>
    </form>
  );
}
