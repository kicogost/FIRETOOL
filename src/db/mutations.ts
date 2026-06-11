/**
 * Write-side data access. Transactions adjust the affected account's current
 * snapshot (PRD §7: "Transactions update the current snapshot of their
 * account"), so net worth and FIRE progress move the moment something is logged.
 */
import { and, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "./index";
import { currentProfileId } from "./profile";
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
  const profileId = await currentProfileId();
  const values = {
    name: input.name,
    age: input.age,
    retirementMonthlySpend: input.retirementMonthlySpend.toFixed(2),
    fireVariant: input.fireVariant,
    rewardStyle: input.rewardStyle,
  };
  // Upsert: a brand-new authenticated user has no profile row yet, so onboarding
  // must create it (keyed to their user id) rather than update nothing.
  await db
    .insert(schema.profiles)
    .values({ id: profileId, ...values })
    .onConflictDoUpdate({ target: schema.profiles.id, set: values });
}

/** Update the FIRE assumptions / profile from the settings page. */
export async function updateSettings(input: {
  name: string;
  age: number;
  retirementMonthlySpend: number;
  swr: number; // decimal, e.g. 0.035
  expectedReturn: number; // decimal
  rewardStyle: "quiet" | "loud";
}): Promise<void> {
  const db = await getDb();
  const profileId = await currentProfileId();
  await db
    .update(schema.profiles)
    .set({
      name: input.name,
      age: input.age,
      retirementMonthlySpend: input.retirementMonthlySpend.toFixed(2),
      swr: input.swr.toFixed(4),
      expectedReturn: input.expectedReturn.toFixed(4),
      rewardStyle: input.rewardStyle,
    })
    .where(eq(schema.profiles.id, profileId));
}

export async function getCategories() {
  const db = await getDb();
  return db.select().from(schema.categories).orderBy(schema.categories.name);
}

export async function getAccountsList() {
  const db = await getDb();
  const profileId = await currentProfileId();
  return db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.profileId, profileId))
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
  const profileId = await currentProfileId();
  const adjustSnapshot = opts.adjustSnapshot ?? true;

  // Verify the target account belongs to the current profile before writing,
  // so a forged accountId can't attach to or mutate another user's account.
  const [account] = await db
    .select({ type: schema.accounts.type })
    .from(schema.accounts)
    .where(and(eq(schema.accounts.id, input.accountId), eq(schema.accounts.profileId, profileId)))
    .limit(1);
  if (!account) throw new Error("Cuenta no encontrada.");

  await db.insert(schema.transactions).values({
    profileId,
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
  const profileId = await currentProfileId();
  const [account] = await db
    .insert(schema.accounts)
    .values({
      profileId,
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

/**
 * Set an account's CURRENT balance to an absolute value (monthly update). Unlike
 * a transaction (a delta), this captures market moves + contributions in one go.
 * Updates this month's snapshot in place, or creates it. Owner-scoped.
 */
export async function setAccountBalance(accountId: string, balance: number): Promise<void> {
  const db = await getDb();
  const profileId = await currentProfileId();
  const [account] = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(and(eq(schema.accounts.id, accountId), eq(schema.accounts.profileId, profileId)))
    .limit(1);
  if (!account) throw new Error("Cuenta no encontrada.");

  const month = firstOfThisMonth();
  const snaps = await db
    .select()
    .from(schema.snapshots)
    .where(eq(schema.snapshots.accountId, accountId));
  const latest = snaps.sort((a, b) => (a.date < b.date ? 1 : -1))[0];

  if (latest && latest.date >= month) {
    await db
      .update(schema.snapshots)
      .set({ balance: balance.toFixed(2) })
      .where(eq(schema.snapshots.id, latest.id));
  } else {
    await db.insert(schema.snapshots).values({
      accountId,
      balance: balance.toFixed(2),
      date: month,
    });
  }
}

/**
 * Monthly check-in: set every account's current balance, and optionally record
 * this month's contribution (for the streak/projection) WITHOUT re-moving the
 * balance you just set.
 */
export async function applyMonthlyUpdate(input: {
  balances: { accountId: string; balance: number }[];
  contribution?: { accountId: string; amount: number } | null;
}): Promise<void> {
  for (const b of input.balances) {
    await setAccountBalance(b.accountId, b.balance);
  }
  if (input.contribution && input.contribution.amount > 0) {
    await addTransaction(
      {
        accountId: input.contribution.accountId,
        type: "contribution",
        amount: input.contribution.amount,
        category: null,
        note: "Aportación del mes",
        date: todayYmd(),
      },
      { adjustSnapshot: false },
    );
  }
}

export async function deleteAccount(accountId: string): Promise<void> {
  const db = await getDb();
  const profileId = await currentProfileId();
  // Scope by owner so one user can't delete another's account by id guessing.
  // Snapshots/transactions cascade on account delete (FK onDelete: cascade).
  await db
    .delete(schema.accounts)
    .where(and(eq(schema.accounts.id, accountId), eq(schema.accounts.profileId, profileId)));
}

/** Wipe the current profile's data — used by onboarding to start fresh. */
export async function resetProfileData(): Promise<void> {
  const db = await getDb();
  const profileId = await currentProfileId();
  const accounts = await db
    .select({ id: schema.accounts.id })
    .from(schema.accounts)
    .where(eq(schema.accounts.profileId, profileId));
  const ids = accounts.map((a) => a.id);
  if (ids.length) {
    await db.delete(schema.snapshots).where(inArray(schema.snapshots.accountId, ids));
  }
  await db.delete(schema.transactions).where(eq(schema.transactions.profileId, profileId));
  await db.delete(schema.accounts).where(eq(schema.accounts.profileId, profileId));
  // Also clear earned badges and the streak, so a re-onboarded profile starts
  // clean rather than inheriting stale milestones / best streak.
  await db.delete(schema.milestones).where(eq(schema.milestones.profileId, profileId));
  await db.delete(schema.streaks).where(eq(schema.streaks.profileId, profileId));
}
