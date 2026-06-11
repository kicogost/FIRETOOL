/**
 * Database client — PGlite (in-process Postgres) for local v1.
 *
 * PGlite speaks the same Postgres dialect as Supabase, so the Drizzle schema and
 * migrations are identical; moving to Supabase later (Phase 6) is a driver +
 * connection-string swap. The instance is cached on globalThis so Next.js HMR in
 * dev reuses one connection, and migrations + seed run exactly once on first use.
 */
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";
import { seedIfEmpty } from "./seed";

export type Db = ReturnType<typeof drizzle<typeof schema>>;

const DATA_DIR = process.env.PGLITE_DIR ?? "./.pglite";

declare global {
  // eslint-disable-next-line no-var
  var __fireDbPromise: Promise<Db> | undefined;
}

async function init(): Promise<Db> {
  const pg = new PGlite(DATA_DIR);
  const db = drizzle(pg, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  await seedIfEmpty(db);
  return db;
}

/** Get the shared DB instance (migrations + seed applied on first call). */
export function getDb(): Promise<Db> {
  if (!globalThis.__fireDbPromise) {
    globalThis.__fireDbPromise = init();
  }
  return globalThis.__fireDbPromise;
}

export { schema };
