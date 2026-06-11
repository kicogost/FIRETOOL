"use client";

import { useState, useTransition } from "react";
import { createAccountAction } from "@/app/actions/accounts";
import { ACCOUNT_TYPE_LABELS } from "@/lib/labels";
import type { AccountType } from "@/lib/fire";

const TYPES: AccountType[] = ["cash", "brokerage", "pension", "crypto", "property", "debt"];
// Types that count toward the FIRE number by default.
const INVESTED_BY_DEFAULT = new Set<AccountType>(["brokerage", "pension", "crypto"]);

export function AddAccountForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<AccountType>("brokerage");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createAccountAction(formData);
        setOpen(false);
        setType("brokerage");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo ha ido mal.");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-500"
      >
        + Añadir cuenta
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 p-5">
      <label className="block">
        <span className="text-sm text-gray-600">Nombre</span>
        <input
          name="name"
          required
          autoFocus
          placeholder="p. ej. Broker indexado"
          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-600">Tipo</span>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {ACCOUNT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-gray-600">Saldo actual (€)</span>
        <input
          name="initialBalance"
          type="number"
          step="0.01"
          min="0"
          required
          className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          name="isInvested"
          type="checkbox"
          defaultChecked={INVESTED_BY_DEFAULT.has(type)}
          // key forces the checkbox to pick up the new default when type changes
          key={type}
          className="h-4 w-4"
        />
        <span className="text-sm text-gray-600">Cuenta de inversión (cuenta para FIRE)</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl bg-gray-100 px-4 py-2.5 font-semibold text-gray-600"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
