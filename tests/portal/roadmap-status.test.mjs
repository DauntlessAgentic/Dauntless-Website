// ============================================================
// Roadmap status (single source of truth) smoke test
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { ROADMAP_STATUS, getCoverageByTier, getShippedCount } = await import(url("lib/portal/roadmap-status.ts"));

test("Roadmap status", async (t) => {
  await t.test("covers all 15 phases plus the Phase 1 foundation", () => {
    assert.ok(ROADMAP_STATUS.length >= 17, `expected ≥17 phase entries, got ${ROADMAP_STATUS.length}`);
  });

  await t.test("every phase declares an id + title + marker + tier + status", () => {
    for (const phase of ROADMAP_STATUS) {
      assert.ok(phase.id);
      assert.ok(phase.title);
      assert.ok(phase.marker);
      assert.ok(phase.tier);
      assert.ok(phase.status);
      assert.ok(phase.features.length >= 1);
    }
  });

  await t.test("shipped count matches the number of `shipped` rows", () => {
    const expected = ROADMAP_STATUS.filter((p) => p.status === "shipped").length;
    assert.equal(getShippedCount(), expected);
  });

  await t.test("coverage map spans every tier", () => {
    const coverage = getCoverageByTier();
    for (const tier of ["core-portal", "advanced-portal", "innovation-studio", "enterprise-network"]) {
      assert.ok(coverage[tier]);
      assert.ok(coverage[tier].total >= 1);
    }
  });

  await t.test("phase markers are unique", () => {
    const markers = new Set();
    for (const phase of ROADMAP_STATUS) {
      assert.ok(!markers.has(phase.marker), `duplicate marker: ${phase.marker}`);
      markers.add(phase.marker);
    }
  });
});
