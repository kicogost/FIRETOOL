/**
 * Monthly history aggregation — pure. Turns dated transactions + a per-month
 * net-worth series into a month-by-month summary (income, expenses, savings
 * rate, contributions, net worth, category breakdown). Most-recent first.
 */
export interface HistoryTxn {
  type: "income" | "expense" | "contribution" | "withdrawal";
  amount: number;
  category: string | null;
  date: string; // YYYY-MM-DD
}

export interface MonthSummary {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  contributions: number;
  savingsRate: number;
  netWorth: number | null;
  byCategory: { category: string; amount: number }[];
}

const monthKey = (d: string) => d.slice(0, 7);

export function summarizeMonthlyHistory(
  txns: HistoryTxn[],
  netWorthByMonth: Map<string, number>,
): MonthSummary[] {
  // Every month that appears in transactions or net-worth snapshots.
  const months = new Set<string>();
  for (const t of txns) months.add(monthKey(t.date));
  for (const m of netWorthByMonth.keys()) months.add(m);

  const summaries: MonthSummary[] = [];
  for (const month of months) {
    const inMonth = txns.filter((t) => monthKey(t.date) === month);
    const sum = (type: HistoryTxn["type"]) =>
      inMonth.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

    const income = sum("income");
    const expenses = sum("expense");
    const contributions = sum("contribution");
    const savingsRate = income > 0 ? (income - expenses) / income : 0;

    const catMap = new Map<string, number>();
    for (const t of inMonth.filter((t) => t.type === "expense")) {
      const k = t.category ?? "Otros gastos";
      catMap.set(k, (catMap.get(k) ?? 0) + t.amount);
    }
    const byCategory = [...catMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    summaries.push({
      month,
      income,
      expenses,
      contributions,
      savingsRate,
      netWorth: netWorthByMonth.get(month) ?? null,
      byCategory,
    });
  }

  return summaries.sort((a, b) => (a.month < b.month ? 1 : -1)); // newest first
}
