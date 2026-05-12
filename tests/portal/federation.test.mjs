// ============================================================
// Federation primitive smoke test (Phase 12.0)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const fed = await import(url("lib/portal/federation/index.ts"));

test("Federation primitive", async (t) => {
  __resetPortalRepository();
  fed.__resetFederation();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const snap = await repo.getSnapshot(ws.id);

  await t.test("catalog lists 4 sector federations", () => {
    const list = fed.listFederations();
    assert.equal(list.length, 4);
    for (const f of list) assert.ok(f.curatedAnchors.length >= 1);
  });

  await t.test("workspace starts as a member of the federal-canada federation", () => {
    const memberships = fed.listMemberships(ws.id);
    assert.ok(memberships.some((m) => m.federationId === "fed-federal-canada" && m.status === "active"));
  });

  await t.test("contributing anonymizes 'standard'", () => {
    const artifact = snap.artifacts.find((a) => a.canonical) ?? snap.artifacts[0];
    const contribution = fed.contributeArtifact(
      {
        workspaceId: ws.id,
        federationId: "fed-federal-canada",
        artifactId: artifact.id,
        contributedBy: "Test Contributor",
        anonymizationLevel: "standard",
      },
      artifact,
    );
    assert.equal(contribution.status, "active");
    // Standard anonymization should drop named individuals.
    assert.ok(!contribution.snapshot.body.includes("Dr. Eleanor Vance"));
  });

  await t.test("strict anonymization replaces orgs with placeholders", () => {
    const artifact = snap.artifacts.find((a) => a.canonical) ?? snap.artifacts[0];
    const contribution = fed.contributeArtifact(
      {
        workspaceId: ws.id,
        federationId: "fed-federal-canada",
        artifactId: artifact.id,
        contributedBy: "Test Contributor",
        anonymizationLevel: "strict",
      },
      artifact,
    );
    assert.ok(!contribution.snapshot.body.includes("Treasury Board"));
    assert.ok(!contribution.snapshot.body.includes("Dauntless Agentic"));
  });

  await t.test("search returns results without workspace provenance", () => {
    const results = fed.searchFederation("governance", "fed-federal-canada", 10);
    assert.ok(results.length >= 1);
    for (const r of results) {
      assert.ok(!("workspaceId" in r), "search results must not expose workspaceId");
    }
  });

  await t.test("leaveFederation withdraws all active contributions", () => {
    fed.leaveFederation(ws.id, "fed-federal-canada");
    const contribs = fed.listContributions(ws.id);
    assert.ok(contribs.every((c) => c.status === "withdrawn"));
  });
});
