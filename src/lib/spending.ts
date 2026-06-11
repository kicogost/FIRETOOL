/**
 * Spending-analysis engine — pure, rule-based (no AI). Turns categorized
 * transactions into Spanish, actionable insights. Rules and framing follow the
 * r/SpainFIRE research: concrete euros/year, optional levers, never preachy.
 *
 * All amounts in EUR. Dates are "YYYY-MM-DD" strings.
 */

export interface SpendingTxn {
  type: "income" | "expense" | "contribution" | "withdrawal";
  amount: number;
  category: string | null;
  note: string | null;
  date: string;
}

export type InsightTone = "info" | "warn" | "tip" | "positive";

export interface SpendingInsight {
  key: string;
  tone: InsightTone;
  icon: string;
  title: string;
  detail: string;
}

export interface CategorySlice {
  category: string;
  amount: number;
  share: number; // 0..1 of total expenses
}

export interface SpendingAnalysis {
  month: string; // YYYY-MM
  totalExpenses: number;
  income: number;
  savingsRate: number;
  byCategory: CategorySlice[];
  insights: SpendingInsight[];
}

const eur0 = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const pct0 = new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 0 });
const eur = (n: number) => eur0.format(Math.round(n));
const pct = (n: number) => pct0.format(n);

const monthKey = (d: string) => d.slice(0, 7);

function monthKeyOf(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
function shiftMonth(date: Date, delta: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));
}

const norm = (s: string | null) => (s ?? "").toLowerCase();
const isFee = (t: SpendingTxn) =>
  t.category === "Comisiones" || /comisi|cajero|mantenimiento|transferencia/.test(norm(t.note) + norm(t.category));

const ESSENTIAL = new Set(["Vivienda", "Alimentación", "Transporte", "Salud"]);

/** Map a savings rate to a rough years-to-FI (community heuristic, ~5% real return). */
export function savingsRateToYears(rate: number): number | null {
  if (rate <= 0) return null;
  const table: [number, number][] = [
    [0.05, 66], [0.1, 51], [0.15, 43], [0.2, 37], [0.25, 32], [0.3, 28],
    [0.35, 25], [0.4, 22], [0.45, 19], [0.5, 17], [0.6, 12.5], [0.7, 8.5], [0.8, 5.5],
  ];
  if (rate >= 0.8) return 5;
  for (let i = 0; i < table.length - 1; i++) {
    const [r1, y1] = table[i];
    const [r2, y2] = table[i + 1];
    if (rate >= r1 && rate <= r2) {
      const t = (rate - r1) / (r2 - r1);
      return Math.round(y1 + (y2 - y1) * t);
    }
  }
  return table[0][1];
}

