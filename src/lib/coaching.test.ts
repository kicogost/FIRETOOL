import { describe, it, expect } from "vitest";
import { pickCoachingModule, applicableModules, type CoachingContext } from "./coaching";

const ok: CoachingContext = {
  monthsRunway: 6,
  daysSinceLastContribution: 10,
  hasFirstContribution: true,
  hasExpenseAnomaly: false,
  savingsRate3mo: 0.4,
};

describe("pickCoachingModule", () => {
  it("falls back to fire-basics when nothing is wrong (but invested → index-funds)", () => {
    // With a healthy state and a first contribution, index-funds applies.
    expect(pickCoachingModule(ok)).toBe("index-funds");
  });

  it("prioritises the emergency fund when runway is low", () => {
    expect(pickCoachingModule({ ...ok, monthsRunway: 2 })).toBe("emergency-fund");
  });

  it("nudges savings rate when it is below 20%", () => {
    expect(pickCoachingModule({ ...ok, savingsRate3mo: 0.1 })).toBe("savings-rate");
  });

  it("suggests DCA when no contribution in 45 days or never", () => {
    expect(pickCoachingModule({ ...ok, daysSinceLastContribution: 60 })).toBe("dollar-cost-averaging");
    expect(pickCoachingModule({ ...ok, daysSinceLastContribution: null, hasFirstContribution: false })).toBe(
      "dollar-cost-averaging",
    );
  });

  it("suggests sinking funds on an expense anomaly", () => {
    expect(
      pickCoachingModule({ ...ok, hasExpenseAnomaly: true, hasFirstContribution: false }),
    ).toBe("sinking-funds");
  });

  it("defaults to fire-basics for a brand-new user with no signals", () => {
    expect(
      pickCoachingModule({
        monthsRunway: 6,
        daysSinceLastContribution: 10,
        hasFirstContribution: false,
        hasExpenseAnomaly: false,
        savingsRate3mo: 0.4,
      }),
    ).toBe("fire-basics");
  });

  it("respects priority: emergency fund beats savings rate", () => {
    expect(pickCoachingModule({ ...ok, monthsRunway: 1, savingsRate3mo: 0.05 })).toBe("emergency-fund");
  });
});

describe("applicableModules", () => {
  it("always includes fire-basics and dedupes", () => {
    const mods = applicableModules({ ...ok, monthsRunway: 1, savingsRate3mo: 0.1 });
    expect(mods).toContain("fire-basics");
    expect(mods[0]).toBe("emergency-fund");
    expect(new Set(mods).size).toBe(mods.length);
  });
});
