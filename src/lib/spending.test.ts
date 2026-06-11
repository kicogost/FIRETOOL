import { describe, it, expect } from "vitest";
import { analyzeSpending, savingsRateToYears, type SpendingTxn } from "./spending";

const NOW = new Date("2026-06-15T00:00:00.000Z");

function exp(date: string, amount: number, category: string, note: string | null = null): SpendingTxn {
  return { type: "expense", amount, category, note, date };
}
function inc(date: string, amount: number): SpendingTxn {
  return { type: "income", amount, category: "Nómina", note: null, date };
}

describe("analyzeSpending", () => {
  it("returns empty analysis for no data", () => {
    const a = analyzeSpending([], NOW);
    expect(a.totalExpenses).toBe(0);
    expect(a.insights).toEqual([]);
    expect(a.byCategory).toEqual([]);
  });

  it("computes totals, savings rate and category breakdown", () => {
    const txns = [inc("2026-06-01", 3000), exp("2026-06-03", 800, "Vivienda"), exp("2026-06-08", 200, "Ocio")];
    const a = analyzeSpending(txns, NOW);
    expect(a.totalExpenses).toBe(1000);
    expect(a.income).toBe(3000);
    expect(a.savingsRate).toBeCloseTo((3000 - 1000) / 3000);
    expect(a.byCategory[0]).toMatchObject({ category: "Vivienda", amount: 800 });
    expect(a.byCategory[0].share).toBeCloseTo(0.8);
  });

  it("surfaces the key rule-based insights and excludes essentials from subscriptions", () => {
    const txns: SpendingTxn[] = [
      inc("2026-06-01", 3000),
      // fees
      exp("2026-06-02", 12, "Comisiones"),
      // recurring subscription (3 months) + recurring essential (must NOT count)
      exp("2026-06-05", 10, "Suscripciones"), exp("2026-05-05", 10, "Suscripciones"), exp("2026-04-05", 10, "Suscripciones"),
      exp("2026-06-03", 800, "Vivienda"), exp("2026-05-03", 800, "Vivienda"), exp("2026-04-03", 800, "Vivienda"),
      // Ocio spike: 200 now vs ~40 avg prior 3
      exp("2026-06-10", 200, "Ocio"), exp("2026-05-10", 40, "Ocio"), exp("2026-04-10", 50, "Ocio"), exp("2026-03-10", 30, "Ocio"),
      // eating out > groceries
      exp("2026-06-11", 300, "Restaurantes"), exp("2026-06-12", 200, "Alimentación"),
      // gastos hormiga (5 small)
      exp("2026-06-13", 3, "Otros gastos"), exp("2026-06-13", 4, "Otros gastos"), exp("2026-06-14", 2, "Otros gastos"),
      exp("2026-06-14", 3, "Otros gastos"), exp("2026-06-15", 4, "Otros gastos"),
    ];
    const a = analyzeSpending(txns, NOW);
    const keys = a.insights.map((i) => i.key);

    expect(keys).toContain("fees");
    expect(keys).toContain("subscriptions");
    expect(keys).toContain("spike:Ocio");
    expect(keys).toContain("eating-out");
    expect(keys).toContain("hormiga");
    expect(keys).toContain("good-month"); // SR > 30%

    // Subscription total counts only the Suscripciones charge, not rent.
    const sub = a.insights.find((i) => i.key === "subscriptions")!;
    expect(sub.title).toContain("10");
    expect(sub.title).toContain("1 cargo");
    // Vivienda must not be flagged as a subscription spike either.
    expect(keys).not.toContain("spike:Vivienda");
  });

  it("flags a savings-rate drop with the main driver", () => {
    const txns = [
      inc("2026-06-01", 3000), inc("2026-05-01", 3000),
      exp("2026-05-04", 1500, "Vivienda"), // prev SR 50%
      exp("2026-06-04", 1500, "Vivienda"), exp("2026-06-09", 900, "Ocio"), // cur SR 20%, Ocio is the driver
    ];
    const a = analyzeSpending(txns, NOW);
    const drop = a.insights.find((i) => i.key === "sr-drop");
    expect(drop).toBeTruthy();
    expect(drop!.detail).toContain("Ocio");
  });
});

describe("savingsRateToYears", () => {
  it("returns null for non-positive rates", () => {
    expect(savingsRateToYears(0)).toBeNull();
    expect(savingsRateToYears(-0.1)).toBeNull();
  });
  it("decreases as savings rate rises", () => {
    const y10 = savingsRateToYears(0.1)!;
    const y50 = savingsRateToYears(0.5)!;
    expect(y10).toBeGreaterThan(y50);
    expect(y50).toBeLessThan(20);
  });
});
