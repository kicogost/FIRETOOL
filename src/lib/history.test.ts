import { describe, it, expect } from "vitest";
import { summarizeMonthlyHistory, type HistoryTxn } from "./history";

const t = (date: string, type: HistoryTxn["type"], amount: number, category: string | null = null): HistoryTxn => ({
  type,
  amount,
  category,
  date,
});

describe("summarizeMonthlyHistory", () => {
  it("aggregates per month, newest first, with net worth and categories", () => {
    const txns = [
      t("2026-05-01", "income", 3000),
      t("2026-05-03", "expense", 1000, "Vivienda"),
      t("2026-05-04", "expense", 200, "Ocio"),
      t("2026-05-05", "contribution", 500),
      t("2026-06-01", "income", 3000),
      t("2026-06-03", "expense", 900, "Vivienda"),
    ];
    const nw = new Map([["2026-05", 50_000], ["2026-06", 53_000]]);

    const out = summarizeMonthlyHistory(txns, nw);
    expect(out.map((m) => m.month)).toEqual(["2026-06", "2026-05"]); // newest first

    const may = out.find((m) => m.month === "2026-05")!;
    expect(may.income).toBe(3000);
    expect(may.expenses).toBe(1200);
    expect(may.contributions).toBe(500);
    expect(may.savingsRate).toBeCloseTo((3000 - 1200) / 3000);
    expect(may.netWorth).toBe(50_000);
    expect(may.byCategory[0]).toEqual({ category: "Vivienda", amount: 1000 });
  });

  it("includes net-worth-only months and handles zero income", () => {
    const out = summarizeMonthlyHistory([t("2026-04-02", "expense", 100, "Ocio")], new Map([["2026-04", 10_000]]));
    expect(out).toHaveLength(1);
    expect(out[0].savingsRate).toBe(0); // no income → 0, not NaN
    expect(out[0].netWorth).toBe(10_000);
  });

  it("returns empty for no data", () => {
    expect(summarizeMonthlyHistory([], new Map())).toEqual([]);
  });
});
