"use server";

import { revalidatePath } from "next/cache";
import { createAccount, deleteAccount } from "@/db/mutations";
import type { AccountType } from "@/lib/fire";

const ACCOUNT_TYPES: AccountType[] = [
  "cash",
  "brokerage",
  "pension",
  "crypto",
  "property",
  "debt",
];

export async function createAccountAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as AccountType;
  const isInvested = formData.get("isInvested") === "on";
  const initialBalance = Number(formData.get("initialBalance"));

  if (!name) throw new Error("El nombre es obligatorio.");
  if (!ACCOUNT_TYPES.includes(type)) throw new Error("Tipo de cuenta no válido.");
  if (!Number.isFinite(initialBalance) || initialBalance < 0)
    throw new Error("Saldo inicial no válido.");

  await createAccount({ name, type, isInvested, initialBalance });

  revalidatePath("/");
  revalidatePath("/accounts");
}

export async function deleteAccountAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Cuenta no encontrada.");
  await deleteAccount(id);
  revalidatePath("/");
  revalidatePath("/accounts");
}
