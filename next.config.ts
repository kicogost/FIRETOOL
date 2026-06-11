import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships a wasm/data payload — keep it external so it loads from
  // node_modules at runtime instead of being bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Migrations run at startup from ./drizzle; bundle the SQL into the serverless
  // functions so it exists at runtime on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*"],
  },
};

export default nextConfig;
