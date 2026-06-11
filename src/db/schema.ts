/**
 * Drizzle schema — translates PRD §7 into Postgres tables.
 *
 * Phase 1 defines the schema and generates migration SQL only; nothing is
 * applied to a live database yet. Multi-user/RLS is deferred (PRD §11): v1 is
 * keyed to a single hardcoded profile.
 */
import {
  pgEnum,
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  numeric,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// --- Enums -----------------------------------------------------------------

export const fireVariant = pgEnum("fire_variant", [
  "full",
  "lean",
  "coast",
  "barista",
]);

export const rewardStyle = pgEnum("reward_style", ["quiet", "loud"]);

export const accountType = pgEnum("account_type", [
  "cash",
  "brokerage",
  "pension",
  "crypto",
  "property",
  "debt",
]);

export const transactionType = pgEnum("transaction_type", [
  "income",
  "expense",
  "contribution",
  "withdrawal",
]);

export const categoryKind = pgEnum("category_kind", ["income", "expense"]);

export const streakKind = pgEnum("streak_kind", ["monthly_contribution"]);

// --- Tables ----------------------------------------------------------------

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  currency: text("currency").notNull().default("EUR"),
  swr: numeric("swr").notNull().default("0.04"),
  expectedReturn: numeric("expected_return").notNull().default("0.05"),
  retirementMonthlySpend: numeric("retirement_monthly_spend"),
  fireVariant: fireVariant("fire_variant").notNull().default("full"),
  rewardStyle: rewardStyle("reward_style").notNull().default("quiet"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: accountType("type").notNull(),
  // Whether the account counts toward the FIRE number (invested assets).
  isInvested: boolean("is_invested").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Monthly balance per account — the net-worth backbone.
export const snapshots = pgTable("snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  balance: numeric("balance").notNull(),
  date: date("date").notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  kind: categoryKind("kind").notNull(),
  isSinkingFund: boolean("is_sinking_fund").notNull().default(false),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  type: transactionType("type").notNull(),
  amount: numeric("amount").notNull(),
  category: text("category"),
  note: text("note"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Append-only log of achieved gamification events.
export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  achievedAt: timestamp("achieved_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  kind: streakKind("kind").notNull(),
  currentCount: integer("current_count").notNull().default(0),
  bestCount: integer("best_count").notNull().default(0),
  lastQualifiedMonth: text("last_qualified_month"),
});
