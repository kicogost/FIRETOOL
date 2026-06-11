// Temporary smoke test for the DB foundation + Phase 2 write path — runs
// migrations + seed against an in-memory PGlite. Deleted after Phase 2 review.
import { beforeAll, describe, it, expect } from "vitest";

beforeAll(() => {
  process.env.PGLITE_DIR = "memory://";
});

describe("DB foundation smoke", () => {
  it("migrates, seeds, and aggregates a dashboard", async () => {
    const { getDashboardData } = await import("./queries");
    const data = await getDashboardData();
    expect(data).not.toBeNull();
    expect(data!.profile.name).toBe("Demo");
    expect(data!.accounts.length).toBe(4);
    expect(data!.fireNumberValue).toBe(600_000);
    expect(data!.investedNetWorthValue).toBe(103_000); // 85k broker + 18k pension
    expect(data!.netWorthValue).toBe(75_000); // 103k invested + 12k cash - 40k debt
    expect(data!.netWorthSeries.length).toBeGreaterThan(0);
    expect(data!.thisMonth.income).toBe(3_200);
    expect(data!.projection.onTrack).toBe(true);
    expect(data!.spendBreakdown.length).toBeGreaterThan(0);
  });

  it("a contribution raises invested net worth and FIRE progress", async () => {
    const { getDashboardData } = await import("./queries");
    const { addTransaction, getAccountsList } = await import("./mutations");

    const before = (await getDashboardData())!;
    const broker = (await getAccountsList()).find((a) => a.name === "Broker indexado")!;

    await addTransaction({
      accountId: broker.id,
      type: "contribution",
      amount: 5_000,
      category: null,
      note: null,
      date: new Date().toISOString().slice(0, 10),
    });

    const after = (await getDashboardData())!;
    expect(after.investedNetWorthValue).toBe(before.investedNetWorthValue + 5_000);
    expect(after.progress).toBeGreaterThan(before.progress);
  });

  it("creating an account adds it with its opening balance", async () => {
    const { createAccount, getAccountsList } = await import("./mutations");
    await createAccount({
      name: "Cripto",
      type: "crypto",
      isInvested: true,
      initialBalance: 3_000,
    });
    const accounts = await getAccountsList();
    expect(accounts.some((a) => a.name === "Cripto")).toBe(true);
  });
});
