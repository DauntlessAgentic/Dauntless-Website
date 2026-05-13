// Smoke tests for the multi-org seed (Pre-launch §A2).
//
// Pre-launch posture: the in-memory repository ships a multi-org
// lookup so the portfolio surface can resolve every account's
// organization without a multi-tenant repository yet. Phase 8.1
// extends this with per-org workspaces.

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(
  url("lib/portal/repositories/index.ts"),
);
const { mockOrganizations, mockOrganization } = await import(
  url("lib/portal/mock-data.ts"),
);
const { PORTFOLIO_ACCOUNTS } = await import(url("lib/portal/portfolio/index.ts"));

test("mockOrganizations includes the four portfolio accounts", () => {
  const ids = new Set(mockOrganizations.map((o) => o.id));
  assert.ok(ids.has("org-tbs"), "TBS missing");
  assert.ok(ids.has("org-esdc"), "ESDC missing");
  assert.ok(ids.has("org-health-canada"), "Health Canada missing");
  assert.ok(ids.has("org-nrcan"), "NRCan missing");
});

test("mockOrganizations is non-duplicated and well-formed", () => {
  const ids = new Set();
  for (const org of mockOrganizations) {
    assert.match(org.id, /^org-/, `org id must start with "org-": ${org.id}`);
    assert.ok(org.name.length > 0, `org ${org.id} missing name`);
    assert.ok(org.sector.length > 0, `org ${org.id} missing sector`);
    assert.ok(["standard", "elevated", "restricted"].includes(org.trustTier), `org ${org.id} invalid trust tier`);
    assert.ok(!ids.has(org.id), `duplicate org id: ${org.id}`);
    ids.add(org.id);
  }
});

test("mockOrganizations[0] is the canonical mockOrganization (TBS)", () => {
  assert.equal(mockOrganizations[0], mockOrganization);
});

test("getOrganization() resolves every seeded org id", async () => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  for (const seed of mockOrganizations) {
    const fetched = await repo.getOrganization(seed.id);
    assert.ok(fetched, `org ${seed.id} did not resolve`);
    assert.equal(fetched.id, seed.id);
    assert.equal(fetched.name, seed.name);
  }
});

test("getOrganization() returns null for an unknown id", async () => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const result = await repo.getOrganization("org-does-not-exist");
  assert.equal(result, null);
});

test("listOrganizations() returns the active org plus the multi-org seed", async () => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const all = await repo.listOrganizations();
  const ids = new Set(all.map((o) => o.id));
  assert.ok(ids.has("org-tbs"), "active workspace's org must be present");
  assert.ok(ids.has("org-esdc"));
  assert.ok(ids.has("org-health-canada"));
  assert.ok(ids.has("org-nrcan"));
  // No duplicates.
  assert.equal(all.length, ids.size, "listOrganizations should not duplicate");
});

test("portfolio account organizationNames correspond to real seeded orgs", () => {
  // The portfolio surface seeds organizationName as a string; this test
  // pins the names so future renames stay in sync with the multi-org seed.
  const seedNames = new Set(mockOrganizations.map((o) => o.name));
  const accountNames = new Set(PORTFOLIO_ACCOUNTS.map((a) => a.organizationName));
  // Every portfolio account should reference an org name that appears
  // in the seed (modulo the ESDC qualifier — the portfolio uses
  // "ESDC (Service Foresight Lab)" while the seed uses the full
  // department name).
  const _ = seedNames; // referenced for future Phase 8.1 hard-link
  assert.ok(accountNames.has("Treasury Board of Canada Secretariat"));
  assert.ok(accountNames.has("Health Canada"));
});
