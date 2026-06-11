/**
 * Seed — populates a fresh database once, so the app has a live single-user
 * profile with realistic demo data (accounts, 12 months of snapshots, recent
 * transactions). Onboarding (Phase 3) lets the user reset and re-enter this.
 *
 * All user-facing strings are Spanish (target market). Money/dates are stored
 * as Postgres numeric/date, which Drizzle exchanges as strings.
 */
import type { Db } from "./index";
import * as schema from "./schema";
import { SINGLE_PROFILE_ID } from "./constants";
import type { AccountType } from "@/lib/fire";

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** First day of the month, `monthsAgo` months before now. */
function monthStart(monthsAgo: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
}

/** Default expense/income categories (Spanish). */
const CATEGORIES: { name: string; kind: "income" | "expense"; isSinkingFund?: boolean }[] = [
  { name: "Nómina", kind: "income" },
  { name: "Freelance", kind: "income" },
  { name: "Otros ingresos", kind: "income" },
  { name: "Vivienda", kind: "expense" },
  { name: "Alimentación", kind: "expense" },
  { name: "Transporte", kind: "expense" },
  { name: "Ocio", kind: "expense" },
  { name: "Suscripciones", kind: "expense" },
  { name: "Salud", kind: "expense" },
  { name: "Vacaciones", kind: "expense", isSinkingFund: true },
  { name: "Otros gastos", kind: "expense" },
];

const ACCOUNTS: {
  name: string;
  type: AccountType;
  isInvested: boolean;
  start: number; // balance 12 months ago
  end: number; // balance now
}[] = [
  { name: "Cuenta corriente", type: "cash", isInvested: false, start: 9_000, end: 12_000 },
  { name: "Broker indexado", type: "brokerage", isInvested: true, start: 68_000, end: 85_000 },
  { name: "Plan de pensiones", type: "pension", isInvested: true, start: 15_000, end: 18_000 },
  { name: "Hipoteca", type: "debt", isInvested: false, start: 43_000, end: 40_000 },
];

const MONTHS = 12;

export async function seedIfEmpty(db: Db): Promise<void> {
  const existing = await db.select().from(schema.profiles).limit(1);
  if (existing.length > 0) return;

  await db.insert(schema.profiles).values({
    id: SINGLE_PROFILE_ID,
    name: "Demo",
    age: 32,
    currency: "EUR",
    swr: "0.04",
    expectedReturn: "0.05",
    retirementMonthlySpend: "2000",
    fireVariant: "full",
    rewardStyle: "loud",
  });

  await db.insert(schema.categories).values(
    CATEGORIES.map((c) => ({
      name: c.name,
      kind: c.kind,
      isSinkingFund: c.isSinkingFund ?? false,
    })),
  );

  for (const a of ACCOUNTS) {
    const [account] = await db
      .insert(schema.accounts)
      .values({
        profileId: SINGLE_PROFILE_ID,
        name: a.name,
        type: a.type,
        isInvested: a.isInvested,
      })
      .returning();

    // One snapshot per month for the last 12 months, linearly interpolated.
    const snaps = [];
    for (let i = MONTHS; i >= 0; i--) {
      const t = (MONTHS - i) / MONTHS;
      const balance = a.start + (a.end - a.start) * t;
      snaps.push({
        accountId: account.id,
        balance: balance.toFixed(2),
        date: ymd(monthStart(i)),
      });
    }
    await db.insert(schema.snapshots).values(snaps);
  }

  // Recent transactions: last 3 months of income, expenses, contributions.
  const txns = [];
  for (let i = 2; i >= 0; i--) {
    const m = monthStart(i);
    const d = (day: number) => ymd(new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), day)));
    txns.push(
      { type: "income" as const, amount: "3200", category: "Nómina", date: d(1) },
      { type: "expense" as const, amount: "850", category: "Vivienda", date: d(3) },
      { type: "expense" as const, amount: "420", category: "Alimentación", date: d(8) },
      { type: "expense" as const, amount: "180", category: "Transporte", date: d(10) },
      { type: "expense" as const, amount: "150", category: "Ocio", date: d(15) },
      { type: "expense" as const, amount: "60", category: "Suscripciones", date: d(16) },
      { type: "contribution" as const, amount: "600", category: null, date: d(5) },
    );
  }

  const cash = await db.select().from(schema.accounts).limit(1);
  const cashId = cash[0].id;
  await db.insert(schema.transactions).values(
    txns.map((t) => ({
      profileId: SINGLE_PROFILE_ID,
      accountId: cashId,
      type: t.type,
      amount: t.amount,
      category: t.category ?? null,
      date: t.date,
    })),
  );
}
