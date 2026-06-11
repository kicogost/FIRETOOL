"use server";

import { revalidatePath } from "next/cache";
import { applyMonthlyUpdate } from "@/db/mutations";
import { evaluateAndRecord } from "@/db/gamification";

export interface MonthlyUpdateInput {
  balances: { accountId: string; balance: number }[];
  contribution?: { accountId: string; amount: number } | null;
}

export async function applyMonthlyUpdateAction(input: MonthlyUpdateInput): Promise<void> {
  // Sanitize: only finite, non-negative balances.
  const balances = input.balances
    .filter((b) => b.accountId && Number.isFinite(b.balance) && b.balance >= 0)
    .map((b) => ({ accountId: b.accountId, balance: b.balance }));

  const contribution =
    input.contribution &&
    input.contribution.accountId &&
    Number.isFinite(input.contribution.amount) &&
    input.contribution.amount > 0
      ? { accountId: input.contribution.accountId, amount: input.contribution.amount }
      : null;

  await applyMonthlyUpdate({ balances, contribution });
  await evaluateAndRecord();

  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/accounts");
  revalidatePath("/actualizar");
}
