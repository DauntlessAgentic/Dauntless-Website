// ============================================================
// Outbound action sandbox smoke test (Phase 11.0)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const { listConnectors } = await import(url("lib/portal/outbound-actions/connectors.ts"));
const store = await import(url("lib/portal/outbound-actions/store.ts"));

test("Outbound actions", async (t) => {
  __resetPortalRepository();
  store.__resetOutboundActions();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("connector catalog lists at least 6 connectors", () => {
    const connectors = listConnectors({});
    assert.ok(connectors.length >= 6);
    assert.ok(connectors.some((c) => c.id === "internal" && c.connected));
  });

  await t.test("propose → approve → commit lifecycle", async () => {
    const proposed = await store.proposeOutboundAction({
      workspaceId: ws.id,
      connectorId: "jira",
      capabilityId: "create-issue",
      title: "File RFC-201 follow-up",
      description: "Open a tracking issue for the procurement gate slip.",
      proposedBy: "Test Author",
      proposedByKind: "human",
      payload: { project: "TBS", summary: "Procurement gate slip" },
    });
    assert.equal(proposed.status, "proposed");
    assert.ok(proposed.inversePlan.length >= 1);

    const approved = await store.approveOutboundAction({
      workspaceId: ws.id,
      actionId: proposed.id,
      actor: "Test Approver",
      actorKind: "human",
    });
    assert.equal(approved.status, "approved");

    const committed = await store.commitOutboundAction({
      workspaceId: ws.id,
      actionId: proposed.id,
      actor: "Test Approver",
      actorKind: "human",
    });
    assert.equal(committed.status, "committed");
    assert.ok(committed.committedAt);

    const list = store.listOutboundActions(ws.id);
    assert.ok(list.some((a) => a.id === proposed.id && a.status === "committed"));
  });

  await t.test("dry-run does not commit", async () => {
    const proposed = await store.proposeOutboundAction({
      workspaceId: ws.id,
      connectorId: "internal",
      capabilityId: "post-signal",
      title: "Signal smoke",
      description: "Post a smoke signal.",
      proposedBy: "Test Author",
      proposedByKind: "human",
      payload: { message: "smoke" },
    });
    await store.approveOutboundAction({
      workspaceId: ws.id,
      actionId: proposed.id,
      actor: "Test Approver",
      actorKind: "human",
    });
    const dryRun = await store.commitOutboundAction({
      workspaceId: ws.id,
      actionId: proposed.id,
      actor: "Test Approver",
      actorKind: "human",
      dryRunOnly: true,
    });
    assert.equal(dryRun.status, "dry-run");
    assert.ok(dryRun.dryRunOutput);
  });

  await t.test("rollback marks status rolled-back", async () => {
    const proposed = await store.proposeOutboundAction({
      workspaceId: ws.id,
      connectorId: "hubspot",
      capabilityId: "create-deal",
      title: "Rollback smoke",
      description: "Will be rolled back.",
      proposedBy: "Test Author",
      proposedByKind: "human",
      payload: { name: "Smoke deal" },
    });
    await store.approveOutboundAction({
      workspaceId: ws.id,
      actionId: proposed.id,
      actor: "Test Approver",
      actorKind: "human",
    });
    await store.commitOutboundAction({
      workspaceId: ws.id,
      actionId: proposed.id,
      actor: "Test Approver",
      actorKind: "human",
    });
    const rolledBack = await store.rollbackOutboundAction({
      workspaceId: ws.id,
      actionId: proposed.id,
      actor: "Test Approver",
      reason: "Wrong workspace.",
    });
    assert.equal(rolledBack.status, "rolled-back");
  });

  await t.test("approving a non-existent action throws", async () => {
    await assert.rejects(() =>
      store.approveOutboundAction({
        workspaceId: ws.id,
        actionId: "oa-does-not-exist",
        actor: "Test",
        actorKind: "human",
      }),
    );
  });
});
