import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@premieroctet/next-admin/schema": "./lib/next-admin-schema.ts",
    },
  },
};

export default nextConfig;
