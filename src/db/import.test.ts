// Integration test for Phase 6 CSV import action against in-memory PGlite.
import { beforeAll, describe, it, expect, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeAll(() => {
  process.env.PGLITE_DIR = "memory://";
});

describe("CSV import action", () => {
  it("imports valid rows, skips unknown accounts, reports errors", async () => {
    const { importTransactionsCsv } = await import("@/app/actions/import");
    const { getDashboardData } = await import("./queries");

    const before = (await getDashboardData())!;

    const csv = [
      "fecha,tipo,importe,categoria,cuenta,nota",
      "2026-06-10,gasto,100,Ocio,Cuenta corriente,cine",
      "2026-06-11,aportación,500,,Broker indexado,",
      "2026-06-12,gasto,30,Ocio,Cuenta inexistente,", // unknown account → skipped
      "no-es-fecha,gasto,30,Ocio,Cuenta corriente,", // bad row → error
    ].join("\n");

    const result = await importTransactionsCsv(csv);
    expect(result.imported).toBe(2);
    expect(result.unknownAccounts).toContain("Cuenta inexistente");
    expect(result.errors.length).toBe(1);

    // The 500 contribution raised invested net worth.
    const after = (await getDashboardData())!;
    expect(after.investedNetWorthValue).toBe(before.investedNetWorthValue + 500);
  });
});
