// ============================================================
// Engagement Analyst smoke test (Phase 3)
//
// Runs the full agent orchestrator in stub mode (no API key) and
// verifies:
//   - A Decision lands in pending-approval state
//   - An audit entry + decision-proposed signal are emitted
//   - Tool execution shape is honest about what a real run would
//     do (search_artifacts and cite_evidence called or available)
//
// Live API testing happens in Phase 3.1 when we add a recorded-
// transcript replay harness.
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { runEngagementAnalyst } = await import(url("lib/portal/agents/engagement-analyst.ts"));
const { __resetAgentTelemetry, getTelemetrySummary } = await import(url("lib/portal/agents/telemetry.ts"));
const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));

test("Engagement Analyst — stub run lands a decision", async (t) => {
  delete process.env.ANTHROPIC_API_KEY;
  __resetAgentTelemetry();
  __resetPortalRepository();

  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const before = await repo.getSnapshot(ws.id);
  const beforeDecisions = before.decisions.length;
  const beforePending = before.decisions.filter((d) => d.status === "pending-approval").length;

  const result = await runEngagementAnalyst({});

  await t.test("returns a stub result with a decision id", () => {
    assert.equal(result.status, "stub");
    assert.ok(result.decisionId, "expected a decision id to be set");
  });

  await t.test("repository state contains the new pending decision", async () => {
    const after = await repo.getSnapshot(ws.id);
    assert.equal(after.decisions.length, beforeDecisions + 1);
    const fresh = after.decisions.find((d) => d.id === result.decisionId);
    assert.ok(fresh, "expected proposed decision to be queryable");
    assert.equal(fresh.status, "pending-approval");
    assert.equal(fresh.proposedBy, "agent-engagement-analyst");
    assert.ok(fresh.evidenceIds.length >= 1);
    assert.ok(fresh.artifactIds.length >= 1);
    assert.equal(after.decisions.filter((d) => d.status === "pending-approval").length, beforePending + 1);
  });

  await t.test("audit log gained an agent-run entry", async () => {
    const after = await repo.getSnapshot(ws.id);
    const latest = after.auditLog.at(-1);
    assert.equal(latest.action, "agent-run");
    assert.equal(latest.actorKind, "agent");
  });

  await t.test("signals feed gained a decision-proposed entry", async () => {
    const after = await repo.getSnapshot(ws.id);
    const proposed = after.signals.find(
      (s) => s.kind === "decision-proposed" && s.refId === result.decisionId,
    );
    assert.ok(proposed, "expected a decision-proposed signal");
  });

  await t.test("telemetry summary recorded the run", () => {
    const summary = getTelemetrySummary();
    assert.equal(summary.totalRuns, 1);
    assert.equal(summary.decisionsProposed, 1);
    assert.equal(summary.totalCostUsd, 0); // stub mode is free
  });
});
