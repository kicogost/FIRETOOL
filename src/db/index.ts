/**
 * Database client. Two drivers, one schema:
 *  - If DATABASE_URL is set → Supabase/Postgres (postgres-js driver).
 *  - Otherwise → PGlite (in-process Postgres) for local dev, persisted to disk.
 *
 * Both speak the same Postgres dialect, so the Drizzle schema and the migrations
 * in ./drizzle are identical. The instance is cached on globalThis so Next.js
 * HMR reuses one connection; migrations + seed run once on first use.
 */
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { seedCategories, seedDemo } from "./seed";

export type Db = ReturnType<typeof drizzlePglite<typeof schema>>;

const DATA_DIR = process.env.PGLITE_DIR ?? "./.pglite";

// Demo seed runs only in single-user mode. With Supabase Auth configured, each
// user creates their own data through onboarding — no shared demo profile.
const AUTH_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

declare global {
  // eslint-disable-next-line no-var
  var __fireDbPromise: Promise<Db> | undefined;
}

async function initSupabase(url: string): Promise<Db> {
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const postgres = (await import("postgres")).default;

  const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
  // `prepare: false` keeps us compatible with Supabase's transaction pooler.
  const sql = postgres(url, { ssl: isLocal ? false : "require", prepare: false });
  const db = drizzle(sql, { schema }) as unknown as Db;

  await migrate(db as never, { migrationsFolder: "./drizzle" });
  await seedCategories(db); // global reference data, always
  if (!AUTH_ENABLED) await seedDemo(db);
  return db;
}

async function initPglite(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");

  const pg = new PGlite(DATA_DIR);
  const db = drizzlePglite(pg, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await seedCategories(db); // global reference data, always
  if (!AUTH_ENABLED) await seedDemo(db);
  return db;
}

async function init(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  return url ? initSupabase(url) : initPglite();
}

/** Get the shared DB instance (migrations + seed applied on first call). */
export function getDb(): Promise<Db> {
  if (!globalThis.__fireDbPromise) {
    globalThis.__fireDbPromise = init();
  }
  return globalThis.__fireDbPromise;
}

export { schema };
