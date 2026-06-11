/**
 * Data-access layer — reads the single-user data and derives everything the
 * dashboard needs by feeding it through the pure FIRE engine (`@/lib/fire`).
 *
 * Kept deliberately simple: v1 data volumes are tiny, so we fetch rows and
 * aggregate in JS rather than pushing complex SQL. Numeric columns arrive as
 * strings (Postgres numeric) and are parsed to numbers at the boundary.
 */
import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "./index";
import { SINGLE_PROFILE_ID } from "./constants";
import {
  fireNumber,
  progressPct,
  savingsRate,
  netWorth,
  investedNetWorth,
  monthsOfRunway,
  coastFireNumber,
  projectedFireDate,
  type AccountType,
  type ProjectedFireDateResult,
} from "@/lib/fire";
import { computeStreak, describeMilestone, type MilestoneDef } from "@/lib/gamification";
import { pickCoachingModule, type CoachingSlug } from "@/lib/coaching";
import { desc } from "drizzle-orm";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const num = (v: string | null) => (v == null ? 0 : Number(v));
const monthKey = (d: string) => d.slice(0, 7); // YYYY-MM

export interface AccountWithBalance {
  id: string;
  name: string;
  type: AccountType;
  isInvested: boolean;
  balance: number;
}

export async function getProfile() {
  const db = await getDb();
  const [profile] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.id, SINGLE_PROFILE_ID))
    .limit(1);
  return profile ?? null;
}

/** Accounts with their most recent snapshot balance. */
export async function getAccountsWithBalance(): Promise<AccountWithBalance[]> {
  const db = await getDb();
  const accounts = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.profileId, SINGLE_PROFILE_ID));
  if (accounts.length === 0) return [];

  const ids = accounts.map((a) => a.id);
  const snaps = await db
    .select()
    .from(schema.snapshots)
    .where(inArray(schema.snapshots.accountId, ids));

  const latest = new Map<string, { date: string; balance: number }>();
  for (const s of snaps) {
    const cur = latest.get(s.accountId);
    if (!cur || s.date > cur.date) {
      latest.set(s.accountId, { date: s.date, balance: num(s.balance) });
    }
  }

  return accounts.map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type as AccountType,
    isInvested: a.isInvested,
    balance: latest.get(a.id)?.balance ?? 0,
  }));
}

export interface NetWorthPoint {
  month: string; // YYYY-MM
  netWorth: number;
}

/** Monthly net-worth series from snapshots (debt subtracts), for the chart. */
async function getNetWorthSeries(): Promise<NetWorthPoint[]> {
  const db = await getDb();
  const accounts = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.profileId, SINGLE_PROFILE_ID));
  if (accounts.length === 0) return [];

  const ids = accounts.map((a) => a.id);
  const typeById = new Map(accounts.map((a) => [a.id, a.type as AccountType]));
  const snaps = await db
    .select()
    .from(schema.snapshots)
    .where(inArray(schema.snapshots.accountId, ids));

  // All distinct months, ascending.
  const months = [...new Set(snaps.map((s) => monthKey(s.date)))].sort();

  return months.map((month) => {
    // Latest snapshot per account on or before this month.
    const balances: { balance: number; type: AccountType }[] = [];
    for (const id of ids) {
      const upTo = snaps
        .filter((s) => s.accountId === id && monthKey(s.date) <= month)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      if (upTo[0]) balances.push({ balance: num(upTo[0].balance), type: typeById.get(id)! });
    }
    return { month, netWorth: netWorth(balances) };
  });
}

export interface SpendCategory {
  category: string;
  amount: number;
  fastestGrowing: boolean;
}

export interface DashboardData {
  profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>;
  accounts: AccountWithBalance[];
  netWorthValue: number;
  investedNetWorthValue: number;
  fireNumberValue: number;
  progress: number;
  thisMonth: { income: number; expenses: number; contributions: number; savingsRate: number };
  savingsRateTarget: number;
  projection: ProjectedFireDateResult;
  netWorthSeries: NetWorthPoint[];
  spendBreakdown: SpendCategory[];
  monthsRunway: number;
  coastFireValue: number;
  isCoastFire: boolean;
  streak: { current: number; best: number };
  latestMilestone: MilestoneDef | null;
  coachingSlug: CoachingSlug;
}

const SAVINGS_RATE_TARGET = 0.3; // 30% — surfaced as the dashboard target.
const RETIREMENT_AGE = 65;

