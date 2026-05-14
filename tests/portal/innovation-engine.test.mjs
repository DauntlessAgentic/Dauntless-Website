// ============================================================
// Continuous Autonomous Innovation Engine smoke test (Phase 7.1)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const { __resetPortalEvents } = await import(url("lib/portal/telemetry/event-bus.ts"));
const { tick, listProposals, acknowledgeProposal, __resetInnovationEngine } = await import(
  url("lib/portal/innovation/engine.ts")
);

test("Innovation engine", async (t) => {
  __resetPortalRepository();
  __resetPortalEvents();
  __resetInnovationEngine();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("tick produces at least one proposal for seeded workspace", async () => {
    const proposals = await tick(ws.id);
    assert.ok(proposals.length >= 1, `expected ≥ 1 proposal, got ${proposals.length}`);
    for (const p of proposals) {
      assert.equal(p.workspaceId, ws.id);
      assert.ok(p.suggestedActions.length >= 1);
      assert.ok(p.evidence.length >= 1);
      assert.ok(p.expiresAt > p.generatedAt);
    }
  });

  await t.test("proposals are deduped across ticks", async () => {
    const first = await tick(ws.id);
    const firstIds = new Set(first.map((p) => p.dedupeKey));
    const second = await tick(ws.id);
    // Same dedupe keys; no new proposals beyond the first run.
    for (const p of second) {
      assert.ok(firstIds.has(p.dedupeKey), `unexpected new proposal: ${p.dedupeKey}`);
    }
    assert.equal(second.length, first.length);
  });

  await t.test("urgency ordering puts urgent before advisory", async () => {
    const proposals = await tick(ws.id);
    const urgencyOrder = { urgent: 0, notable: 1, advisory: 2 };
    for (let i = 1; i < proposals.length; i += 1) {
      assert.ok(
        urgencyOrder[proposals[i - 1].urgency] <= urgencyOrder[proposals[i].urgency],
        "proposals not ordered by urgency",
      );
    }
  });

  await t.test("acknowledgeProposal marks a proposal acknowledged", async () => {
    const before = listProposals(ws.id);
    assert.ok(before.length >= 1);
    const target = before[0];
    const ack = acknowledgeProposal(target.id);
    assert.ok(ack);
    assert.ok(ack.acknowledgedAt);
  });

  await t.test("listProposals returns empty for unknown workspace", () => {
    const empty = listProposals("ws-does-not-exist");
    assert.equal(empty.length, 0);
  });
});
