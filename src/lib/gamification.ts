/**
 * Gamification engine — pure logic for streaks and milestones (PRD §9).
 *
 * Principles: reward behaviour (saving, investing, consistency), never punish.
 * No dark patterns, no fake urgency. This module decides WHICH milestones are
 * currently satisfied and computes streaks; persistence (which are *new*) lives
 * in the data layer.
 */

export interface MilestoneDef {
  key: string;
  /** Short celebratory title (Spanish). */
  title: string;
  /** One-line description (Spanish). */
  description: string;
}

/** State the milestone rules are evaluated against. */
export interface GamificationState {
  investedNetWorth: number;
  progress: number; // 0..1+ (invested / fireNumber)
  savingsRate: number; // this month
  monthsRunway: number;
  isCoastFire: boolean;
  currentStreak: number;
  hasAnyContribution: boolean;
}

const INVESTED_THRESHOLDS = [1_000, 10_000, 25_000, 50_000, 100_000];
const SAVINGS_THRESHOLDS = [0.3, 0.4, 0.5];
const STREAK_THRESHOLDS = [3, 6, 12];

export function investedKey(n: number): string {
  return `invested_${n}`;
}
export function progressKey(decile: number): string {
  return `progress_${decile}`; // decile in 10,20,...,100
}
export function savingsKey(pctInt: number): string {
  return `savings_${pctInt}`; // 30,40,50
}
export function streakKey(n: number): string {
  return `streak_${n}`;
}

/** Human label + description for a milestone key (Spanish). */
export function describeMilestone(key: string): MilestoneDef {
  if (key === "first_contribution")
    return { key, title: "Primera aportación", description: "Has hecho tu primera inversión. ¡Has empezado!" };
  if (key === "coast_fire")
    return { key, title: "¡Coast FIRE alcanzado!", description: "Aunque no invirtieras más, llegarías a tu meta." };
  if (key === "runway_6")
    return { key, title: "Colchón de 6 meses", description: "Tienes un fondo de emergencia sólido." };

  if (key.startsWith("invested_")) {
    const n = Number(key.slice("invested_".length));
    return {
      key,
      title: `${n.toLocaleString("es-ES")} € invertidos`,
      description: `Has superado los ${n.toLocaleString("es-ES")} € invertidos.`,
    };
  }
  if (key.startsWith("progress_")) {
    const d = Number(key.slice("progress_".length));
    return { key, title: `${d}% de tu meta FIRE`, description: `Ya has recorrido el ${d}% del camino.` };
  }
  if (key.startsWith("savings_")) {
    const p = Number(key.slice("savings_".length));
    return { key, title: `Tasa de ahorro > ${p}%`, description: `Este mes ahorras más del ${p}% de tus ingresos.` };
  }
  if (key.startsWith("streak_")) {
    const n = Number(key.slice("streak_".length));
    return { key, title: `${n} meses seguidos`, description: `Llevas ${n} meses seguidos invirtiendo.` };
  }
  return { key, title: "Logro", description: "" };
}

/** All milestone keys currently satisfied by the given state. */
export function satisfiedMilestones(s: GamificationState): string[] {
  const keys: string[] = [];

  if (s.hasAnyContribution) keys.push("first_contribution");

  for (const t of INVESTED_THRESHOLDS) {
    if (s.investedNetWorth >= t) keys.push(investedKey(t));
  }

  // Every 10% of FIRE progress (10..100).
  const deciles = Math.min(10, Math.floor(s.progress * 10));
  for (let d = 1; d <= deciles; d++) keys.push(progressKey(d * 10));

  if (s.isCoastFire) keys.push("coast_fire");

  for (const t of STREAK_THRESHOLDS) {
    if (s.currentStreak >= t) keys.push(streakKey(t));
  }

  for (const t of SAVINGS_THRESHOLDS) {
    if (s.savingsRate >= t) keys.push(savingsKey(Math.round(t * 100)));
  }

  if (s.monthsRunway >= 6) keys.push("runway_6");

  return keys;
}

const ymToIndex = (ym: string): number => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};

/**
 * Streak = consecutive months with at least one contribution (PRD §9).
 * `current` counts back from the current month, allowing the current month to be
 * empty so far (grace), as long as the previous month qualified.
 */
export function computeStreak(
  contributionMonths: Iterable<string>,
  nowMonth: string,
): { current: number; best: number } {
  const set = new Set<number>();
  for (const ym of contributionMonths) set.add(ymToIndex(ym));
  if (set.size === 0) return { current: 0, best: 0 };

  // Best: longest consecutive run.
  const sorted = [...set].sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  // Current: from this month (or last month if this month is empty), walk back.
  const nowIdx = ymToIndex(nowMonth);
  let startIdx: number | null = null;
  if (set.has(nowIdx)) startIdx = nowIdx;
  else if (set.has(nowIdx - 1)) startIdx = nowIdx - 1;

  let current = 0;
  if (startIdx !== null) {
    let idx = startIdx;
    while (set.has(idx)) {
      current++;
      idx--;
    }
  }

  return { current, best: Math.max(best, current) };
}
