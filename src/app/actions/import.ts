"use server";

import { revalidatePath } from "next/cache";
import { parseTransactionsCsv, type ParseError } from "@/lib/csv";
import { getAccountsList, addTransaction } from "@/db/mutations";
import { evaluateAndRecord } from "@/db/gamification";

export interface ImportResult {
  imported: number;
  errors: ParseError[];
  unknownAccounts: string[];
}

/**
 * Bulk-import transactions from CSV text. Rows reference accounts by name; an
 * unknown name is reported (not silently dropped). Imported movements adjust the
 * referenced account's balance, exactly like manual entry.
 */
export async function importTransactionsCsv(text: string): Promise<ImportResult> {
  const { rows, errors } = parseTransactionsCsv(text);

  const accounts = await getAccountsList();
  const byName = new Map(accounts.map((a) => [a.name.toLowerCase(), a.id]));

  const unknownAccounts = new Set<string>();
  let imported = 0;

  for (const row of rows) {
    const accountId = byName.get(row.accountName.toLowerCase());
    if (!accountId) {
      unknownAccounts.add(row.accountName);
      continue;
    }
    await addTransaction({
      accountId,
      type: row.type,
      amount: row.amount,
      category: row.category,
      note: row.note,
      date: row.date,
    });
    imported++;
  }

  if (imported > 0) {
    await evaluateAndRecord();
    revalidatePath("/");
    revalidatePath("/accounts");
  }

  return { imported, errors, unknownAccounts: [...unknownAccounts] };
}
