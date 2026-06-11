/**
 * Write-side data access. Transactions adjust the affected account's current
 * snapshot (PRD §7: "Transactions update the current snapshot of their
 * account"), so net worth and FIRE progress move the moment something is logged.
 */
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "./index";
import { SINGLE_PROFILE_ID } from "./constants";
import type { AccountType } from "@/lib/fire";

type TxType = "income" | "expense" | "contribution" | "withdrawal";

function firstOfThisMonth(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
}

function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Sign of a transaction's effect on the account balance. */
function delta(type: TxType, amount: number): number {
  return type === "income" || type === "contribution" ? amount : -amount;
}

export async function updateProfile(input: {
  name: string;
  age: number;
  retirementMonthlySpend: number;
  fireVariant: "full" | "lean" | "coast" | "barista";
  rewardStyle: "quiet" | "loud";
}): Promise<void> {
  const db = await getDb();
  await db
    .update(schema.profiles)
    .set({
      name: input.name,
      age: input.age,
      retirementMonthlySpend: input.retirementMonthlySpend.toFixed(2),
      fireVariant: input.fireVariant,
      rewardStyle: input.rewardStyle,
    })
    .where(eq(schema.profiles.id, SINGLE_PROFILE_ID));
}

export async function getCategories() {
  const db = await getDb();
  return db.select().from(schema.categories).orderBy(schema.categories.name);
}

export async function getAccountsList() {
  const db = await getDb();
  return db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.profileId, SINGLE_PROFILE_ID))
    .orderBy(schema.accounts.name);
}

export async function addTransaction(
  input: {
    accountId: string;
    type: TxType;
    amount: number;
    category: string | null;
    note: string | null;
    date: string; // YYYY-MM-DD
  },
  opts: { adjustSnapshot?: boolean } = {},
): Promise<void> {
  const db = await getDb();
  const adjustSnapshot = opts.adjustSnapshot ?? true;

  await db.insert(schema.transactions).values({
    profileId: SINGLE_PROFILE_ID,
    accountId: input.accountId,
    type: input.type,
    amount: input.amount.toFixed(2),
    category: input.category,
    note: input.note,
    date: input.date,
  });

  // Onboarding records rough income/expenses for the savings-rate calc without
  // moving balances (the stated net worth is already the current truth).
  if (!adjustSnapshot) return;

  // Roll the change into the account's current snapshot.
  const [account] = await db
    .select({ type: schema.accounts.type })
    .from(schema.accounts)
    .where(eq(schema.accounts.id, input.accountId))
    .limit(1);

  const snaps = await db
    .select()
    .from(schema.snapshots)
    .where(eq(schema.snapshots.accountId, input.accountId));

  const latest = snaps.sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  const month = firstOfThisMonth();
  // Debt balances are stored positive and subtracted from net worth, so the
  // sign is inverted: money toward a debt (income/contribution) lowers what you
  // owe → net worth up; charging it (expense/withdrawal) raises what you owe.
  const isDebt = account?.type === "debt";
  const d = (isDebt ? -1 : 1) * delta(input.type, input.amount);

  if (latest && latest.date >= month) {
    // A snapshot already exists this month — adjust it in place.
    await db
      .update(schema.snapshots)
      .set({ balance: (Number(latest.balance) + d).toFixed(2) })
      .where(eq(schema.snapshots.id, latest.id));
  } else {
    // Carry the previous balance forward into a new current-month snapshot.
    const base = latest ? Number(latest.balance) : 0;
    await db.insert(schema.snapshots).values({
      accountId: input.accountId,
      balance: (base + d).toFixed(2),
      date: month,
    });
  }
}

export async function createAccount(input: {
  name: string;
  type: AccountType;
  isInvested: boolean;
  initialBalance: number;
}): Promise<string> {
  const db = await getDb();
  const [account] = await db
    .insert(schema.accounts)
    .values({
      profileId: SINGLE_PROFILE_ID,
      name: input.name,
      type: input.type,
      isInvested: input.isInvested,
    })
    .returning();

  await db.insert(schema.snapshots).values({
    accountId: account.id,
    balance: input.initialBalance.toFixed(2),
    date: todayYmd(),
  });

  return account.id;
}

export async function deleteAccount(accountId: string): Promise<void> {
  const db = await getDb();
  // Snapshots/transactions cascade on account delete (FK onDelete: cascade).
  await db.delete(schema.accounts).where(eq(schema.accounts.id, accountId));
}

/** Wipe all single-user data — used by onboarding (Phase 3) to start fresh. */
export async function resetProfileData(): Promise<void> {
  const db = await getDb();
  const accounts = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(eq(schema.accounts.profileId, SINGLE_PROFILE_ID));
  const ids = accounts.map((a) => a.id);
  if (ids.length) {
    await db.delete(schema.snapshots).where(inArray(schema.snapshots.accountId, ids));
  }
  await db.delete(schema.transactions).where(eq(schema.transactions.profileId, SINGLE_PROFILE_ID));
  await db.delete(schema.accounts).where(eq(schema.accounts.profileId, SINGLE_PROFILE_ID));
  // Also clear earned badges and the streak, so a re-onboarded profile starts
  // clean rather than inheriting stale milestones / best streak.
  await db.delete(schema.milestones).where(eq(schema.milestones.profileId, SINGLE_PROFILE_ID));
  await db.delete(schema.streaks).where(eq(schema.streaks.profileId, SINGLE_PROFILE_ID));
}
