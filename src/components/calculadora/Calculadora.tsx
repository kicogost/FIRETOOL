"use client";

import { useState } from "react";
import Link from "next/link";
import {
  fireNumber,
  progressPct,
  projectedFireDate,
  DEFAULT_EXPECTED_RETURN,
  DEFAULT_SWR,
} from "@/lib/fire";
import { eur, pct, formatDate, fireDatePhrase } from "@/lib/format";

const num = (s: string) => (s.trim() === "" ? 0 : Math.max(0, Number(s) || 0));

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix = "€",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-ink/60">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="neu-input text-lg"
        />
        <span className="text-ink/40">{suffix}</span>
      </div>
    </label>
  );
}

export function Calculadora() {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [invested, setInvested] = useState("");

  const ingreso = num(income);
  const gasto = num(expenses);
  const invertido = num(invested);
  const surplus = Math.max(0, ingreso - gasto);

  const annualSpend = gasto * 12;
  const fireNum = fireNumber(annualSpend, DEFAULT_SWR);
  const progreso = progressPct(invertido, fireNum);
  const projection = projectedFireDate({
    investedAssets: invertido,
    monthlyContribution: surplus,
    fireNumber: fireNum,
    expectedAnnualReturn: DEFAULT_EXPECTED_RETURN,
    from: new Date(),
  });

  // Teaser of the core mechanic: what 100 €/month extra does.
  const more = projectedFireDate({
    investedAssets: invertido,
    monthlyContribution: surplus + 100,
    fireNumber: fireNum,
    expectedAnnualReturn: DEFAULT_EXPECTED_RETURN,
    from: new Date(),
  });
  const daysEarlier =
    projection.date && more.date
      ? Math.round((projection.date.getTime() - more.date.getTime()) / 86_400_000)
      : null;

  const hasInput = gasto > 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-surface p-5 shadow-neu">
        <div className="space-y-4">
          <Field label="Ingreso mensual neto" value={income} onChange={setIncome} placeholder="2.500" suffix="€/mes" />
          <Field label="Gasto mensual" value={expenses} onChange={setExpenses} placeholder="1.800" suffix="€/mes" />
          <Field label="Lo que ya tienes invertido" value={invested} onChange={setInvested} placeholder="20.000" />
        </div>
      </div>

      {hasInput && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-surface p-6 shadow-neu">
            <p className="text-xs font-bold uppercase tracking-wide text-teal">Tu número FIRE</p>
            <p className="mt-1 text-4xl font-bold tabular-nums">{eur(fireNum)}</p>
            <p className="mt-1 text-sm text-ink/50">
              {gasto > 0 ? `25 × tu gasto anual (${eur(annualSpend)})` : ""}
            </p>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface shadow-neu-inset">
              <div
                className="h-full rounded-full bg-teal transition-[width] duration-500"
                style={{ width: `${Math.min(100, progreso * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink/50">
              {eur(invertido)} invertidos · {pct(progreso)} de tu meta
            </p>
          </div>

          <div className="rounded-2xl bg-surface p-6 shadow-neu-inset">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
              Fecha FIRE proyectada
            </p>
            {projection.onTrack && projection.date ? (
              <>
                <p className="mt-1 text-2xl font-bold">{formatDate(projection.date)}</p>
                <p className="text-sm text-ink/55">
                  Invirtiendo tu ahorro ({eur(surplus)}/mes), serás libre {fireDatePhrase(projection)}.
                </p>
              </>
            ) : (
              <p className="mt-1 text-lg font-semibold">
                Con estos números aún no vas por buen camino — el primer paso es invertir tu ahorro
                cada mes.
              </p>
            )}
            {daysEarlier && daysEarlier > 0 && (
              <p className="mt-3 rounded-xl bg-surface p-3 text-sm text-ink/70 shadow-neu-sm">
                💡 Solo <strong>100 €/mes más</strong> adelantan tu libertad{" "}
                <strong className="text-teal">{daysEarlier} días</strong>.
              </p>
            )}
          </div>

          <Link href="/login" className="neu-btn-primary block text-center">
            Guarda tu progreso · Crea tu cuenta gratis
          </Link>
          <p className="text-center text-xs text-ink/40">
            Sin conectar tu banco · Sin comisiones · Tus datos son tuyos
          </p>
        </div>
      )}
    </div>
  );
}
