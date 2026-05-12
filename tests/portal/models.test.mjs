// ============================================================
// Per-workspace fine-tune store smoke test (Phase 13.0)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const store = await import(url("lib/portal/models/store.ts"));

test("Model registry", async (t) => {
  __resetPortalRepository();
  store.__resetModelVariants();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("seed includes baseline + one fine-tune", () => {
    const list = store.listModelVariants(ws.id);
    assert.equal(list.length, 2);
    assert.ok(list.some((v) => v.kind === "baseline" && v.isRouted));
    assert.ok(list.some((v) => v.kind === "fine-tuned" && v.status === "ready"));
  });

  await t.test("propose lifts eval score deterministically", () => {
    const variant = store.proposeFineTune(ws.id, {
      baseModel: "claude-sonnet-4-6",
      label: "Smoke fine-tune",
      description: "test",
      sourceArtifactIds: ["art-governance", "art-decision-architecture", "art-knowledge-map"],
      dataResidency: "ca",
    });
    assert.equal(variant.status, "ready");
    assert.ok(variant.evalScore > variant.baselineEvalScore + 0.04);
  });

  await t.test("routing requires ≥2-point lift over baseline", () => {
    // Create a sub-baseline variant by hand.
    const list = store.listModelVariants(ws.id);
    const ftVariant = list.find((v) => v.label === "Smoke fine-tune");
    assert.ok(ftVariant);
    const routed = store.routeToVariant(ws.id, ftVariant.id);
    assert.equal(routed.isRouted, true);
    assert.equal(routed.status, "active");
    // Active fine-tune supplants baseline.
    const after = store.listModelVariants(ws.id);
    const baseline = after.find((v) => v.kind === "baseline");
    assert.equal(baseline.isRouted, false);
  });

  await t.test("drift > 0.4 auto-rolls back the routed fine-tune", () => {
    const before = store.getActiveVariant(ws.id);
    assert.ok(before.kind === "fine-tuned");
    store.recordDriftSample(ws.id, before.id, 0.55);
    const after = store.getActiveVariant(ws.id);
    assert.ok(after.kind === "baseline", "expected baseline to re-route after auto-rollback");
  });

  await t.test("manual rollback flips status and re-routes baseline", () => {
    store.__resetModelVariants();
    const list = store.listModelVariants(ws.id);
    const ft = list.find((v) => v.kind === "fine-tuned");
    store.routeToVariant(ws.id, ft.id);
    store.rollbackVariant(ws.id, { variantId: ft.id, reason: "Smoke." });
    const after = store.listModelVariants(ws.id);
    assert.equal(after.find((v) => v.id === ft.id).status, "rolled-back");
    assert.equal(after.find((v) => v.kind === "baseline").isRouted, true);
  });
});
