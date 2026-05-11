// ============================================================
// Schedule + Next-Best-Actions ranking pipeline smoke test (Phase 5.1)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const { computeNextBestActions } = await import(url("lib/portal/next-best-actions.ts"));

test("Schedule repository methods", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("listScheduleItems returns the seed", async () => {
    const items = await repo.listScheduleItems(ws.id);
    assert.ok(items.length >= 4);
    for (let i = 1; i < items.length; i += 1) {
      assert.ok(items[i - 1].startsAt.getTime() <= items[i].startsAt.getTime());
    }
  });

  await t.test("proposeScheduleItem adds a tentative row + audit + signal", async () => {
    const before = await repo.getSnapshot(ws.id);
    const auditBefore = before.auditLog.length;
    const signalsBefore = before.signals.length;
    const item = await repo.proposeScheduleItem({
      workspaceId: ws.id,
      kind: "review",
      title: "Smoke proposal",
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      durationMins: 30,
      attendees: ["Test Author"],
      proposedBy: "Test Author",
      proposedByKind: "human",
    });
    assert.equal(item.status, "tentative");
    const after = await repo.getSnapshot(ws.id);
    assert.equal(after.auditLog.length, auditBefore + 1);
    assert.equal(after.signals.length, signalsBefore + 1);
  });

  await t.test("updateScheduleItemStatus mutates the row", async () => {
    const items = await repo.listScheduleItems(ws.id);
    const target = items.find((i) => i.title === "Smoke proposal");
    assert.ok(target);
    await repo.updateScheduleItemStatus({
      workspaceId: ws.id,
      scheduleItemId: target.id,
      status: "scheduled",
      actor: "Test Author",
      actorKind: "human",
    });
    const updated = (await repo.listScheduleItems(ws.id)).find((i) => i.id === target.id);
    assert.equal(updated.status, "scheduled");
  });
});

test("Next-Best-Actions ranker", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const snap = await repo.getSnapshot(ws.id);

  await t.test("returns ≤10 actions sorted by score", () => {
    const actions = computeNextBestActions({
      decisions: snap.decisions,
      engagements: snap.engagements,
      artifacts: snap.artifacts,
      knowledge: snap.knowledge,
      schedule: snap.schedule ?? [],
    });
    assert.ok(actions.length <= 10);
    for (let i = 1; i < actions.length; i += 1) {
      const a = actions[i - 1].score ?? 0;
      const b = actions[i].score ?? 0;
      // Allow priority promotion within a 0.05 band; otherwise descending.
      if (Math.abs(a - b) >= 0.05) {
        assert.ok(a >= b, `actions should be score-descending: ${a} vs ${b}`);
      }
    }
  });

  await t.test("pending decisions appear as primary actions", () => {
    const actions = computeNextBestActions({
      decisions: snap.decisions,
      engagements: snap.engagements,
      artifacts: snap.artifacts,
      knowledge: snap.knowledge,
      schedule: snap.schedule ?? [],
    });
    const decisionActions = actions.filter((a) => a.source === "pending-decision");
    assert.ok(decisionActions.length >= 1);
    assert.ok(decisionActions.some((a) => a.priority === "primary"));
  });

  await t.test("audit-gap actions surface decisions with <2 evidence", () => {
    const thinDecision = snap.decisions[0];
    thinDecision.evidenceIds = [];
    const actions = computeNextBestActions({
      decisions: snap.decisions,
      engagements: snap.engagements,
      artifacts: snap.artifacts,
      knowledge: snap.knowledge,
      schedule: snap.schedule ?? [],
    });
    const gap = actions.find((a) => a.source === "audit-gap");
    assert.ok(gap);
  });
});
