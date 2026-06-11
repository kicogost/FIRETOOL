import {
  fireNumber,
  savingsRate,
  progressPct,
  netWorth,
  investedNetWorth,
  monthsOfRunway,
  coastFireNumber,
  projectedFireDate,
  type AccountType,
} from "@/lib/fire";

/**
 * Debug page (PRD Phase 1): runs every FIRE engine function over in-memory seed
 * data and prints the numbers. No database, no real UI. The two scenarios prove
 * the core mechanic — investing more pulls the projected FIRE date earlier.
 */

const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const pct = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 1,
});
const fechaLarga = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// --- Seed data (single hardcoded profile, PRD v1) --------------------------

const PERFIL = {
  edad: 32,
  edadJubilacion: 65,
  gastoMensualJubilacion: 2_000,
  swr: 0.04,
  rendimientoEsperado: 0.05,
};

const CUENTAS: { nombre: string; balance: number; type: AccountType; isInvested: boolean }[] = [
  { nombre: "Cuenta corriente", balance: 12_000, type: "cash", isInvested: false },
  { nombre: "Broker (indexados)", balance: 85_000, type: "brokerage", isInvested: true },
  { nombre: "Plan de pensiones", balance: 18_000, type: "pension", isInvested: true },
  { nombre: "Hipoteca pendiente", balance: 40_000, type: "debt", isInvested: false },
];

const INGRESO_MENSUAL = 3_200;
const GASTO_MENSUAL = 2_000;
const HOY = new Date();

// --- Derived figures --------------------------------------------------------

const gastoAnualJubilacion = PERFIL.gastoMensualJubilacion * 12;
const numeroFire = fireNumber(gastoAnualJubilacion, PERFIL.swr);
const patrimonioNeto = netWorth(CUENTAS);
const patrimonioInvertido = investedNetWorth(CUENTAS);
const tasaAhorro = savingsRate(INGRESO_MENSUAL, GASTO_MENSUAL);
const progreso = progressPct(patrimonioInvertido, numeroFire);
const liquidez = CUENTAS.filter((c) => c.type === "cash").reduce((s, c) => s + c.balance, 0);
const meses = monthsOfRunway(liquidez, GASTO_MENSUAL);
const coast = coastFireNumber({
  fireNumber: numeroFire,
  expectedReturn: PERFIL.rendimientoEsperado,
  yearsToRetirement: PERFIL.edadJubilacion - PERFIL.edad,
});

// Two scenarios to show the FIRE date moving earlier with more contribution.
const APORTACION_BASE = 600;
const APORTACION_ALTA = 1_200;

const escenarioBase = projectedFireDate({
  investedAssets: patrimonioInvertido,
  monthlyContribution: APORTACION_BASE,
  fireNumber: numeroFire,
  expectedAnnualReturn: PERFIL.rendimientoEsperado,
  from: HOY,
});
const escenarioAlto = projectedFireDate({
  investedAssets: patrimonioInvertido,
  monthlyContribution: APORTACION_ALTA,
  fireNumber: numeroFire,
  expectedAnnualReturn: PERFIL.rendimientoEsperado,
  from: HOY,
});

function fechaFire(r: ReturnType<typeof projectedFireDate>): string {
  if (!r.onTrack || !r.date) return "Aún no vas por buen camino";
  const años = Math.floor((r.monthsToFire ?? 0) / 12);
  const restoMeses = (r.monthsToFire ?? 0) % 12;
  return `${fechaLarga.format(r.date)} · dentro de ${años} años y ${restoMeses} meses`;
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-gray-100 py-2">
      <span className="text-gray-600">{etiqueta}</span>
      <span className="font-mono font-semibold">{valor}</span>
    </div>
  );
}

export default function DebugPage() {
  const diasAntes =
    escenarioBase.date && escenarioAlto.date
      ? Math.round(
          (escenarioBase.date.getTime() - escenarioAlto.date.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">Diagnóstico del motor FIRE</h1>
      <p className="mt-2 text-sm text-gray-500">
        Datos de ejemplo en memoria. Sin base de datos. Fase 1.
      </p>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">Números principales</h2>
        <Fila etiqueta="Número FIRE" valor={eur.format(numeroFire)} />
        <Fila etiqueta="Patrimonio neto" valor={eur.format(patrimonioNeto)} />
        <Fila etiqueta="Patrimonio invertido" valor={eur.format(patrimonioInvertido)} />
        <Fila etiqueta="Progreso hacia FIRE" valor={pct.format(progreso)} />
        <Fila etiqueta="Tasa de ahorro" valor={pct.format(tasaAhorro)} />
        <Fila
          etiqueta="Meses de colchón"
          valor={Number.isFinite(meses) ? meses.toFixed(1) : "∞"}
        />
        <Fila etiqueta="Número Coast FIRE" valor={eur.format(coast)} />
      </section>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">
          Fecha FIRE proyectada (el mecanismo central)
        </h2>
        <Fila
          etiqueta={`Aportando ${eur.format(APORTACION_BASE)}/mes`}
          valor={fechaFire(escenarioBase)}
        />
        <Fila
          etiqueta={`Aportando ${eur.format(APORTACION_ALTA)}/mes`}
          valor={fechaFire(escenarioAlto)}
        />
        {diasAntes !== null && (
          <p className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
            Doblar tu aportación mensual adelanta tu independencia financiera{" "}
            <strong>{diasAntes} días</strong>. Eso es el producto.
          </p>
        )}
      </section>
    </main>
  );
}
