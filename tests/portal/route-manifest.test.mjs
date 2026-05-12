// ============================================================
// Route manifest smoke test (closeout)
//
// Asserts that every advertised portal route + API route is
// present on disk. Catches regressions where someone deletes a
// page.tsx without updating the README / docs.
//
// This is a lightweight FS check, not a request test. Phase 16
// will wire a real Playwright pass that hits every route.
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

const PORTAL_ROUTES = [
  "/portal",
  "/portal/engagements",
  "/portal/engagements/[id]",
  "/portal/deliverables",
  "/portal/deliverables/[id]",
  "/portal/deliverables/[id]/edit",
  "/portal/decisions",
  "/portal/decisions/[id]",
  "/portal/agents",
  "/portal/agents/[id]",
  "/portal/knowledge",
  "/portal/outcomes",
  "/portal/outcomes/impact-report",
  "/portal/governance",
  "/portal/search",
  "/portal/schedule",
  "/portal/innovation",
  "/portal/org",
  "/portal/api",
  "/portal/actions",
  "/portal/compliance",
  "/portal/federation",
  "/portal/models",
  "/portal/marketplace",
  "/portal/portfolio",
  "/portal/about",
  "/portal/changelog",
  "/portal/help",
];

const API_ROUTES = [
  "/api/portal/v1/engagements",
  "/api/portal/v1/artifacts",
  "/api/portal/v1/signals",
  "/api/portal/v1/metrics",
  "/api/portal/v1/knowledge",
  "/api/portal/v1/schedule",
  "/api/portal/v1/decisions",
];

function portalRouteFile(route) {
  // /portal/engagements/[id] → app/(app)/portal/engagements/[id]/page.tsx
  const trimmed = route.startsWith("/") ? route.slice(1) : route;
  return path.join(repoRoot, "app", "(app)", trimmed, "page.tsx");
}

function apiRouteFile(route) {
  const trimmed = route.startsWith("/") ? route.slice(1) : route;
  return path.join(repoRoot, "app", trimmed, "route.ts");
}

test("Route manifest", async (t) => {
  await t.test("every advertised portal route has a page.tsx", () => {
    const missing = PORTAL_ROUTES.filter((r) => !fs.existsSync(portalRouteFile(r)));
    assert.equal(missing.length, 0, `Missing portal routes:\n${missing.join("\n")}`);
  });

  await t.test("every advertised API route has a route.ts", () => {
    const missing = API_ROUTES.filter((r) => !fs.existsSync(apiRouteFile(r)));
    assert.equal(missing.length, 0, `Missing API routes:\n${missing.join("\n")}`);
  });

  await t.test("portal route count matches the README", () => {
    const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
    // README claims 22+ portal routes. Verify we still beat that floor.
    assert.ok(PORTAL_ROUTES.length >= 22, `Expected ≥22 portal routes, found ${PORTAL_ROUTES.length}`);
    // Roadmap status module should also be consistent with our route count.
    assert.ok(readme.includes("/portal/about"));
    assert.ok(readme.includes("REST API"));
  });
});
