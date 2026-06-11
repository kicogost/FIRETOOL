"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "@/db/mutations";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export async function updateSettingsAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim() || "Yo";
  const age = clamp(Number(formData.get("age")) || 30, 16, 99);
  const retirementMonthlySpend = Math.max(0, Number(formData.get("retirementMonthlySpend")) || 0);
  // SWR & return arrive as percentages from the form.
  const swr = clamp((Number(formData.get("swrPct")) || 4) / 100, 0.03, 0.05);
  const expectedReturn = clamp((Number(formData.get("returnPct")) || 5) / 100, 0, 0.12);
  const rewardStyle = formData.get("rewardStyle") === "quiet" ? "quiet" : "loud";

  await updateSettings({ name, age, retirementMonthlySpend, swr, expectedReturn, rewardStyle });

  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/ajustes");
}
