# PRD: FIRE Tracker (working title)

## 1. Vision

A simple, motivating personal finance app that tracks the user's journey to financial independence (FIRE). It turns saving and investing into a game the user wants to keep playing: every euro saved visibly moves the projected FIRE date closer. It also coaches the user from zero to competent investor through short, contextual lessons.

v1 is built for a single user (the founder). The architecture should anticipate multi-user from day one, but auth and multi-tenancy are explicitly out of scope for v1.

## 2. Target user

- v1: the founder. 28-35, salaried or freelance income in EUR, already saving but without a system, wants clarity on "how close am I to FIRE and what should I do next."
- Later: anyone starting their FIRE journey who finds spreadsheets tedious and existing apps (YNAB, Mint clones) too focused on budgeting and not enough on the long game.

## 3. Core loop (the hook)

1. User logs income, expenses, and investment contributions (manual entry, under 10 seconds per entry).
2. Dashboard instantly updates: savings rate, net worth, progress to FIRE number, projected FIRE date.
3. Positive actions (investing, hitting savings rate target, completing a streak) trigger rewards: milestone celebrations, badges, and most importantly a visible shift in the projected FIRE date.
4. Contextual coaching nudges the user toward better behaviour (e.g. lumpy spending detected, suggest a sinking fund).

The single most important motivational mechanic: **show the projected FIRE date moving earlier when the user invests more.** That cause-and-effect link is the product.

## 4. v1 scope

### In scope

- Onboarding wizard (profile and goals)
- Manual entry of transactions and contributions
- Accounts (cash, brokerage, pension, crypto, real estate equity, debt)
- FIRE engine (all calculations below)
- Dashboard (one main screen)
- Gamification layer (streaks, milestones, badges)
- 6 coaching modules (static content, contextually surfaced)
- Mobile-first responsive web app, installable as PWA

### Out of scope for v1 (do not build)

- Authentication / multi-user
- Bank connections (Plaid, GoCardless, Tink)
- CSV import
- Push notifications
- AI-generated insights
- Multi-currency (store currency as a field, but UI assumes EUR)

## 5. Onboarding wizard

A conversational, one-question-per-screen flow. Answers seed the FIRE engine and decide which coaching modules surface first.

1. What's your name?
2. How old are you?
3. What's your monthly take-home income? (allow "it varies", capture an average)
4. Roughly what do you spend per month? (rough estimate is fine, refined later by real data)
5. What's your current net worth? (guided: cash + investments - debts, one field per account, this creates the initial accounts)
6. Do you currently invest regularly? (Yes monthly / Sometimes / Not yet) -> seeds coaching path
7. What does financial independence mean to you? (Retire fully / Work optional / Coast into part-time) -> sets FIRE variant
8. Target monthly spending in retirement? (defaults to current spending, adjustable)
9. Risk comfort: how would you feel if your investments dropped 30% in a year? (3 options) -> informs coaching tone, NOT financial advice
10. Pick your reward style: (Quiet progress / Celebrate everything) -> gamification intensity setting

Output of onboarding: a complete profile, initial accounts, a FIRE number, and a projected FIRE date shown immediately on a "Your starting point" summary screen. The user should feel the payoff of onboarding within 2 minutes.

## 6. FIRE engine (deterministic calculations)

All formulas live in a pure, well-tested module (`lib/fire.ts`). No UI logic mixed in.

- **FIRE number** = annual retirement spending x 25 (4% safe withdrawal rate; SWR adjustable in settings between 3% and 5%)
- **Progress %** = invested net worth / FIRE number
- **Savings rate** = (income - expenses) / income, per month and trailing 12 months
- **Projected FIRE date**: iterative projection using current invested assets, average monthly contribution (trailing 3 months), and expected real return (default 5% annual, adjustable). Recompute on every new transaction.
- **Coast FIRE number** = FIRE number / (1 + expected return)^(years to traditional retirement age). Show "you are Coast FIRE" prominently if reached.
- **Months of runway** = liquid cash / average monthly expenses (emergency fund indicator)

Edge cases to handle: negative savings rate, zero contributions (projected date shows "not on track yet" instead of infinity), income that varies month to month.

## 7. Data model

