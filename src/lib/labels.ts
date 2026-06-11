/** Spanish labels for enum values used across the UI. */
import type { AccountType } from "./fire";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: "Efectivo",
  brokerage: "Broker",
  pension: "Pensiones",
  crypto: "Cripto",
  property: "Inmueble",
  debt: "Deuda",
};

export type TxType = "income" | "expense" | "contribution" | "withdrawal";

export const TX_TYPE_LABELS: Record<TxType, string> = {
  income: "Ingreso",
  expense: "Gasto",
  contribution: "Aportación",
  withdrawal: "Retirada",
};

export const FIRE_VARIANT_LABELS: Record<string, string> = {
  full: "Independencia total",
  lean: "FIRE austero",
  coast: "Coast FIRE",
  barista: "Barista FIRE",
};
