import { describe, it, expect } from "vitest";
import {
  clampSwr,
  fireNumber,
  savingsRate,
  progressPct,
  netWorth,
  investedNetWorth,
  monthsOfRunway,
  coastFireNumber,
  projectedFireDate,
  MIN_SWR,
  MAX_SWR,
  MAX_PROJECTION_MONTHS,
  type AccountType,
} from "./fire";

describe("clampSwr", () => {
  it("returns the value when inside [3%, 5%]", () => {
    expect(clampSwr(0.04)).toBe(0.04);
  });
  it("clamps below the minimum", () => {
    expect(clampSwr(0.01)).toBe(MIN_SWR);
  });
  it("clamps above the maximum", () => {
    expect(clampSwr(0.09)).toBe(MAX_SWR);
  });
});

describe("fireNumber", () => {
  it("applies the x25 rule at the default 4% SWR", () => {
    expect(fireNumber(24_000)).toBe(600_000);
  });
  it("is larger at the 3% SWR bound", () => {
    expect(fireNumber(24_000, 0.03)).toBeCloseTo(800_000);
  });
  it("is smaller at the 5% SWR bound", () => {
    expect(fireNumber(24_000, 0.05)).toBeCloseTo(480_000);
  });
  it("clamps an out-of-range SWR before computing", () => {
    // 2% is clamped to 3% → same as the 3% case.
    expect(fireNumber(24_000, 0.02)).toBeCloseTo(800_000);
  });
});

describe("savingsRate", () => {
  it("computes a normal positive rate", () => {
    expect(savingsRate(3_000, 1_800)).toBeCloseTo(0.4);
  });
  it("returns 0 when income is zero", () => {
    expect(savingsRate(0, 500)).toBe(0);
  });
  it("returns 0 when income is negative", () => {
    expect(savingsRate(-100, 500)).toBe(0);
  });
  it("can be negative when expenses exceed income", () => {
    expect(savingsRate(2_000, 2_500)).toBeCloseTo(-0.25);
  });
});

describe("progressPct", () => {
  it("computes invested / fireNumber", () => {
    expect(progressPct(150_000, 600_000)).toBeCloseTo(0.25);
  });
  it("floors negative invested net worth at 0", () => {
    expect(progressPct(-5_000, 600_000)).toBe(0);
  });
  it("returns 0 when the FIRE number is non-positive", () => {
    expect(progressPct(150_000, 0)).toBe(0);
  });
});

describe("netWorth", () => {
  it("sums balances with debt subtracting", () => {
    const accounts: { balance: number; type: AccountType }[] = [
      { balance: 10_000, type: "cash" },
      { balance: 90_000, type: "brokerage" },
      { balance: 15_000, type: "debt" },
    ];
    expect(netWorth(accounts)).toBe(85_000);
  });
  it("is 0 for no accounts", () => {
    expect(netWorth([])).toBe(0);
  });
});

describe("investedNetWorth", () => {
  it("sums only invested accounts", () => {
    const accounts = [
      { balance: 10_000, isInvested: false },
      { balance: 90_000, isInvested: true },
      { balance: 25_000, isInvested: true },
    ];
    expect(investedNetWorth(accounts)).toBe(115_000);
  });
});

describe("monthsOfRunway", () => {
  it("divides cash by average monthly expenses", () => {
    expect(monthsOfRunway(12_000, 2_000)).toBe(6);
  });
  it("returns Infinity when there are no expenses", () => {
    expect(monthsOfRunway(12_000, 0)).toBe(Infinity);
  });
});

describe("coastFireNumber", () => {
  it("discounts the FIRE number back by the growth horizon", () => {
    // 600k / 1.05^30 ≈ 138,826.47
    expect(
      coastFireNumber({
        fireNumber: 600_000,
        expectedReturn: 0.05,
        yearsToRetirement: 30,
      }),
    ).toBeCloseTo(138_826.47, 1);
  });
  it("equals the FIRE number at retirement (0 years left)", () => {
    expect(
      coastFireNumber({ fireNumber: 600_000, yearsToRetirement: 0 }),
    ).toBe(600_000);
  });
});

describe("projectedFireDate", () => {
  const from = new Date("2026-01-01T00:00:00.000Z");

  it("returns 0 months when already at or above target", () => {
    const result = projectedFireDate({
      investedAssets: 650_000,
      monthlyContribution: 1_000,
      fireNumber: 600_000,
      from,
    });
    expect(result.onTrack).toBe(true);
    expect(result.monthsToFire).toBe(0);
    expect(result.date?.getTime()).toBe(from.getTime());
  });

  it("projects a finite, sensible date on a normal path", () => {
    const result = projectedFireDate({
      investedAssets: 100_000,
      monthlyContribution: 2_000,
      fireNumber: 600_000,
      expectedAnnualReturn: 0.05,
      from,
    });
    expect(result.onTrack).toBe(true);
    expect(result.monthsToFire).toBeGreaterThan(0);
    expect(result.monthsToFire).toBeLessThan(MAX_PROJECTION_MONTHS);
    expect(result.date).toBeInstanceOf(Date);
  });

  it("is not on track with zero contribution below target (no infinity)", () => {
    const result = projectedFireDate({
      investedAssets: 1_000,
      monthlyContribution: 0,
      fireNumber: 600_000,
      expectedAnnualReturn: 0, // no growth either → genuinely unreachable
      from,
    });
    expect(result.onTrack).toBe(false);
    expect(result.date).toBeNull();
    expect(result.monthsToFire).toBeNull();
  });

  it("core mechanic: a higher contribution yields a strictly earlier date", () => {
    const base = projectedFireDate({
      investedAssets: 100_000,
      monthlyContribution: 1_000,
      fireNumber: 600_000,
      from,
    });
    const more = projectedFireDate({
      investedAssets: 100_000,
      monthlyContribution: 2_000,
      fireNumber: 600_000,
      from,
    });
    expect(base.monthsToFire).not.toBeNull();
    expect(more.monthsToFire).not.toBeNull();
    expect(more.monthsToFire!).toBeLessThan(base.monthsToFire!);
    expect(more.date!.getTime()).toBeLessThan(base.date!.getTime());
  });

  it("uses the default expected return when none is given", () => {
    const result = projectedFireDate({
      investedAssets: 100_000,
      monthlyContribution: 2_000,
      fireNumber: 600_000,
      from,
    });
    expect(result.onTrack).toBe(true);
  });
});