```
Profile
  id, name, age, currency (default EUR), swr (default 0.04),
  expected_return (default 0.05), retirement_monthly_spend,
  fire_variant (full | lean | coast | barista),
  reward_style (quiet | loud), created_at

Account
  id, profile_id, name, type (cash | brokerage | pension | crypto |
  property | debt), is_invested (bool, counts toward FIRE number),
  created_at

Snapshot            // monthly balance per account, the net worth backbone
  id, account_id, balance, date

Transaction
  id, profile_id, account_id, type (income | expense | contribution |
  withdrawal), amount, category, note, date, created_at

Category            // seeded defaults, user-extendable
  id, name, kind (income | expense), is_sinking_fund (bool)

Milestone           // achieved gamification events, append-only
  id, profile_id, key (e.g. "first_10k", "streak_3_months",
  "savings_rate_50"), achieved_at

Streak
  id, profile_id, kind (monthly_contribution), current_count,
  best_count, last_qualified_month
```

Net worth at any date = sum of latest snapshots per account (debt accounts negative). Transactions update the current snapshot of their account.

## 8. Dashboard (the one screen)

Top to bottom, mobile-first:

1. **Hero: progress to FIRE.** Big progress bar, current % toward FIRE number, and the projected FIRE date in large type. When the date moves earlier after a contribution, animate it.
2. **This month:** savings rate vs target, income, expenses, invested amount.
3. **Net worth chart:** line chart over time (from snapshots), toggle 6m / 1y / all.
4. **Streak and latest badge.**
5. **Spend breakdown:** top 5 categories this month with a simple flag on the fastest-growing category.
6. **Coaching card:** one contextual module suggestion (see section 10).
7. Floating action button: add transaction (the most common action, max 2 taps away at all times).

## 9. Gamification

Principles: reward behaviour (saving, investing, consistency), never punish. No dark patterns, no fake urgency.

- **Streaks:** consecutive months with at least one investment contribution. Show current and best.
- **Milestones (one-time celebrations):** first contribution, first 1k / 10k / 25k / 50k / 100k invested, every 10% of FIRE progress, Coast FIRE reached, 3 / 6 / 12 month streaks, savings rate above 30% / 40% / 50% in a month, 6 months of emergency runway.
- **Celebration moments:** full-screen confetti + a stat that makes it concrete ("This contribution moved your FIRE date 11 days earlier").
- **Reward style setting** from onboarding controls intensity (quiet = subtle toast, loud = confetti).

## 10. Coaching modules (v1 content)

Six short modules (3-5 minute reads, written in plain language, EUR examples). Stored as markdown, rendered in-app. Each has a trigger condition for when it surfaces on the dashboard.

| Module | Trigger |
|---|---|
| FIRE basics and your number | Always first, post-onboarding |
| Emergency fund before investing | Runway < 3 months |
| Dollar cost averaging | No contribution in last 45 days, or onboarding answer "not yet" |
| Index funds 101 | After first contribution milestone |
| Sinking funds | Any expense > 2x the category's monthly average |
| Savings rate: the only number that matters | Savings rate < 20% trailing 3 months |

Every module ends with one suggested action inside the app. Include a permanent disclaimer: this is financial education, not financial advice.

## 11. Stack and architecture

- **Framework:** Next.js (App Router), TypeScript
- **DB:** Supabase Postgres (Row Level Security on from day one, keyed to a hardcoded single profile in v1, so multi-user later is a config change, not a rewrite)
- **ORM:** Drizzle
- **UI:** Tailwind + shadcn/ui, Recharts for charts
- **PWA:** installable, offline read of last-loaded dashboard (nice to have, not blocking)
- **Hosting:** Vercel
- **Testing:** Vitest. The FIRE engine (`lib/fire.ts`) must have full unit test coverage before any UI is built on it.

## 12. Build phases (Claude Code roadmap)

1. **Phase 1, engine:** repo scaffold, schema, migrations, `lib/fire.ts` with full tests. No UI beyond a debug page printing the numbers.
2. **Phase 2, entry + dashboard:** transaction entry flow, accounts, snapshots, the dashboard screen.
3. **Phase 3, onboarding:** wizard, profile creation, "your starting point" summary.
4. **Phase 4, gamification:** streaks, milestones, celebrations.
5. **Phase 5, coaching:** module content, trigger engine, coaching card.
6. **Phase 6 (post-validation):** auth, multi-user, CSV import, then bank sync.

Rule for Claude Code sessions: one phase per session, always start in plan mode, do not move to the next phase until the current one works end to end.

## 13. Success metrics

- v1 (personal): founder logs transactions at least 4x/week for 8 consecutive weeks; checks dashboard at least 3x/week after week 2.
- Public beta: D30 retention > 25%, median onboarding completion < 3 minutes, at least 50% of users log a contribution in their first month.

## 14. Non-goals and principles

- Not a budgeting app. Budgets are a means; FIRE progress is the product.
- Not a robo-advisor. No specific product or asset recommendations, ever.
- Simplicity beats features. Every new screen must justify itself against "does this move the FIRE date closer or make logging faster?"