export function analyzeSpending(txns: SpendingTxn[], now: Date): SpendingAnalysis {
  const curMonth = monthKeyOf(now);
  const prevMonth = monthKeyOf(shiftMonth(now, -1));

  const expenses = txns.filter((t) => t.type === "expense");
  const expInMonth = (m: string) => expenses.filter((t) => monthKey(t.date) === m);
  const sum = (rows: SpendingTxn[]) => rows.reduce((s, t) => s + t.amount, 0);
  const incomeInMonth = (m: string) =>
    sum(txns.filter((t) => t.type === "income" && monthKey(t.date) === m));

  const catTotals = (rows: SpendingTxn[]) => {
    const map = new Map<string, number>();
    for (const t of rows) {
      const k = t.category ?? "Otros gastos";
      map.set(k, (map.get(k) ?? 0) + t.amount);
    }
    return map;
  };

  const curExp = expInMonth(curMonth);
  const totalExpenses = sum(curExp);
  const income = incomeInMonth(curMonth);
  const savingsRate = income > 0 ? (income - totalExpenses) / income : 0;

  const curCats = catTotals(curExp);
  const byCategory: CategorySlice[] = [...curCats.entries()]
    .map(([category, amount]) => ({ category, amount, share: totalExpenses > 0 ? amount / totalExpenses : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const insights: SpendingInsight[] = [];

  // R4 — Bank/ATM fees (recoverable money first).
  const fees = sum(curExp.filter(isFee));
  if (fees > 0) {
    insights.push({
      key: "fees",
      tone: "warn",
      icon: "🏦",
      title: `${eur(fees)} en comisiones este mes`,
      detail:
        "Hay neobancos sin comisiones (Revolut, N26, imagin) con IBAN español y Bizum. Cambiar es gratis y recuperas ese dinero cada mes.",
    });
  }

  // R2 — Recurring / subscription detection (last 4 months), excluding essentials.
  const last4 = [0, 1, 2, 3].map((i) => monthKeyOf(shiftMonth(now, -i)));
  const groups = new Map<string, { months: Set<string>; latest: { amount: number; month: string } }>();
  for (const t of expenses) {
    const m = monthKey(t.date);
    if (!last4.includes(m)) continue;
    const key = `${t.category ?? "Otros gastos"}|${Math.round(t.amount)}`;
    const g = groups.get(key) ?? { months: new Set<string>(), latest: { amount: 0, month: "" } };
    g.months.add(m);
    if (m >= g.latest.month) g.latest = { amount: t.amount, month: m };
    groups.set(key, g);
  }
  let subTotal = 0;
  let subCount = 0;
  for (const [key, g] of groups) {
    if (g.months.size < 3) continue; // recurring ≈ monthly
    const category = key.split("|")[0];
    const amount = g.latest.amount;
    const subscriptionLike = category === "Suscripciones" || (amount <= 40 && !ESSENTIAL.has(category));
    if (!subscriptionLike) continue;
    subTotal += amount;
    subCount += 1;
  }
  if (subTotal > 0) {
    insights.push({
      key: "subscriptions",
      tone: "tip",
      icon: "🔁",
      title: `${subCount} cargo${subCount === 1 ? "" : "s"} recurrente${subCount === 1 ? "" : "s"}: ${eur(subTotal)}/mes`,
      detail: `Son ${eur(subTotal * 12)} al año. Revisa cuáles usas de verdad — cancelar una es ahorro permanente.`,
    });
  }

  // R1 — Category spike vs trailing 3-month average (top 2).
  const prior3 = [1, 2, 3].map((i) => monthKeyOf(shiftMonth(now, -i)));
  const spikes: { category: string; cur: number; avg: number }[] = [];
  for (const [category, cur] of curCats) {
    const priorAvg = prior3.reduce((s, m) => s + (catTotals(expInMonth(m)).get(category) ?? 0), 0) / 3;
    if (priorAvg > 0 && cur > 2 * priorAvg && cur > 30) spikes.push({ category, cur, avg: priorAvg });
  }
  for (const s of spikes.sort((a, b) => b.cur - a.cur).slice(0, 2)) {
    insights.push({
      key: `spike:${s.category}`,
      tone: "warn",
      icon: "📈",
      title: `${s.category}: ${eur(s.cur)} este mes`,
      detail: `Más del doble de tu media (${eur(s.avg)}). ¿Algo puntual o una nueva costumbre?`,
    });
  }

  // R6 — Savings-rate drop vs last month.
  const prevIncome = incomeInMonth(prevMonth);
  const prevExp = expInMonth(prevMonth);
  const prevSR = prevIncome > 0 ? (prevIncome - sum(prevExp)) / prevIncome : 0;
  if (prevIncome > 0 && income > 0 && prevSR - savingsRate > 0.05) {
    const prevCats = catTotals(prevExp);
    let topCat = "";
    let topDelta = 0;
    for (const [c, amt] of curCats) {
      const delta = amt - (prevCats.get(c) ?? 0);
      if (delta > topDelta) {
        topDelta = delta;
        topCat = c;
      }
    }
    insights.push({
      key: "sr-drop",
      tone: "warn",
      icon: "📉",
      title: `Tu tasa de ahorro bajó: ${pct(prevSR)} → ${pct(savingsRate)}`,
      detail: topCat ? `El mayor aumento fue ${eur(topDelta)} en ${topCat}.` : "Has gastado más que el mes pasado.",
    });
  }

  // R9 — Eating out vs groceries.
  const rest = curCats.get("Restaurantes") ?? 0;
  const groc = curCats.get("Alimentación") ?? 0;
  if (rest + groc > 0 && rest / (rest + groc) > 0.5) {
    insights.push({
      key: "eating-out",
      tone: "info",
      icon: "🍽️",
      title: `La mayoría de tu comida fue fuera de casa`,
      detail: `${eur(rest)} en restaurantes vs ${eur(groc)} en súper. No es malo — solo para que lo veas.`,
    });
  }

  // R13 — "Gastos hormiga" (small discretionary buys).
  const hormiga = curExp.filter((t) => t.amount < 5);
  if (hormiga.length >= 5) {
    const total = sum(hormiga);
    insights.push({
      key: "hormiga",
      tone: "info",
      icon: "🐜",
      title: `Gastos hormiga: ${eur(total)} este mes`,
      detail: `${hormiga.length} compras de menos de 5 €. Suman ${eur(total * 12)} al año.`,
    });
  }

  // R12 — Projected month-end (guardrail framing).
  const daysElapsed = now.getUTCDate();
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const avgMonthly = prior3.reduce((s, m) => s + sum(expInMonth(m)), 0) / 3;
  if (daysElapsed >= 5 && daysElapsed < daysInMonth && avgMonthly > 0) {
    const projected = totalExpenses * (daysInMonth / daysElapsed);
    if (projected > avgMonthly * 1.1) {
      insights.push({
        key: "projected",
        tone: "info",
        icon: "🧭",
        title: `Vas camino de ${eur(projected)} este mes`,
        detail: `Por encima de tu media (${eur(avgMonthly)}). Aún estás a tiempo de ajustar.`,
      });
    }
  }

  // Positive reinforcement (identity framing).
  if (income > 0 && savingsRate >= 0.3) {
    const years = savingsRateToYears(savingsRate);
    insights.push({
      key: "good-month",
      tone: "positive",
      icon: "🎯",
      title: `¡Buen mes! Ahorras el ${pct(savingsRate)} de tus ingresos`,
      detail: years
        ? `A este ritmo, rondarías tu independencia en ~${years} años. La tasa de ahorro es la palanca que más manda.`
        : "La tasa de ahorro es la palanca que más manda hacia tu libertad.",
    });
  }

  return { month: curMonth, totalExpenses, income, savingsRate, byCategory, insights };
}
