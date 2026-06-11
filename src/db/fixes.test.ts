// Regression tests for bugs found in the final review (H1, H2, M3, M5).
import { beforeAll, describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeAll(() => {
  process.env.PGLITE_DIR = "memory://";
});

describe("H2: transactions on a debt account move net worth the right way", () => {
  it("paying toward a debt (income) raises net worth; charging it (expense) lowers it", async () => {
    const { getDashboardData } = await import("./queries");
    const { addTransaction, getAccountsList } = await import("./mutations");

    const debt = (await getAccountsList()).find((a) => a.name === "Hipoteca")!;
    const before = (await getDashboardData())!.netWorthValue;

    // Pay 1.000 € toward the mortgage → owed drops → net worth up.
    await addTransaction({
      accountId: debt.id,
      type: "income",
      amount: 1_000,
      category: null,
      note: null,
      date: new Date().toISOString().slice(0, 10),
    });
    const afterPay = (await getDashboardData())!.netWorthValue;
    expect(afterPay).toBe(before + 1_000);

    // Charge 500 € to it → owed rises → net worth down.
    await addTransaction({
      accountId: debt.id,
      type: "expense",
      amount: 500,
      category: null,
      note: null,
      date: new Date().toISOString().slice(0, 10),
    });
    const afterCharge = (await getDashboardData())!.netWorthValue;
    expect(afterCharge).toBe(afterPay - 500);
  });
});

describe("H1: re-onboarding clears stale milestones and streak", () => {
  it("wipes milestones and the streak row on reset", async () => {
    const { eq } = await import("drizzle-orm");
    const { getDb, schema } = await import("./index");
    const { evaluateAndRecord } = await import("./gamification");
    const { resetProfileData } = await import("./mutations");
    const { SINGLE_PROFILE_ID } = await import("./constants");

    await evaluateAndRecord(); // seed data earns several milestones + a streak
    const db = await getDb();
    const before = await db
      .select()
      .from(schema.milestones)
      .where(eq(schema.milestones.profileId, SINGLE_PROFILE_ID));
    expect(before.length).toBeGreaterThan(0);

    await resetProfileData();

    const milestonesAfter = await db
      .select()
      .from(schema.milestones)
      .where(eq(schema.milestones.profileId, SINGLE_PROFILE_ID));
    const streaksAfter = await db
      .select()
      .from(schema.streaks)
      .where(eq(schema.streaks.profileId, SINGLE_PROFILE_ID));
    expect(milestonesAfter.length).toBe(0);
    expect(streaksAfter.length).toBe(0);
  });
});

describe("M3: a brand-new user's dashboard projection matches the onboarding summary", () => {
  it("does not divide a single month's contribution by 3", async () => {
    const { completeOnboarding } = await import("@/app/actions/onboarding");
    const { getDashboardData } = await import("./queries");
    const { projectedFireDate } = await import("@/lib/fire");

    await completeOnboarding({
      name: "Nueva",
      age: 30,
      monthlyIncome: 2_500,
      monthlyExpenses: 1_800, // surplus 700
      netWorth: { cash: 5_000, investments: 20_000, pension: 0, crypto: 0, property: 0, debt: 0 },
      investsRegularly: "yes",
      fireVariant: "full",
      retirementMonthlySpend: 1_800,
      rewardStyle: "loud",
    });

    const data = (await getDashboardData())!;
    // The summary page projects with the raw monthly surplus (700).
    const summaryProjection = projectedFireDate({
      investedAssets: data.investedNetWorthValue,
      monthlyContribution: 700,
      fireNumber: data.fireNumberValue,
      expectedAnnualReturn: Number(data.profile.expectedReturn),
      from: new Date(),
    });
    // With the fix, the dashboard uses 700 (not 700/3), so both agree.
    expect(data.projection.onTrack).toBe(true);
    expect(data.projection.monthsToFire).toBe(summaryProjection.monthsToFire);
  });
});
