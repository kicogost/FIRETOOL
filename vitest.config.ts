import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Tests always use in-memory PGlite — never a real DATABASE_URL (Supabase).
    env: { DATABASE_URL: "", PGLITE_DIR: "memory://" },
    coverage: {
      provider: "v8",
      include: ["src/lib/fire.ts"],
      thresholds: {
        "src/lib/fire.ts": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
});
