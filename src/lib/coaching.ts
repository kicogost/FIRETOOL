/**
 * Coaching trigger engine — pure logic deciding which module to surface on the
 * dashboard (PRD §10). Module content lives in `@/content/coaching`; this file
 * only maps the user's current situation to a module slug by priority.
 */

export type CoachingSlug =
  | "fire-basics"
  | "emergency-fund"
  | "dollar-cost-averaging"
  | "index-funds"
  | "sinking-funds"
  | "savings-rate";

/** Signals the triggers are evaluated against. */
export interface CoachingContext {
  monthsRunway: number;
  daysSinceLastContribution: number | null; // null = never contributed
  hasFirstContribution: boolean;
  hasExpenseAnomaly: boolean; // an expense > 2x its category average
  savingsRate3mo: number;
}

/**
 * Ordered rules — first match wins for the dashboard card. Safety first
 * (emergency fund), then the highest-leverage behaviour nudges. `fire-basics`
 * is the always-available fallback shown first post-onboarding.
 */
const RULES: { slug: CoachingSlug; when: (c: CoachingContext) => boolean }[] = [
  { slug: "emergency-fund", when: (c) => c.monthsRunway < 3 },
  { slug: "savings-rate", when: (c) => c.savingsRate3mo < 0.2 },
  {
    slug: "dollar-cost-averaging",
    when: (c) => c.daysSinceLastContribution === null || c.daysSinceLastContribution > 45,
  },
  { slug: "sinking-funds", when: (c) => c.hasExpenseAnomaly },
  { slug: "index-funds", when: (c) => c.hasFirstContribution },
];

/** The single module to feature on the dashboard right now. */
export function pickCoachingModule(c: CoachingContext): CoachingSlug {
  for (const rule of RULES) {
    if (rule.when(c)) return rule.slug;
  }
  return "fire-basics";
}

/** All modules that currently apply, highest priority first (basics always last). */
export function applicableModules(c: CoachingContext): CoachingSlug[] {
  const slugs = RULES.filter((r) => r.when(c)).map((r) => r.slug);
  slugs.push("fire-basics");
  return [...new Set(slugs)];
}
