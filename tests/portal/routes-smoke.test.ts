import { describe, expect, it } from "vitest";

// Smoke test: every portal page module must export a default React component.
// This catches syntax errors, broken imports, and missing exports in the
// portal route tree without requiring a full DOM environment. Component-render
// tests land alongside the persistence work in Phase 2.

const routes = [
  { route: "/portal",               importer: () => import("@/app/(app)/portal/page") },
  { route: "/portal/engagements",   importer: () => import("@/app/(app)/portal/engagements/page") },
  { route: "/portal/deliverables",  importer: () => import("@/app/(app)/portal/deliverables/page") },
  { route: "/portal/decisions",     importer: () => import("@/app/(app)/portal/decisions/page") },
  { route: "/portal/agents",        importer: () => import("@/app/(app)/portal/agents/page") },
  { route: "/portal/knowledge",     importer: () => import("@/app/(app)/portal/knowledge/page") },
  { route: "/portal/outcomes",      importer: () => import("@/app/(app)/portal/outcomes/page") },
  { route: "/portal/governance",    importer: () => import("@/app/(app)/portal/governance/page") },
];

describe("portal route modules import cleanly", () => {
  for (const { route, importer } of routes) {
    it(`${route} exports a default component`, async () => {
      const mod = await importer();
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe("function");
    });
  }
});
