// ============================================================
// Outbound-action safety primitives (advisory-board actions #16 + #19)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const store = await import(url("lib/portal/outbound-actions/store.ts"));
const {
  enableConnector,
  isConnectorEnabled,
  listEnabledConnectors,
  __resetEnabledConnectors,
} = await import(url("lib/portal/outbound-actions/enabled-connectors.ts"));
const {
  freezeWorkspace,
  unfreezeWorkspace,
  isWorkspaceFrozen,
  __resetWorkspaceFreezes,
} = await import(url("lib/portal/outbound-actions/freeze.ts"));

test("Outbound-action safety primitives", async (t) => {
  __resetPortalRepository();
  store.__resetOutboundActions();
  __resetEnabledConnectors();
  __resetWorkspaceFreezes();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("workspaces start with only `internal` connector enabled", () => {
    const enabled = listEnabledConnectors(ws.id);
    assert.deepEqual(enabled, ["internal"]);
    assert.equal(isConnectorEnabled(ws.id, "internal"), true);
    assert.equal(isConnectorEnabled(ws.id, "jira"), false);
  });

  await t.test("propose refuses unenabled connectors", async () => {
    await assert.rejects(
      () =>
        store.proposeOutboundAction({
          workspaceId: ws.id,
          connectorId: "jira",
          capabilityId: "create-issue",
          title: "Should refuse",
          description: "Jira is not enabled.",
          proposedBy: "Test",
          proposedByKind: "human",
          payload: { project: "TBS", summary: "anything" },
        }),
      /not enabled for this workspace/,
    );
  });

  await t.test("enabling a connector permits propose", async () => {
    await enableConnector({ workspaceId: ws.id, connectorId: "jira", actor: "Owner" });
    assert.equal(isConnectorEnabled(ws.id, "jira"), true);
    const proposed = await store.proposeOutboundAction({
      workspaceId: ws.id,
      connectorId: "jira",
      capabilityId: "create-issue",
      title: "Now permitted",
      description: "Jira is enabled.",
      proposedBy: "Test",
      proposedByKind: "human",
      payload: { project: "TBS", summary: "Procurement gate slip" },
    });
    assert.equal(proposed.status, "proposed");
  });

  await t.test("freezing the workspace blocks commit", async () => {
    const proposed = await store.proposeOutboundAction({
      workspaceId: ws.id,
      connectorId: "jira",
      capabilityId: "create-issue",
      title: "Freeze test",
      description: "Will be frozen mid-flight.",
      proposedBy: "Test",
      proposedByKind: "human",
      payload: { project: "TBS", summary: "Freeze test" },
    });
    await store.approveOutboundAction({
      workspaceId: ws.id,
      actionId: proposed.id,
      actor: "Approver",
      actorKind: "human",
    });
    await freezeWorkspace({
      workspaceId: ws.id,
      actor: "Owner",
      reason: "Investigating an unexpected agent run.",
    });
    assert.ok(isWorkspaceFrozen(ws.id));
    await assert.rejects(
      () =>
        store.commitOutboundAction({
          workspaceId: ws.id,
          actionId: proposed.id,
          actor: "Approver",
          actorKind: "human",
        }),
      /frozen for this workspace/,
    );
  });

  await t.test("unfreezing restores commits", async () => {
    await unfreezeWorkspace({ workspaceId: ws.id, actor: "Owner" });
    assert.equal(isWorkspaceFrozen(ws.id), null);
    // The previously-approved action should now commit fine.
    const list = store.listOutboundActions(ws.id);
    const approved = list.find((a) => a.status === "approved");
    assert.ok(approved);
    const committed = await store.commitOutboundAction({
      workspaceId: ws.id,
      actionId: approved.id,
      actor: "Approver",
      actorKind: "human",
    });
    assert.equal(committed.status, "committed");
  });

  await t.test("freeze + unfreeze write audit entries", async () => {
    const auditBefore = (await repo.listAuditLog(ws.id, 500)).length;
    await freezeWorkspace({ workspaceId: ws.id, actor: "Owner", reason: "test" });
    await unfreezeWorkspace({ workspaceId: ws.id, actor: "Owner" });
    const auditAfter = await repo.listAuditLog(ws.id, 500);
    assert.ok(auditAfter.length >= auditBefore + 2);
    const detail = auditAfter.map((e) => e.detail).join("\n");
    assert.match(detail, /froze outbound actions/);
    assert.match(detail, /un-froze outbound actions/);
  });
});
