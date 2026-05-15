// ============================================================
// Agent fleet + separation of powers smoke test (Phase 5)
//
// Validates:
//   - Every archetype has a non-empty tool catalog
//   - No archetype can call a tool outside its surface
//   - propose_decision is strategist-only
//   - draft_artifact_version is operator-only
//   - audit_* tools are auditor-only
//   - generate_briefing is chief-of-staff-only
//   - Each archetype's stub run produces a coherent record
//   - Operator handoff emits a signal + audit entry
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { runAgent } = await import(url("lib/portal/agents/runner.ts"));
const { isToolPermitted, TOOLS_BY_ARCHETYPE } = await import(url("lib/portal/agents/tool-catalog.ts"));
const { listAgents } = await import(url("lib/portal/agents/registry.ts"));
const { __resetAgentTelemetry, listAgentRuns } = await import(url("lib/portal/agents/telemetry.ts"));
const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));

test("Agent fleet — registry shape", async (t) => {
  await t.test("at least one agent per archetype", () => {
    const agents = listAgents();
    const byArchetype = agents.reduce((acc, a) => {
      acc[a.archetype] = (acc[a.archetype] ?? 0) + 1;
      return acc;
    }, {});
    for (const archetype of ["strategist", "operator", "auditor", "chief-of-staff"]) {
      assert.ok(byArchetype[archetype] >= 1, `expected at least 1 ${archetype}, got ${byArchetype[archetype] ?? 0}`);
    }
  });

  await t.test("every archetype has tools", () => {
    for (const archetype of ["strategist", "operator", "auditor", "chief-of-staff"]) {
      assert.ok(TOOLS_BY_ARCHETYPE[archetype].length >= 3);
    }
  });
});

test("Agent fleet — separation of powers (binding)", async (t) => {
  await t.test("propose_decision is strategist-only", () => {
    assert.ok(isToolPermitted("strategist", "propose_decision"));
    assert.ok(!isToolPermitted("operator", "propose_decision"));
    assert.ok(!isToolPermitted("auditor", "propose_decision"));
    assert.ok(!isToolPermitted("chief-of-staff", "propose_decision"));
  });

  await t.test("draft_artifact_version is operator-only", () => {
    assert.ok(!isToolPermitted("strategist", "draft_artifact_version"));
    assert.ok(isToolPermitted("operator", "draft_artifact_version"));
    assert.ok(!isToolPermitted("auditor", "draft_artifact_version"));
    assert.ok(!isToolPermitted("chief-of-staff", "draft_artifact_version"));
  });

  await t.test("audit_evidence_completeness is auditor-only", () => {
    assert.ok(!isToolPermitted("strategist", "audit_evidence_completeness"));
    assert.ok(!isToolPermitted("operator", "audit_evidence_completeness"));
    assert.ok(isToolPermitted("auditor", "audit_evidence_completeness"));
    assert.ok(!isToolPermitted("chief-of-staff", "audit_evidence_completeness"));
  });

  await t.test("audit_canonical_candidate is auditor-only", () => {
    assert.ok(!isToolPermitted("strategist", "audit_canonical_candidate"));
    assert.ok(!isToolPermitted("operator", "audit_canonical_candidate"));
    assert.ok(isToolPermitted("auditor", "audit_canonical_candidate"));
    assert.ok(!isToolPermitted("chief-of-staff", "audit_canonical_candidate"));
  });

  await t.test("propose_revision is auditor-only", () => {
    assert.ok(!isToolPermitted("strategist", "propose_revision"));
    assert.ok(!isToolPermitted("operator", "propose_revision"));
    assert.ok(isToolPermitted("auditor", "propose_revision"));
    assert.ok(!isToolPermitted("chief-of-staff", "propose_revision"));
  });

  await t.test("generate_briefing is chief-of-staff-only", () => {
    assert.ok(!isToolPermitted("strategist", "generate_briefing"));
    assert.ok(!isToolPermitted("operator", "generate_briefing"));
    assert.ok(!isToolPermitted("auditor", "generate_briefing"));
    assert.ok(isToolPermitted("chief-of-staff", "generate_briefing"));
  });

  await t.test("read tools are shared by every archetype", () => {
    for (const archetype of ["strategist", "operator", "auditor", "chief-of-staff"]) {
      for (const tool of ["search_artifacts", "read_decision", "summarize_signals", "cite_evidence"]) {
        assert.ok(isToolPermitted(archetype, tool), `${archetype} missing ${tool}`);
      }
    }
  });
});

test("Agent fleet — stub run per archetype", async (t) => {
  delete process.env.ANTHROPIC_API_KEY;

  await t.test("strategist stub produces a decision", async () => {
    __resetPortalRepository();
    __resetAgentTelemetry();
    const result = await runAgent({ agentId: "agent-engagement-analyst" });
    assert.equal(result.status, "stub");
    assert.ok(result.decisionId);
  });

  await t.test("operator stub drafts a version and hands off", async () => {
    __resetPortalRepository();
    __resetAgentTelemetry();
    const result = await runAgent({ agentId: "agent-report-builder" });
    assert.equal(result.status, "stub");
    assert.equal(result.handoffTo, "auditor");
    const repo = getPortalRepository();
    const ws = await repo.getDefaultWorkspace();
    const snapshot = await repo.getSnapshot(ws.id);
    const handoffEntry = snapshot.auditLog.find((a) => a.detail.includes("Handoff from"));
    assert.ok(handoffEntry, "expected handoff audit entry");
    assert.equal(handoffEntry.actorKind, "agent");
  });

  await t.test("auditor stub returns a verdict (and revises when needed)", async () => {
    __resetPortalRepository();
    __resetAgentTelemetry();
    const result = await runAgent({ agentId: "agent-governance-auditor" });
    assert.equal(result.status, "stub");
    const audit = result.toolCalls.find((t) => t.toolName === "audit_evidence_completeness");
    assert.ok(audit, "expected an audit_evidence_completeness tool call");
    const parsed = JSON.parse(audit.output);
    assert.ok(["pass", "needs-revision", "fail"].includes(parsed.verdict));
  });

  await t.test("chief-of-staff stub produces a briefing", async () => {
    __resetPortalRepository();
    __resetAgentTelemetry();
    const result = await runAgent({ agentId: "agent-concierge" });
    assert.equal(result.status, "stub");
    const briefing = result.toolCalls.find((t) => t.toolName === "generate_briefing");
    assert.ok(briefing, "expected a generate_briefing tool call");
    const parsed = JSON.parse(briefing.output);
    assert.ok(Array.isArray(parsed.topDecisions));
  });

  await t.test("telemetry records every run", () => {
    const runs = listAgentRuns(20);
    assert.ok(runs.length >= 1);
  });

  await t.test("unknown agent id throws", async () => {
    await assert.rejects(() => runAgent({ agentId: "agent-nonexistent" }), /Unknown agent/);
  });
});
