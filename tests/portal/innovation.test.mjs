// ============================================================
// Innovation Studio smoke test (Phase 7)
//
// Validates:
//   - Pattern library is populated and filterable
//   - Pattern matching ranks plausibly for an engagement
//   - Roadmap simulator returns one ordered result per scenario
//   - Decision tree assembles with three levels
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const { PATTERN_LIBRARY, listPatterns, getPattern, matchPatternsForEngagement } = await import(url("lib/portal/innovation/patterns.ts"));
const { DEFAULT_SCENARIOS, runScenarioSimulations, buildDecisionTree } = await import(url("lib/portal/innovation/simulator.ts"));

test("Pattern library", async (t) => {
  await t.test("seed has at least 15 entries", () => {
    assert.ok(PATTERN_LIBRARY.length >= 15);
  });

  await t.test("listPatterns filters by category", () => {
    const governance = listPatterns({ category: "governance" });
    assert.ok(governance.length >= 1);
    assert.ok(governance.every((p) => p.category === "governance"));
  });

  await t.test("listPatterns filters by maturity", () => {
    const canonical = listPatterns({ maturity: "canonical" });
    assert.ok(canonical.length >= 1);
    assert.ok(canonical.every((p) => p.maturity === "canonical"));
  });

  await t.test("getPattern returns null for unknown id", () => {
    assert.equal(getPattern("ptn-does-not-exist"), null);
  });

  await t.test("matchPatternsForEngagement ranks ≥ 1 pattern for a governance kind", () => {
    const matches = matchPatternsForEngagement(
      [
        "Risk tiering and governance framework approved at SteerCo",
        "Independent audit of every decision in the workspace",
      ],
      "design",
    );
    assert.ok(matches.length >= 1);
    for (let i = 1; i < matches.length; i += 1) {
      assert.ok(matches[i - 1].score >= matches[i].score, "scores must be descending");
    }
  });
});

test("Roadmap simulator", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const snap = await repo.getSnapshot(ws.id);

  await t.test("runs each scenario and returns sorted results", () => {
    const results = runScenarioSimulations({
      scenarios: DEFAULT_SCENARIOS,
      metrics: snap.metrics,
      engagements: snap.engagements,
    });
    assert.equal(results.length, DEFAULT_SCENARIOS.length);
    for (let i = 1; i < results.length; i += 1) {
      assert.ok(results[i - 1].overallScore >= results[i].overallScore, "overallScore must be descending");
    }
    for (const r of results) {
      assert.equal(r.horizonMonths, 6);
      assert.ok(r.metrics.length === snap.metrics.length);
      for (const m of r.metrics) {
        assert.equal(m.series[0].value, m.baselineCurrent);
      }
    }
  });
});

test("Decision tree", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const snap = await repo.getSnapshot(ws.id);
  const decision = snap.decisions.find((d) => d.status === "pending-approval");
  assert.ok(decision);

  await t.test("buildDecisionTree returns root with option children, each with 3 leaves", () => {
    const tree = buildDecisionTree(decision);
    assert.equal(tree.label, decision.title);
    assert.ok(tree.children.length >= 2);
    for (const child of tree.children) {
      assert.equal(child.children.length, 3);
      // Probability sum across leaves should equal 1 in our fixture (0.55 + 0.30 + 0.15).
      const sum = child.children.reduce((acc, c) => acc + c.probability, 0);
      assert.ok(Math.abs(sum - 1) < 0.01, `leaf probabilities should sum to 1, got ${sum}`);
    }
  });
});
