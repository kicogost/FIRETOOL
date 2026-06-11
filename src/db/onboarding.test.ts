// Temporary smoke test for Phase 3 onboarding — drives completeOnboarding and
// checks the dashboard reflects the new profile/accounts. Deleted after review.
import { beforeAll, describe, it, expect, vi } from "vitest";

// revalidatePath requires a Next request context (absent in unit tests); the
// orchestration logic is what we're verifying here.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeAll(() => {
  process.env.PGLITE_DIR = "memory://";
});

describe("onboarding flow", () => {
  it("replaces demo data with the user's profile and computes a fresh starting point", async () => {
    const { completeOnboarding } = await import("@/app/actions/onboarding");
    const { getDashboardData } = await import("./queries");
    const { getAccountsList } = await import("./mutations");

    await completeOnboarding({
      name: "Lucía",
      age: 30,
      monthlyIncome: 2_500,
      monthlyExpenses: 1_800,
      netWorth: { cash: 8_000, investments: 20_000, pension: 5_000, crypto: 0, property: 0, debt: 10_000 },
      investsRegularly: "yes",
      fireVariant: "full",
      retirementMonthlySpend: 1_800,
      rewardStyle: "loud",
    });

    const data = (await getDashboardData())!;
    expect(data.profile.name).toBe("Lucía");
    expect(data.profile.age).toBe(30);

    // FIRE number = 1800*12 / 0.04 = 540.000
    expect(data.fireNumberValue).toBe(540_000);

    // Invested = 20k broker + 5k pension + this-month contribution (surplus 700).
    expect(data.investedNetWorthValue).toBe(25_700);

    // Net worth = 8k cash + 25k invested + 700 contribution moved into broker − 10k debt.
    expect(data.netWorthValue).toBe(23_700);

    // Old demo accounts are gone; new ones created (no "Broker indexado").
    const accounts = await getAccountsList();
    expect(accounts.some((a) => a.name === "Broker indexado")).toBe(false);
    expect(accounts.some((a) => a.name === "Inversiones")).toBe(true);
    expect(accounts.some((a) => a.name === "Deudas")).toBe(true);

    // Income/expense recorded for savings-rate (income did NOT inflate cash).
    expect(data.thisMonth.income).toBe(2_500);
    expect(data.thisMonth.expenses).toBe(1_800);
    const cash = accounts.find((a) => a.name === "Efectivo")!;
    const cashBalance = data.accounts.find((a) => a.id === cash.id)!.balance;
    expect(cashBalance).toBe(8_000); // unchanged by the income/expense estimates
  });
});
