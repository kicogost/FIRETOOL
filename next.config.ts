import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships a wasm/data payload — keep it external so it loads from
  // node_modules at runtime instead of being bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
