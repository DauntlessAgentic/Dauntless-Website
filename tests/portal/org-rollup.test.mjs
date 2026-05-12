// ============================================================
// Org rollup smoke test (Phase 8.0)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const { getOrgRollup } = await import(url("lib/portal/org-rollup.ts"));

test("Org rollup", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const snapshot = await repo.getSnapshot((await repo.getDefaultWorkspace()).id);

  await t.test("returns at least 3 workspaces with one active", async () => {
    const rollup = await getOrgRollup(snapshot.organization.id);
    assert.ok(rollup.workspaces.length >= 3);
    const active = rollup.workspaces.filter((w) => w.active);
    assert.equal(active.length, 1);
    assert.equal(active[0].id, snapshot.workspace.id);
  });

  await t.test("aggregate totals sum from per-workspace counts", async () => {
    const rollup = await getOrgRollup(snapshot.organization.id);
    const engSum = rollup.workspaces.reduce((acc, w) => acc + w.engagements.total, 0);
    assert.equal(rollup.totals.engagements, engSum);
    const pendingSum = rollup.workspaces.reduce((acc, w) => acc + w.decisions.pending, 0);
    assert.equal(rollup.totals.pendingDecisions, pendingSum);
  });

  await t.test("active workspace health score is computed (≠ 0)", async () => {
    const rollup = await getOrgRollup(snapshot.organization.id);
    const active = rollup.workspaces.find((w) => w.active);
    assert.ok(active.healthScore > 0);
    assert.ok(active.healthScore <= 100);
  });
});
