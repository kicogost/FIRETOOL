import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Unused in Phase 1 — migrations are generated from the schema, not applied.
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/fire_tracker",
  },
} satisfies Config;
