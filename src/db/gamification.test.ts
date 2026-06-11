// Temporary smoke test for Phase 4 gamification persistence + celebration.
// Deleted after review.
import { beforeAll, describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeAll(() => {
  process.env.PGLITE_DIR = "memory://";
});

describe("gamification flow", () => {
  it("records milestones from the seeded demo data and a streak", async () => {
    const { evaluateAndRecord } = await import("./gamification");
    const { getDashboardData } = await import("./queries");

    const result = await evaluateAndRecord();
    // Seed has invested 103k and past contributions, so several milestones fire.
    const keys = result.newMilestones.map((m) => m.key);
    expect(keys).toContain("first_contribution");
    expect(keys).toContain("invested_100000");
    expect(keys).toContain("runway_6");
    expect(result.streak.current).toBeGreaterThanOrEqual(1);

    // Re-evaluating records nothing new (append-only, idempotent).
    const again = await evaluateAndRecord();
    expect(again.newMilestones.length).toBe(0);

    // The dashboard now surfaces a latest badge and the streak.
    const data = (await getDashboardData())!;
    expect(data.latestMilestone).not.toBeNull();
    expect(data.streak.current).toBeGreaterThanOrEqual(1);
  });

  it("a contribution returns a celebration payload with a sooner FIRE date", async () => {
    const { addTransactionAction } = await import("@/app/actions/transactions");
    const { getAccountsList } = await import("./mutations");

    const broker = (await getAccountsList()).find((a) => a.name === "Broker indexado")!;
    const fd = new FormData();
    fd.set("accountId", broker.id);
    fd.set("type", "contribution");
    fd.set("amount", "10000");
    fd.set("date", new Date().toISOString().slice(0, 10));

    const payload = await addTransactionAction(fd);
    expect(payload.fireDateDaysEarlier).not.toBeNull();
    expect(payload.fireDateDaysEarlier!).toBeGreaterThan(0);
    expect(["quiet", "loud"]).toContain(payload.rewardStyle);
  });
});
