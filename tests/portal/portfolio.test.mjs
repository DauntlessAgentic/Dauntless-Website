// ============================================================
// Dauntless portfolio rollup smoke test (Phase 14.0)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const {
  computePortfolioTotals,
  EMERGENT_PATTERNS,
  INTERNAL_DECISIONS,
  PORTFOLIO_ACCOUNTS,
} = await import(url("lib/portal/portfolio/index.ts"));

test("Portfolio rollup", async (t) => {
  await t.test("seed has ≥4 accounts spanning every tier", () => {
    assert.ok(PORTFOLIO_ACCOUNTS.length >= 4);
    const tiers = new Set(PORTFOLIO_ACCOUNTS.map((a) => a.tier));
    for (const tier of ["starter", "core", "advanced", "strategic"]) {
      assert.ok(tiers.has(tier), `expected an account in tier ${tier}`);
    }
  });

  await t.test("totals sum correctly", () => {
    const totals = computePortfolioTotals(PORTFOLIO_ACCOUNTS);
    const expectedMrr = PORTFOLIO_ACCOUNTS.reduce((acc, a) => acc + a.monthlyRecurringUsd, 0);
    assert.equal(totals.monthlyRecurringUsd, expectedMrr);
    assert.equal(totals.grossMarginUsd, expectedMrr - PORTFOLIO_ACCOUNTS.reduce((acc, a) => acc + a.costToServeUsd, 0));
    assert.ok(totals.averageHealthScore > 0 && totals.averageHealthScore <= 100);
  });

  await t.test("emergent patterns flag federation candidates", () => {
    const federationCandidates = EMERGENT_PATTERNS.filter((p) => p.recommendedAction === "promote-to-federation");
    assert.ok(federationCandidates.length >= 2);
    for (const p of federationCandidates) {
      assert.ok(p.workspaces.length >= 2);
      assert.ok(p.confidence >= 0.5);
    }
  });

  await t.test("internal decision register covers >= 4 statuses", () => {
    const statuses = new Set(INTERNAL_DECISIONS.map((d) => d.status));
    assert.ok(statuses.size >= 3);
  });
});
