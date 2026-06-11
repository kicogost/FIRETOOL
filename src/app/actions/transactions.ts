"use server";

import { revalidatePath } from "next/cache";
import { addTransaction } from "@/db/mutations";
import { getDashboardData } from "@/db/queries";
import { evaluateAndRecord } from "@/db/gamification";
import type { MilestoneDef } from "@/lib/gamification";

type TxType = "income" | "expense" | "contribution" | "withdrawal";
const TYPES: TxType[] = ["income", "expense", "contribution", "withdrawal"];

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export interface CelebrationPayload {
  newMilestones: MilestoneDef[];
  /** Days the projected FIRE date moved earlier (positive = sooner). */
  fireDateDaysEarlier: number | null;
  /** True when this movement turned a "not on track" projection into a date. */
  becameOnTrack: boolean;
  rewardStyle: "quiet" | "loud";
  streak: { current: number; best: number };
}

export async function addTransactionAction(formData: FormData): Promise<CelebrationPayload> {
  const accountId = String(formData.get("accountId") ?? "");
  const type = String(formData.get("type") ?? "") as TxType;
  const amount = Number(formData.get("amount"));
  const category = (formData.get("category") as string)?.trim() || null;
  const note = (formData.get("note") as string)?.trim() || null;
  const date = String(formData.get("date") ?? "") || new Date().toISOString().slice(0, 10);

  if (!accountId) throw new Error("Selecciona una cuenta.");
  if (!TYPES.includes(type)) throw new Error("Tipo de movimiento no válido.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Importe no válido.");

  // Capture the projected FIRE date before, to show how far this moves it.
  const before = await getDashboardData();
  const beforeDate = before?.projection.date ?? null;

  await addTransaction({ accountId, type, amount, category, note, date });

  const { newMilestones, streak } = await evaluateAndRecord();

  const after = await getDashboardData();
  const afterDate = after?.projection.date ?? null;
  const fireDateDaysEarlier =
    beforeDate && afterDate
      ? Math.round((beforeDate.getTime() - afterDate.getTime()) / MS_PER_DAY)
      : null;
  const becameOnTrack = !before?.projection.onTrack && !!after?.projection.onTrack;

  revalidatePath("/");
  revalidatePath("/accounts");

  return {
    newMilestones,
    fireDateDaysEarlier,
    becameOnTrack,
    rewardStyle: after?.profile.rewardStyle ?? "loud",
    streak,
  };
}
