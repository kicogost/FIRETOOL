/**
 * FIRE engine — pure, deterministic financial-independence calculations.
 *
 * No UI, no DB, no I/O. Every function is referentially transparent so it can be
 * fully unit-tested and trusted as the foundation of the product. See PRD §6.
 *
 * All money is in EUR (numbers); no currency conversion happens here.
 */

/** Account types, mirrored from the Drizzle schema (`accounts.type`). */
export type AccountType =
  | "cash"
  | "brokerage"
  | "pension"
  | "crypto"
  | "property"
  | "debt";

/** Safe withdrawal rate bounds (PRD §6: adjustable between 3% and 5%). */
export const MIN_SWR = 0.03;
export const MAX_SWR = 0.05;
export const DEFAULT_SWR = 0.04;
export const DEFAULT_EXPECTED_RETURN = 0.05;

/** Hard cap on the projection loop so an unreachable target never loops forever. */
export const MAX_PROJECTION_MONTHS = 1200; // 100 years

/** Clamp the safe withdrawal rate into the allowed [3%, 5%] range. */
export function clampSwr(swr: number): number {
  if (swr < MIN_SWR) return MIN_SWR;
  if (swr > MAX_SWR) return MAX_SWR;
  return swr;
}

/**
 * FIRE number = annual retirement spending / SWR.
 * At the default 4% SWR this is the classic ×25 rule.
 */
export function fireNumber(
  annualRetirementSpend: number,
  swr: number = DEFAULT_SWR,
): number {
  return annualRetirementSpend / clampSwr(swr);
}

/**
 * Savings rate = (income - expenses) / income, for a period.
 * Returns 0 when income is non-positive (avoid divide-by-zero); may be negative
 * when expenses exceed income.
 */
export function savingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return (income - expenses) / income;
}

/**
 * Progress toward FIRE = invested net worth / FIRE number, floored at 0.
 * Returns 0 when the FIRE number is non-positive.
 */
export function progressPct(
  investedNetWorth: number,
  fireNumberValue: number,
): number {
  if (fireNumberValue <= 0) return 0;
  return Math.max(0, investedNetWorth / fireNumberValue);
}

/**
 * Net worth = sum of latest balances per account, with debt subtracting.
 * Callers pass the latest snapshot balance for each account (PRD §7).
 */
export function netWorth(
  accounts: ReadonlyArray<{ balance: number; type: AccountType }>,
): number {
  return accounts.reduce(
    (total, a) => total + (a.type === "debt" ? -a.balance : a.balance),
    0,
  );
}

/**
 * Invested net worth = sum of balances for accounts that count toward FIRE.
 * This is what `progressPct` and `projectedFireDate` measure against.
 */
export function investedNetWorth(
  accounts: ReadonlyArray<{ balance: number; isInvested: boolean }>,
): number {
  return accounts.reduce(
    (total, a) => total + (a.isInvested ? a.balance : 0),
    0,
  );
}

/**
 * Months of runway = liquid cash / average monthly expenses (emergency fund).
 * Returns Infinity when there are no expenses to burn through.
 */
export function monthsOfRunway(
  liquidCash: number,
  avgMonthlyExpenses: number,
): number {
  if (avgMonthlyExpenses <= 0) return Infinity;
  return liquidCash / avgMonthlyExpenses;
}

/**
 * Coast FIRE number = the amount invested today that, with no further
 * contributions, grows into the FIRE number by traditional retirement age.
 */
export function coastFireNumber({
  fireNumber: fireNumberValue,
  expectedReturn = DEFAULT_EXPECTED_RETURN,
  yearsToRetirement,
}: {
  fireNumber: number;
  expectedReturn?: number;
  yearsToRetirement: number;
}): number {
  return fireNumberValue / (1 + expectedReturn) ** yearsToRetirement;
}

export interface ProjectedFireDateInput {
  /** Current invested assets that compound toward FIRE. */
  investedAssets: number;
  /** Average monthly contribution (PRD: trailing 3 months). */
  monthlyContribution: number;
  /** Target amount to reach (typically the FIRE number). */
  fireNumber: number;
  /** Expected real annual return (default 5%). */
  expectedAnnualReturn?: number;
  /** Date the projection starts from. */
  from: Date;
}

export interface ProjectedFireDateResult {
  /** Projected date FIRE is reached, or null if not reachable within the cap. */
  date: Date | null;
  /** Whole months until FIRE, or null if not on track. */
  monthsToFire: number | null;
  /** False when contributions + growth can't reach the target within the cap. */
  onTrack: boolean;
}

/**
 * Projected FIRE date via month-by-month iteration: each month apply the monthly
 * equivalent of the expected annual return, then add the contribution, until the
 * balance reaches the target.
 *
 * Edge cases (PRD §6):
 *  - already at/above target → 0 months, date = `from`.
 *  - target unreachable (e.g. zero/negative contribution and balance can't grow
 *    to target) → capped at MAX_PROJECTION_MONTHS and returned as
 *    `{ date: null, onTrack: false }` so the UI shows "not on track yet" instead
 *    of infinity.
 */
export function projectedFireDate({
  investedAssets,
  monthlyContribution,
  fireNumber: target,
  expectedAnnualReturn = DEFAULT_EXPECTED_RETURN,
  from,
}: ProjectedFireDateInput): ProjectedFireDateResult {
  if (investedAssets >= target) {
    return { date: new Date(from.getTime()), monthsToFire: 0, onTrack: true };
  }

  const monthlyRate = (1 + expectedAnnualReturn) ** (1 / 12) - 1;
  let balance = investedAssets;

  for (let month = 1; month <= MAX_PROJECTION_MONTHS; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (balance >= target) {
      const date = new Date(from.getTime());
      date.setMonth(date.getMonth() + month);
      return { date, monthsToFire: month, onTrack: true };
    }
  }

  return { date: null, monthsToFire: null, onTrack: false };
}
