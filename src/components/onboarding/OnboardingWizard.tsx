"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, type OnboardingData } from "@/app/actions/onboarding";

type Risk = "low" | "medium" | "high";

interface Draft {
  name: string;
  age: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  cash: string;
  investments: string;
  pension: string;
  crypto: string;
  property: string;
  debt: string;
  investsRegularly: "yes" | "sometimes" | "no" | "";
  fireVariant: "full" | "barista" | "coast" | "";
  retirementMonthlySpend: string;
  riskComfort: Risk | "";
  rewardStyle: "quiet" | "loud" | "";
}

const EMPTY: Draft = {
  name: "",
  age: "",
  monthlyIncome: "",
  monthlyExpenses: "",
  cash: "",
  investments: "",
  pension: "",
  crypto: "",
  property: "",
  debt: "",
  investsRegularly: "",
  fireVariant: "",
  retirementMonthlySpend: "",
  riskComfort: "",
  rewardStyle: "",
};

const TOTAL_STEPS = 10;

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(EMPTY);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const num = (s: string) => (s.trim() === "" ? 0 : Number(s));

  function submit() {
    setError(null);
    const payload: OnboardingData = {
      name: d.name.trim() || "Yo",
      age: num(d.age),
      monthlyIncome: num(d.monthlyIncome),
      monthlyExpenses: num(d.monthlyExpenses),
      netWorth: {
        cash: num(d.cash),
        investments: num(d.investments),
        pension: num(d.pension),
        crypto: num(d.crypto),
        property: num(d.property),
        debt: num(d.debt),
      },
      investsRegularly: (d.investsRegularly || "no") as OnboardingData["investsRegularly"],
      fireVariant: (d.fireVariant || "full") as OnboardingData["fireVariant"],
      retirementMonthlySpend: num(d.retirementMonthlySpend) || num(d.monthlyExpenses),
      rewardStyle: (d.rewardStyle || "loud") as OnboardingData["rewardStyle"],
    };
    startTransition(async () => {
      try {
        await completeOnboarding(payload);
        router.push("/onboarding/summary");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo ha ido mal.");
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
      {/* Progress */}
      <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-300"
          style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col">
        {step === 0 && (
          <Question title="¿Cómo te llamas?">
            <TextInput value={d.name} onChange={(v) => set({ name: v })} placeholder="Tu nombre" autoFocus />
            <Continue onClick={next} />
          </Question>
        )}

        {step === 1 && (
          <Question title="¿Cuántos años tienes?">
            <NumberInput value={d.age} onChange={(v) => set({ age: v })} placeholder="32" autoFocus />
            <Continue onClick={next} disabled={num(d.age) <= 0} onBack={back} />
          </Question>
        )}

        {step === 2 && (
          <Question title="¿Cuál es tu ingreso mensual neto?" hint="Si varía, pon una media aproximada.">
            <NumberInput value={d.monthlyIncome} onChange={(v) => set({ monthlyIncome: v })} placeholder="2.500" suffix="€/mes" autoFocus />
            <Continue onClick={next} disabled={num(d.monthlyIncome) <= 0} onBack={back} />
          </Question>
        )}

        {step === 3 && (
          <Question title="¿Cuánto gastas al mes, más o menos?" hint="Una estimación basta; se irá afinando con tus datos reales.">
            <NumberInput value={d.monthlyExpenses} onChange={(v) => set({ monthlyExpenses: v })} placeholder="1.800" suffix="€/mes" autoFocus />
            <Continue onClick={next} disabled={num(d.monthlyExpenses) <= 0} onBack={back} />
          </Question>
        )}

        {step === 4 && (
          <Question title="¿Cuál es tu patrimonio actual?" hint="Rellena lo que tengas en cada sitio. Lo dejaremos en blanco si es cero.">
            <div className="space-y-3">
              <MoneyRow label="Efectivo y cuentas" value={d.cash} onChange={(v) => set({ cash: v })} />
              <MoneyRow label="Inversiones (broker, fondos)" value={d.investments} onChange={(v) => set({ investments: v })} />
              <MoneyRow label="Plan de pensiones" value={d.pension} onChange={(v) => set({ pension: v })} />
              <MoneyRow label="Cripto" value={d.crypto} onChange={(v) => set({ crypto: v })} />
              <MoneyRow label="Inmuebles (valor neto)" value={d.property} onChange={(v) => set({ property: v })} />
              <MoneyRow label="Deudas (préstamos, hipoteca)" value={d.debt} onChange={(v) => set({ debt: v })} />
            </div>
            <Continue onClick={next} onBack={back} />
          </Question>
        )}

        {step === 5 && (
          <Question title="¿Inviertes con regularidad?">
            <Choices
              value={d.investsRegularly}
              onPick={(v) => {
                set({ investsRegularly: v as Draft["investsRegularly"] });
                next();
              }}
              options={[
                { value: "yes", label: "Sí, cada mes" },
                { value: "sometimes", label: "A veces" },
                { value: "no", label: "Todavía no" },
              ]}
            />
            <BackOnly onBack={back} />
          </Question>
        )}

        {step === 6 && (
          <Question title="¿Qué significa para ti la independencia financiera?">
            <Choices
              value={d.fireVariant}
              onPick={(v) => {
                set({ fireVariant: v as Draft["fireVariant"] });
                next();
              }}
              options={[
                { value: "full", label: "Jubilarme del todo", hint: "Dejar de trabajar por completo" },
                { value: "barista", label: "Que trabajar sea opcional", hint: "Trabajar solo si quiero" },
                { value: "coast", label: "Pasar a media jornada", hint: "Reducir el ritmo poco a poco" },
              ]}
            />
            <BackOnly onBack={back} />
          </Question>
        )}

        {step === 7 && (
          <Question title="¿Cuánto quieres gastar al mes cuando seas libre?" hint="Por defecto, lo que gastas ahora. Puedes ajustarlo.">
            <NumberInput
              value={d.retirementMonthlySpend || d.monthlyExpenses}
              onChange={(v) => set({ retirementMonthlySpend: v })}
              placeholder={d.monthlyExpenses || "1.800"}
              suffix="€/mes"
              autoFocus
            />
            <Continue onClick={next} onBack={back} />
          </Question>
        )}

        {step === 8 && (
          <Question
            title="Si tus inversiones cayeran un 30% en un año, ¿cómo te sentirías?"
            hint="No es asesoramiento; nos ayuda a adaptar el tono de los consejos."
          >
            <Choices
              value={d.riskComfort}
              onPick={(v) => {
                set({ riskComfort: v as Risk });
                next();
              }}
              options={[
                { value: "low", label: "Muy nervioso/a, querría vender" },
                { value: "medium", label: "Incómodo/a, pero aguantaría" },
                { value: "high", label: "Tranquilo/a, compraría más" },
              ]}
            />
            <BackOnly onBack={back} />
          </Question>
        )}

        {step === 9 && (
          <Question title="¿Cómo prefieres celebrar tus avances?">
            <Choices
              value={d.rewardStyle}
              onPick={(v) => set({ rewardStyle: v as Draft["rewardStyle"] })}
              options={[
                { value: "quiet", label: "Progreso tranquilo", hint: "Avisos discretos" },
                { value: "loud", label: "¡Celebrarlo todo!", hint: "Confeti y fanfarria" },
              ]}
            />
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <button
              onClick={submit}
              disabled={pending || !d.rewardStyle}
              className="mt-6 w-full rounded-xl bg-teal py-3 font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Calculando tu punto de partida…" : "Ver mi punto de partida"}
            </button>
            <BackOnly onBack={back} />
          </Question>
        )}
      </div>
    </main>
  );
}

// --- Small presentational helpers ------------------------------------------

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-bold leading-snug">{title}</h1>
      {hint && <p className="mt-2 text-sm text-ink/50">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full rounded-xl shadow-neu-inset px-4 py-3 text-lg"
    />
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-xl shadow-neu-inset px-4 py-3 text-lg"
      />
      {suffix && <span className="text-ink/40">{suffix}</span>}
    </div>
  );
}

function MoneyRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink/70">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-28 rounded-xl shadow-neu-inset px-3 py-2 text-right"
        />
        <span className="text-ink/40">€</span>
      </div>
    </label>
  );
}

function Choices({
  value,
  onPick,
  options,
}: {
  value: string;
  onPick: (v: string) => void;
  options: { value: string; label: string; hint?: string }[];
}) {
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onPick(o.value)}
          className={`w-full rounded-xl bg-surface px-4 py-3 text-left shadow-neu-sm ${
            value === o.value ? "bg-surface shadow-neu-inset text-teal" : "shadow-neu"
          }`}
        >
          <span className="font-semibold">{o.label}</span>
          {o.hint && <span className="block text-sm text-ink/50">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function Continue({ onClick, disabled, onBack }: { onClick: () => void; disabled?: boolean; onBack?: () => void }) {
  return (
    <div className="mt-6 flex gap-2">
      {onBack && (
        <button onClick={onBack} className="rounded-xl bg-surface px-4 py-3 font-semibold text-ink/60">
          Atrás
        </button>
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex-1 rounded-xl bg-teal py-3 font-semibold text-white disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  );
}

function BackOnly({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} className="mt-4 w-full py-2 text-sm font-medium text-ink/40">
      Atrás
    </button>
  );
}
