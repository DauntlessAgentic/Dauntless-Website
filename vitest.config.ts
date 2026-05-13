import { defineConfig } from "vitest/config";
import path from "node:path";

// Minimal vitest config for portal smoke tests + mock-data invariants.
// We deliberately stay node-environment for v1: portal pages are "use client"
// components that need React/jsdom + Next router mocks to render. Module-import
// smoke tests + pure-data invariant tests cover the value of a smoke suite
// without that overhead. Component-render tests land in Phase 2.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
