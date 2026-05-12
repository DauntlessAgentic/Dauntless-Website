// ============================================================
// Telemetry event bus + impact report smoke test (Phase 6)
//
// Validates:
//   - Mutations emit events to the bus
//   - Derived metrics compute from the bus
//   - Impact report renders Markdown sections + tile counts
//   - Cross-engagement intelligence surfaces matching artifacts
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const { __resetPortalEvents, listPortalEvents } = await import(url("lib/portal/telemetry/event-bus.ts"));
const { computeDerivedMetrics } = await import(url("lib/portal/telemetry/metrics.ts"));
const { generateImpactReport } = await import(url("lib/portal/telemetry/impact-report.ts"));
const { computeCrossEngagementSuggestions } = await import(url("lib/portal/cross-engagement.ts"));
const { runAgent } = await import(url("lib/portal/agents/runner.ts"));
const { __resetAgentTelemetry } = await import(url("lib/portal/agents/telemetry.ts"));

test("Telemetry event bus", async (t) => {
  __resetPortalRepository();
  __resetPortalEvents();
  __resetAgentTelemetry();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("mutations emit events", async () => {
    const before = listPortalEvents().length;
    const snap = await repo.getSnapshot(ws.id);
    const decision = snap.decisions.find((d) => d.status === "pending-approval");
    assert.ok(decision);
    await repo.recordDecisionOutcome({
      decisionId: decision.id,
      workspaceId: ws.id,
      actor: "Test Approver",
      actorKind: "human",
      outcome: "approved",
    });
    await repo.draftArtifactVersion({
      workspaceId: ws.id,
      artifactId: snap.artifacts[0].id,
      versionBump: "patch",
      summary: "test draft",
      body: "# test body",
      actor: "Test Author",
      actorKind: "human",
    });
    const after = listPortalEvents();
    assert.ok(after.length >= before + 2, "expected at least two new events");
    const kinds = new Set(after.map((e) => e.kind));
    assert.ok(kinds.has("decision-outcome-recorded"));
    assert.ok(kinds.has("artifact-version-minted"));
  });

  await t.test("computeDerivedMetrics returns the configured metric set", () => {
    const metrics = computeDerivedMetrics(ws.id);
    const keys = new Set(metrics.map((m) => m.key));
    assert.ok(keys.has("decisions-proposed-28d"));
    assert.ok(keys.has("decision-approval-rate-28d"));
    assert.ok(keys.has("canonical-promotion-28d"));
    assert.ok(keys.has("agent-spend-28d"));
  });

  await t.test("generateImpactReport assembles structured sections", async () => {
    const report = await generateImpactReport(ws.id);
    assert.ok(report.input.workspaceName);
    assert.ok(report.sections.length >= 4);
    assert.ok(report.markdown.startsWith("# Quarterly Impact Report"));
    assert.ok(report.input.metrics.length >= 5);
  });

  await t.test("agent run pushes agent-run-completed event", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const beforeCount = listPortalEvents({ kinds: ["agent-run-completed"] }).length;
    await runAgent({ agentId: "agent-engagement-analyst" });
    const after = listPortalEvents({ kinds: ["agent-run-completed"] });
    assert.equal(after.length, beforeCount + 1);
    assert.equal(after[0].actorKind, "agent");
  });
});

test("Cross-engagement intelligence", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const snap = await repo.getSnapshot(ws.id);

  await t.test("suggestions surface relevant canonical artifacts", () => {
    const map = computeCrossEngagementSuggestions(snap.engagements, snap.artifacts);
    assert.ok(Object.keys(map).length === snap.engagements.length);
    let hits = 0;
    for (const e of snap.engagements) {
      const suggestions = map[e.id] ?? [];
      for (const s of suggestions) {
        assert.notEqual(s.sourceEngagementId, e.id, "suggestion must come from a different engagement");
        assert.ok(s.score >= 0 && s.score <= 1, "score within [0, 1]");
        hits += 1;
      }
    }
    assert.ok(hits >= 1, "expected at least one cross-engagement suggestion to land");
  });
});
