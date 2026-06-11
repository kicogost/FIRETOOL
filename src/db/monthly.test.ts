// Step 6 — monthly update: absolute balance set + no double-count of contribution.
import { beforeAll, describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeAll(() => {
  process.env.PGLITE_DIR = "memory://";
});

describe("monthly update", () => {
  it("setAccountBalance sets an absolute balance (not a delta)", async () => {
    const { setAccountBalance, getAccountsList } = await import("./mutations");
    const { getDashboardData } = await import("./queries");

    const broker = (await getAccountsList()).find((a) => a.name === "Broker indexado")!;
    await setAccountBalance(broker.id, 90_000);

    const data = (await getDashboardData())!;
    const b = data.accounts.find((a) => a.id === broker.id)!;
    expect(b.balance).toBe(90_000); // exact, not 85k + something
  });

  it("applyMonthlyUpdate keeps the set balance and records the contribution once", async () => {
    const { applyMonthlyUpdate, getAccountsList } = await import("./mutations");
    const { getDashboardData } = await import("./queries");

    const broker = (await getAccountsList()).find((a) => a.name === "Broker indexado")!;
    const before = (await getDashboardData())!;

    await applyMonthlyUpdate({
      balances: [{ accountId: broker.id, balance: 92_000 }],
      contribution: { accountId: broker.id, amount: 500 },
    });

    const after = (await getDashboardData())!;
    const b = after.accounts.find((a) => a.id === broker.id)!;
    // Balance is exactly what we set — NOT 92_000 + 500.
    expect(b.balance).toBe(92_000);
    // The contribution is still recorded for the streak/projection.
    expect(after.thisMonth.contributions).toBe(before.thisMonth.contributions + 500);
  });
});