export async function getDashboardData(): Promise<DashboardData | null> {
  const profile = await getProfile();
  if (!profile) return null;

  const db = await getDb();
  const accounts = await getAccountsWithBalance();
  const txns = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.profileId, SINGLE_PROFILE_ID));

  const now = new Date();
  const curMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const prevMonth = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}`;

  const inMonth = (m: string) => txns.filter((t) => monthKey(t.date) === m);
  const sumBy = (rows: typeof txns, type: string) =>
    rows.filter((t) => t.type === type).reduce((s, t) => s + num(t.amount), 0);

  const curTxns = inMonth(curMonth);
  const income = sumBy(curTxns, "income");
  const expenses = sumBy(curTxns, "expense");
  const contributions = sumBy(curTxns, "contribution");

  // Trailing 3-month averages drive the projection and runway (PRD §6). Divide
  // by the number of months that actually have data (min 1), not a hard 3, so a
  // brand-new user with one month isn't understated ~3× — this keeps the
  // dashboard projection consistent with the onboarding "punto de partida".
  const last3Months = [0, 1, 2].map((i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  const monthsWithData = Math.max(1, last3Months.filter((m) => inMonth(m).length > 0).length);
  const avgContribution =
    last3Months.reduce((s, m) => s + sumBy(inMonth(m), "contribution"), 0) / monthsWithData;

  const investedValue = investedNetWorth(accounts);
  const netWorthValue = netWorth(accounts);
  const annualRetirementSpend = num(profile.retirementMonthlySpend) * 12;
  const fireNumberValue = fireNumber(annualRetirementSpend, num(profile.swr));
  const expectedReturn = num(profile.expectedReturn);

  const projection = projectedFireDate({
    investedAssets: investedValue,
    monthlyContribution: avgContribution,
    fireNumber: fireNumberValue,
    expectedAnnualReturn: expectedReturn,
    from: now,
  });

  // Spend breakdown: top 5 expense categories this month + fastest growing.
  const byCategory = (rows: typeof txns) => {
    const map = new Map<string, number>();
    for (const t of rows.filter((t) => t.type === "expense")) {
      const key = t.category ?? "Otros gastos";
      map.set(key, (map.get(key) ?? 0) + num(t.amount));
    }
    return map;
  };
  const curCats = byCategory(curTxns);
  const prevCats = byCategory(inMonth(prevMonth));

  let fastest: string | null = null;
  let fastestRatio = 1;
  for (const [cat, amt] of curCats) {
    const prev = prevCats.get(cat) ?? 0;
    const ratio = prev > 0 ? amt / prev : amt > 0 ? Infinity : 0;
    if (ratio > fastestRatio) {
      fastestRatio = ratio;
      fastest = cat;
    }
  }

  const spendBreakdown: SpendCategory[] = [...curCats.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount, fastestGrowing: category === fastest }));

  const liquidCash = accounts
    .filter((a) => a.type === "cash")
    .reduce((s, a) => s + a.balance, 0);
  const avgMonthlyExpenses =
    last3Months.reduce((s, m) => s + sumBy(inMonth(m), "expense"), 0) / monthsWithData;

  const coastFireValue = coastFireNumber({
    fireNumber: fireNumberValue,
    expectedReturn,
    yearsToRetirement: Math.max(0, RETIREMENT_AGE - profile.age),
  });

  // Streak: consecutive months with at least one contribution (live-computed).
  const contributionMonths = new Set(
    txns.filter((t) => t.type === "contribution").map((t) => monthKey(t.date)),
  );
  const streak = computeStreak(contributionMonths, curMonth);

  // Most recently achieved badge.
  const [latest] = await db
    .select()
    .from(schema.milestones)
    .where(eq(schema.milestones.profileId, SINGLE_PROFILE_ID))
    .orderBy(desc(schema.milestones.achievedAt))
    .limit(1);
  const latestMilestone = latest ? describeMilestone(latest.key) : null;

  // --- Coaching context (PRD §10 triggers) ---------------------------------
  const contributionDates = txns
    .filter((t) => t.type === "contribution")
    .map((t) => t.date)
    .sort();
  const lastContribution = contributionDates.at(-1) ?? null;
  const daysSinceLastContribution = lastContribution
    ? Math.floor((now.getTime() - Date.parse(lastContribution)) / MS_PER_DAY)
    : null;

  const income3 = last3Months.reduce((s, m) => s + sumBy(inMonth(m), "income"), 0);
  const expense3 = last3Months.reduce((s, m) => s + sumBy(inMonth(m), "expense"), 0);
  const savingsRate3mo = savingsRate(income3, expense3);

  // Expense anomaly: a current-month category more than 2× its prior-3-month avg.
  const priorMonths = [1, 2, 3].map((i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  let hasExpenseAnomaly = false;
  for (const [cat, amt] of curCats) {
    const priorTotal = priorMonths.reduce((s, m) => s + (byCategory(inMonth(m)).get(cat) ?? 0), 0);
    const priorAvg = priorTotal / priorMonths.length;
    if (priorAvg > 0 && amt > 2 * priorAvg) {
      hasExpenseAnomaly = true;
      break;
    }
  }

  const coachingSlug = pickCoachingModule({
    monthsRunway: monthsOfRunway(liquidCash, avgMonthlyExpenses),
    daysSinceLastContribution,
    hasFirstContribution: contributionMonths.size > 0,
    hasExpenseAnomaly,
    savingsRate3mo,
  });

  return {
    profile,
    accounts,
    netWorthValue,
    investedNetWorthValue: investedValue,
    fireNumberValue,
    progress: progressPct(investedValue, fireNumberValue),
    thisMonth: { income, expenses, contributions, savingsRate: savingsRate(income, expenses) },
    savingsRateTarget: SAVINGS_RATE_TARGET,
    projection,
    netWorthSeries: await getNetWorthSeries(),
    spendBreakdown,
    monthsRunway: monthsOfRunway(liquidCash, avgMonthlyExpenses),
    coastFireValue,
    isCoastFire: investedValue >= coastFireValue,
    streak,
    latestMilestone,
    coachingSlug,
  };
}
