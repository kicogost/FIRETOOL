/**
 * Gamification persistence — evaluates the current state, records milestones
 * that are newly achieved (append-only), and keeps the streak row up to date.
 * Returns the freshly-earned milestones so the UI can celebrate them.
 */
import { eq } from "drizzle-orm";
import { getDb, schema } from "./index";
import { SINGLE_PROFILE_ID } from "./constants";
import { getDashboardData } from "./queries";
import {
  satisfiedMilestones,
  computeStreak,
  describeMilestone,
  type MilestoneDef,
  type GamificationState,
} from "@/lib/gamification";

const monthKey = (d: string) => d.slice(0, 7);

export interface GamificationResult {
  newMilestones: MilestoneDef[];
  streak: { current: number; best: number };
}

/**
 * Recompute milestones + streak from current data, persist anything new, and
 * return the newly-earned milestones (for celebration).
 */
export async function evaluateAndRecord(): Promise<GamificationResult> {
  const db = await getDb();
  const data = await getDashboardData();
  if (!data) return { newMilestones: [], streak: { current: 0, best: 0 } };

  const now = new Date();
  const curMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const txns = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.profileId, SINGLE_PROFILE_ID));
  const contributionMonths = new Set(
    txns.filter((t) => t.type === "contribution").map((t) => monthKey(t.date)),
  );
  const streak = computeStreak(contributionMonths, curMonth);

  const state: GamificationState = {
    investedNetWorth: data.investedNetWorthValue,
    progress: data.progress,
    savingsRate: data.thisMonth.savingsRate,
    monthsRunway: data.monthsRunway,
    isCoastFire: data.isCoastFire,
    currentStreak: streak.current,
    hasAnyContribution: contributionMonths.size > 0,
  };

  // Persist streak (one row per profile).
  const [existingStreak] = await db
    .select()
    .from(schema.streaks)
    .where(eq(schema.streaks.profileId, SINGLE_PROFILE_ID))
    .limit(1);
  const lastQualifiedMonth = [...contributionMonths].sort().at(-1) ?? null;
  if (existingStreak) {
    await db
      .update(schema.streaks)
      .set({
        currentCount: streak.current,
        bestCount: Math.max(streak.best, existingStreak.bestCount),
        lastQualifiedMonth,
      })
      .where(eq(schema.streaks.id, existingStreak.id));
  } else {
    await db.insert(schema.streaks).values({
      profileId: SINGLE_PROFILE_ID,
      kind: "monthly_contribution",
      currentCount: streak.current,
      bestCount: streak.best,
      lastQualifiedMonth,
    });
  }

  // Diff satisfied milestones against those already recorded.
  const achieved = await db
    .select({ key: schema.milestones.key })
    .from(schema.milestones)
    .where(eq(schema.milestones.profileId, SINGLE_PROFILE_ID));
  const achievedKeys = new Set(achieved.map((a) => a.key));

  const newKeys = satisfiedMilestones(state).filter((k) => !achievedKeys.has(k));
  if (newKeys.length > 0) {
    await db
      .insert(schema.milestones)
      .values(newKeys.map((key) => ({ profileId: SINGLE_PROFILE_ID, key })));
  }

  return { newMilestones: newKeys.map(describeMilestone), streak };
}
