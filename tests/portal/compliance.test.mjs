// ============================================================
// Compliance posture smoke test (Phase 10.0)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const { computePortalCompliance, FRAMEWORKS, SECTOR_PACKS } = await import(url("lib/portal/compliance.ts"));

test("Compliance posture", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const snap = await repo.getSnapshot(ws.id);

  await t.test("four frameworks evaluated with controls each", () => {
    const posture = computePortalCompliance({
      decisions: snap.decisions,
      artifacts: snap.artifacts,
      knowledge: snap.knowledge,
      memberships: snap.memberships,
      auditLog: snap.auditLog,
      isHostedRepository: false,
      isApiKeyConfigured: false,
      isAuthConfigured: false,
    });
    assert.equal(posture.frameworks.length, FRAMEWORKS.length);
    for (const fw of posture.frameworks) {
      assert.ok(fw.controls.length >= 5);
      assert.ok(fw.score >= 0 && fw.score <= 100);
    }
  });

  await t.test("hosted repository raises overall score", () => {
    const baseline = computePortalCompliance({
      decisions: snap.decisions,
      artifacts: snap.artifacts,
      knowledge: snap.knowledge,
      memberships: snap.memberships,
      auditLog: snap.auditLog,
      isHostedRepository: false,
      isApiKeyConfigured: false,
      isAuthConfigured: false,
    });
    const hosted = computePortalCompliance({
      decisions: snap.decisions,
      artifacts: snap.artifacts,
      knowledge: snap.knowledge,
      memberships: snap.memberships,
      auditLog: snap.auditLog,
      isHostedRepository: true,
      isApiKeyConfigured: true,
      isAuthConfigured: true,
    });
    assert.ok(hosted.overallScore > baseline.overallScore);
  });

  await t.test("sector packs span all frameworks", () => {
    const seen = new Set(SECTOR_PACKS.map((p) => p.framework));
    for (const fw of FRAMEWORKS) {
      assert.ok(seen.has(fw.id), `expected at least one pack for ${fw.id}`);
    }
  });
});
