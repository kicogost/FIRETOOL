"use client";

import { useState, useTransition } from "react";
import { updateSettingsAction } from "@/app/actions/settings";

interface Initial {
  name: string;
  age: number;
  retirementMonthlySpend: number;
  swrPct: number; // e.g. 4 or 3.5
  returnPct: number;
  rewardStyle: "quiet" | "loud";
}

const SWR_PRESETS = [
  { pct: 3.5, label: "3,5% · España", hint: "Más conservador: deja colchón para IRPF y menor rentabilidad real." },
  { pct: 4, label: "4% · Clásico", hint: "La regla del 4% original (estudios de EE. UU.)." },
];

export function SettingsForm({ initial }: { initial: Initial }) {
  const [swrPct, setSwrPct] = useState(initial.swrPct);
  const [spend, setSpend] = useState(initial.retirementMonthlySpend);
  const [rewardStyle, setRewardStyle] = useState(initial.rewardStyle);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    fd.set("swrPct", String(swrPct));
    fd.set("rewardStyle", rewardStyle);
    startTransition(async () => {
      await updateSettingsAction(fd);
      setSaved(true);
    });
  }

  const fireNumberPreview = (spend: number) => Math.round((spend * 12) / (swrPct / 100));

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-2xl bg-surface p-5 shadow-neu">
        <label className="block">
          <span className="text-sm text-ink/60">Tu nombre</span>
          <input name="name" defaultValue={initial.name} className="neu-input mt-1" />
        </label>
        <label className="mt-4 block">
          <span className="text-sm text-ink/60">Edad</span>
          <input name="age" type="number" min="16" max="99" defaultValue={initial.age} className="neu-input mt-1" />
        </label>
        <label className="mt-4 block">
          <span className="text-sm text-ink/60">Gasto mensual objetivo en la jubilación (€)</span>
          <input
            name="retirementMonthlySpend"
            type="number"
            min="0"
            step="50"
            value={spend || ""}
            onChange={(e) => setSpend(Math.max(0, Number(e.target.value) || 0))}
            className="neu-input mt-1"
          />
        </label>
      </div>

      <div className="rounded-2xl bg-surface p-5 shadow-neu">
        <p className="text-sm font-bold">Tasa de retirada segura (SWR)</p>
        <p className="mt-1 text-xs text-ink/50">
          El porcentaje que retiras al año en la jubilación. Tu número FIRE = gasto anual ÷ SWR.
        </p>
        <div className="mt-3 space-y-2">
          {SWR_PRESETS.map((p) => (
            <button
              type="button"
              key={p.pct}
              onClick={() => setSwrPct(p.pct)}
              className={`block w-full rounded-xl px-4 py-3 text-left transition ${
                swrPct === p.pct ? "bg-surface text-teal shadow-neu-inset" : "bg-surface shadow-neu-sm"
              }`}
            >
              <span className="font-bold">{p.label}</span>
              <span className="block text-xs text-ink/55">{p.hint}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-surface p-3 text-xs text-ink/60 shadow-neu-inset">
          💡 En España, las retiradas tributan en el IRPF (19%–30% sobre las ganancias). Por eso
          mucha gente usa un 3,5% en lugar del 4%, para dejar margen a los impuestos.
        </p>
      </div>

      <label className="block rounded-2xl bg-surface p-5 shadow-neu">
        <span className="text-sm text-ink/60">Rentabilidad real anual esperada (%)</span>
        <input
          name="returnPct"
          type="number"
          min="0"
          max="12"
          step="0.5"
          defaultValue={initial.returnPct}
          className="neu-input mt-1"
        />
        <span className="mt-1 block text-xs text-ink/45">
          Por defecto 5% (rentabilidad histórica de la bolsa, ya descontada la inflación).
        </span>
      </label>

      <div className="rounded-2xl bg-surface p-5 shadow-neu">
        <p className="text-sm text-ink/60">¿Cómo prefieres celebrar tus avances?</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["quiet", "loud"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRewardStyle(r)}
              className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                rewardStyle === r ? "bg-surface text-teal shadow-neu-inset" : "bg-surface shadow-neu-sm text-ink/60"
              }`}
            >
              {r === "quiet" ? "Tranquilo" : "¡Celebrarlo todo!"}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={pending} className="neu-btn-primary w-full">
        {pending ? "Guardando…" : saved ? "✓ Guardado" : "Guardar cambios"}
      </button>
      <p className="text-center text-xs text-ink/55">
        Con un SWR del {String(swrPct).replace(".", ",")}%, tu número FIRE sería{" "}
        {fireNumberPreview(spend).toLocaleString("es-ES")} € para un gasto de{" "}
        {spend.toLocaleString("es-ES")} €/mes.
      </p>
    </form>
  );
}
