"use server";

import { revalidatePath } from "next/cache";
import {
  updateProfile,
  createAccount,
  addTransaction,
  resetProfileData,
  getAccountsList,
} from "@/db/mutations";
import { evaluateAndRecord } from "@/db/gamification";
import type { AccountType } from "@/lib/fire";

export interface OnboardingData {
  name: string;
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: {
    cash: number;
    investments: number;
    pension: number;
    crypto: number;
    property: number;
    debt: number;
  };
  investsRegularly: "yes" | "sometimes" | "no";
  fireVariant: "full" | "barista" | "coast";
  retirementMonthlySpend: number;
  rewardStyle: "quiet" | "loud";
}

function thisMonthDay(day: number): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day))
    .toISOString()
    .slice(0, 10);
}

export async function completeOnboarding(data: OnboardingData): Promise<void> {
  // Start fresh: onboarding defines the full picture (replaces seed/demo data).
  await resetProfileData();

  await updateProfile({
    name: data.name,
    age: data.age,
    retirementMonthlySpend: data.retirementMonthlySpend,
    fireVariant: data.fireVariant,
    rewardStyle: data.rewardStyle,
  });

  // One account per non-empty net-worth field. Always create a cash account so
  // income/expense transactions have somewhere to attach.
  const specs: { value: number; name: string; type: AccountType; isInvested: boolean; force?: boolean }[] = [
    { value: data.netWorth.cash, name: "Efectivo", type: "cash", isInvested: false, force: true },
    { value: data.netWorth.investments, name: "Inversiones", type: "brokerage", isInvested: true },
    { value: data.netWorth.pension, name: "Plan de pensiones", type: "pension", isInvested: true },
    { value: data.netWorth.crypto, name: "Cripto", type: "crypto", isInvested: true },
    { value: data.netWorth.property, name: "Inmueble", type: "property", isInvested: false },
    { value: data.netWorth.debt, name: "Deudas", type: "debt", isInvested: false },
  ];

  let cashAccountId: string | null = null;
  let investAccountId: string | null = null;

  for (const s of specs) {
    if (s.value <= 0 && !s.force) continue;
    const id = await createAccount({
      name: s.name,
      type: s.type,
      isInvested: s.isInvested,
      initialBalance: s.value,
    });
    if (s.type === "cash") cashAccountId = id;
    if (s.isInvested && investAccountId === null) investAccountId = id;
  }

  if (!cashAccountId) {
    // Should not happen (cash is forced), but guard anyway.
    const accounts = await getAccountsList();
    cashAccountId = accounts[0]?.id ?? null;
  }

  // Record rough monthly income/expenses for the savings-rate calc, WITHOUT
  // moving balances (net worth above is already the current truth).
  if (cashAccountId) {
    if (data.monthlyIncome > 0) {
      await addTransaction(
        {
          accountId: cashAccountId,
          type: "income",
          amount: data.monthlyIncome,
          category: "Nómina",
          note: "Estimación inicial",
          date: thisMonthDay(1),
        },
        { adjustSnapshot: false },
      );
    }
    if (data.monthlyExpenses > 0) {
      await addTransaction(
        {
          accountId: cashAccountId,
          type: "expense",
          amount: data.monthlyExpenses,
          category: "Otros gastos",
          note: "Estimación inicial",
          date: thisMonthDay(2),
        },
        { adjustSnapshot: false },
      );
    }
  }

  // If they invest regularly, seed this month's contribution = monthly surplus,
  // so the dashboard shows momentum immediately. This one DOES move the balance.
  const surplus = Math.max(0, data.monthlyIncome - data.monthlyExpenses);
  if (data.investsRegularly !== "no" && investAccountId && surplus > 0) {
    await addTransaction({
      accountId: investAccountId,
      type: "contribution",
      amount: surplus,
      category: null,
      note: "Aportación inicial estimada",
      date: thisMonthDay(3),
    });
  }

  // Record any milestones already earned by the starting position (first
  // contribution, invested thresholds, etc.) so the panel reflects them.
  await evaluateAndRecord();

  revalidatePath("/");
  revalidatePath("/accounts");
}
