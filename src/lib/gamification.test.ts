import { describe, it, expect } from "vitest";
import {
  satisfiedMilestones,
  computeStreak,
  describeMilestone,
  type GamificationState,
} from "./gamification";

const baseState: GamificationState = {
  investedNetWorth: 0,
  progress: 0,
  savingsRate: 0,
  monthsRunway: 0,
  isCoastFire: false,
  currentStreak: 0,
  hasAnyContribution: false,
};

describe("satisfiedMilestones", () => {
  it("returns nothing for an empty starting state", () => {
    expect(satisfiedMilestones(baseState)).toEqual([]);
  });

  it("awards first_contribution and invested thresholds passed", () => {
    const keys = satisfiedMilestones({
      ...baseState,
      hasAnyContribution: true,
      investedNetWorth: 30_000,
    });
    expect(keys).toContain("first_contribution");
    expect(keys).toContain("invested_1000");
    expect(keys).toContain("invested_10000");
    expect(keys).toContain("invested_25000");
    expect(keys).not.toContain("invested_50000");
  });

  it("awards a progress milestone for each 10% reached, capped at 100", () => {
    const keys = satisfiedMilestones({ ...baseState, progress: 0.35 });
    expect(keys).toContain("progress_10");
    expect(keys).toContain("progress_30");
    expect(keys).not.toContain("progress_40");

    const maxed = satisfiedMilestones({ ...baseState, progress: 1.5 });
    expect(maxed).toContain("progress_100");
    expect(maxed.filter((k) => k.startsWith("progress_")).length).toBe(10);
  });

  it("awards savings, streak, coast and runway milestones", () => {
    const keys = satisfiedMilestones({
      ...baseState,
      savingsRate: 0.45,
      currentStreak: 6,
      isCoastFire: true,
      monthsRunway: 8,
    });
    expect(keys).toContain("savings_30");
    expect(keys).toContain("savings_40");
    expect(keys).not.toContain("savings_50");
    expect(keys).toContain("streak_3");
    expect(keys).toContain("streak_6");
    expect(keys).not.toContain("streak_12");
    expect(keys).toContain("coast_fire");
    expect(keys).toContain("runway_6");
  });
});

describe("computeStreak", () => {
  it("is zero with no contributions", () => {
    expect(computeStreak([], "2026-06")).toEqual({ current: 0, best: 0 });
  });

  it("counts consecutive months ending at the current month", () => {
    const r = computeStreak(["2026-04", "2026-05", "2026-06"], "2026-06");
    expect(r.current).toBe(3);
    expect(r.best).toBe(3);
  });

  it("keeps the current streak when this month has no contribution yet (grace)", () => {
    const r = computeStreak(["2026-04", "2026-05"], "2026-06");
    expect(r.current).toBe(2);
  });

  it("breaks the current streak after a gap but remembers the best", () => {
    const r = computeStreak(["2026-01", "2026-02", "2026-03"], "2026-06");
    expect(r.current).toBe(0);
    expect(r.best).toBe(3);
  });

  it("handles a year boundary", () => {
    const r = computeStreak(["2025-11", "2025-12", "2026-01"], "2026-01");
    expect(r.current).toBe(3);
    expect(r.best).toBe(3);
  });
});

describe("describeMilestone", () => {
  it("produces Spanish titles for dynamic keys", () => {
    expect(describeMilestone("invested_10000").title).toContain("invertidos");
    expect(describeMilestone("progress_30").title).toBe("30% de tu meta FIRE");
    expect(describeMilestone("streak_6").title).toBe("6 meses seguidos");
    expect(describeMilestone("savings_40").title).toBe("Tasa de ahorro > 40%");
    expect(describeMilestone("first_contribution").title).toBe("Primera aportación");
    expect(describeMilestone("coast_fire").title).toContain("Coast FIRE");
  });
});
