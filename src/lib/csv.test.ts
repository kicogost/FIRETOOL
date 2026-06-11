import { describe, it, expect } from "vitest";
import { parseTransactionsCsv } from "./csv";

describe("parseTransactionsCsv", () => {
  it("parses a well-formed Spanish CSV", () => {
    const csv = [
      "fecha,tipo,importe,categoria,cuenta,nota",
      "2026-06-01,ingreso,3200,Nómina,Efectivo,sueldo junio",
      "2026-06-03,gasto,850,Vivienda,Efectivo,",
      "2026-06-05,aportación,600,,Broker indexado,",
    ].join("\n");
    const { rows, errors } = parseTransactionsCsv(csv);
    expect(errors).toEqual([]);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ type: "income", amount: 3200, accountName: "Efectivo", category: "Nómina" });
    expect(rows[2]).toMatchObject({ type: "contribution", amount: 600, category: null });
  });

  it("accepts DD/MM/YYYY dates and Spanish decimal amounts", () => {
    const csv = ["fecha,tipo,importe,cuenta", "03/06/2026,gasto,\"1.234,56\",Efectivo"].join("\n");
    const { rows, errors } = parseTransactionsCsv(csv);
    expect(errors).toEqual([]);
    expect(rows[0].date).toBe("2026-06-03");
    expect(rows[0].amount).toBeCloseTo(1234.56);
  });

  it("reports missing required columns", () => {
    const { errors } = parseTransactionsCsv("fecha,importe\n2026-06-01,100");
    expect(errors.some((e) => e.message.includes("tipo"))).toBe(true);
    expect(errors.some((e) => e.message.includes("cuenta"))).toBe(true);
  });

  it("collects per-line errors and keeps valid rows", () => {
    const csv = [
      "fecha,tipo,importe,cuenta",
      "2026-13-99,gasto,100,Efectivo", // bad date
      "2026-06-01,desconocido,100,Efectivo", // bad type
      "2026-06-02,gasto,-5,Efectivo", // bad amount
      "2026-06-03,gasto,50,Efectivo", // valid
    ].join("\n");
    const { rows, errors } = parseTransactionsCsv(csv);
    expect(rows).toHaveLength(1);
    expect(errors).toHaveLength(3);
    expect(errors[0].line).toBe(2);
  });

  it("handles an empty file", () => {
    const { rows, errors } = parseTransactionsCsv("");
    expect(rows).toEqual([]);
    expect(errors[0].message).toContain("vacío");
  });

  it("honors quoted fields containing commas", () => {
    const csv = ['fecha,tipo,importe,cuenta,nota', '2026-06-01,gasto,20,Efectivo,"café, y tostada"'].join("\n");
    const { rows } = parseTransactionsCsv(csv);
    expect(rows[0].note).toBe("café, y tostada");
  });
});
