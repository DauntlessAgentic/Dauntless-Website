// ============================================================
// Artifact editor + canonical promotion smoke test (Phase 4.1)
//
// Validates:
//   - saveArtifactBody persists Markdown and emits an audit entry
//   - draftArtifactVersion bumps the version semver-style
//   - proposeArtifactForCanonical lands a pending proposal
//   - recordCanonicalAuditVerdict + approveCanonicalProposal promote
//     the artifact to canonical
//   - rejectCanonicalProposal moves the proposal to rejected
//   - postArtifactComment lands a comment tied to a version
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));

test("Artifact editor + canonical promotion", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("saveArtifactBody persists body + audit entry", async () => {
    const before = await repo.getSnapshot(ws.id);
    const artifact = before.artifacts[0];
    const auditBefore = before.auditLog.length;

    await repo.saveArtifactBody({
      workspaceId: ws.id,
      artifactId: artifact.id,
      body: "# Brand new body\n\nWith a citation [[ev-interview-synthesis]].",
      actor: "Test Editor",
      actorKind: "human",
    });

    const after = await repo.getSnapshot(ws.id);
    const fresh = after.artifacts.find((a) => a.id === artifact.id);
    assert.ok(fresh.body.includes("Brand new body"));
    assert.equal(after.auditLog.length, auditBefore + 1);
  });

  await t.test("draftArtifactVersion bumps semver and stashes body", async () => {
    const before = await repo.getSnapshot(ws.id);
    const artifact = before.artifacts.find((a) => a.id === "art-roadmap");
    const currentVersionId = artifact.currentVersionId;
    const prevVersion = artifact.versions.find((v) => v.id === currentVersionId).version;

    const newVersion = await repo.draftArtifactVersion({
      workspaceId: ws.id,
      artifactId: artifact.id,
      versionBump: "minor",
      summary: "Reworked Horizon-3 sequencing.",
      body: "# Updated body",
      actor: "Test Author",
      actorKind: "human",
    });

    // Naive semver bump: minor of 0.4.0 = 0.5.0
    assert.notEqual(newVersion.version, prevVersion);
    const after = await repo.getSnapshot(ws.id);
    const fresh = after.artifacts.find((a) => a.id === artifact.id);
    assert.equal(fresh.currentVersionId, newVersion.id);
    assert.equal(fresh.reviewState, "in-review");
  });

  await t.test("canonical proposal: propose → audit → approve flow", async () => {
    __resetPortalRepository();
    const fresh = getPortalRepository();
    const w = await fresh.getDefaultWorkspace();
    const snap = await fresh.getSnapshot(w.id);
    // Pick a non-canonical artifact
    const target = snap.artifacts.find((a) => !a.canonical);
    assert.ok(target);

    await fresh.proposeArtifactForCanonical({
      workspaceId: w.id,
      artifactId: target.id,
      proposedBy: "Test Proposer",
      proposedByKind: "human",
    });

    let after = await fresh.getSnapshot(w.id);
    let proposalRow = after.artifacts.find((a) => a.id === target.id);
    assert.equal(proposalRow.canonicalProposal.status, "pending");

    await fresh.recordCanonicalAuditVerdict({
      workspaceId: w.id,
      artifactId: target.id,
      verdict: "pass",
      notes: "Smoke-test audit verdict.",
      auditedBy: "agent-governance-auditor",
    });

    after = await fresh.getSnapshot(w.id);
    proposalRow = after.artifacts.find((a) => a.id === target.id);
    assert.equal(proposalRow.canonicalProposal.auditVerdict, "pass");

    await fresh.approveCanonicalProposal({
      workspaceId: w.id,
      artifactId: target.id,
      actor: "Test Approver",
      actorKind: "human",
    });

    after = await fresh.getSnapshot(w.id);
    proposalRow = after.artifacts.find((a) => a.id === target.id);
    assert.equal(proposalRow.canonical, true);
    assert.equal(proposalRow.canonicalProposal.status, "approved");

    const knowledgePromotionSignal = after.signals.find(
      (s) => s.kind === "knowledge-promoted" && s.refId === target.id && s.title.startsWith("Canonical approved"),
    );
    assert.ok(knowledgePromotionSignal, "expected a Canonical approved signal");
  });

  await t.test("rejectCanonicalProposal moves to rejected", async () => {
    __resetPortalRepository();
    const fresh = getPortalRepository();
    const w = await fresh.getDefaultWorkspace();
    const snap = await fresh.getSnapshot(w.id);
    const target = snap.artifacts.find((a) => !a.canonical);
    await fresh.proposeArtifactForCanonical({
      workspaceId: w.id,
      artifactId: target.id,
      proposedBy: "Test Proposer",
      proposedByKind: "human",
    });
    await fresh.rejectCanonicalProposal({
      workspaceId: w.id,
      artifactId: target.id,
      actor: "Test Reviewer",
      actorKind: "human",
      reason: "Evidence chain too thin.",
    });
    const after = await fresh.getSnapshot(w.id);
    const row = after.artifacts.find((a) => a.id === target.id);
    assert.equal(row.canonicalProposal.status, "rejected");
    assert.equal(row.canonical, false);
  });

  await t.test("comments thread is tied to a version", async () => {
    __resetPortalRepository();
    const fresh = getPortalRepository();
    const w = await fresh.getDefaultWorkspace();
    const snap = await fresh.getSnapshot(w.id);
    const target = snap.artifacts[0];

    const comment = await fresh.postArtifactComment({
      workspaceId: w.id,
      artifactId: target.id,
      versionId: target.currentVersionId,
      body: "Smoke comment.",
      author: "Reviewer",
      authorKind: "human",
    });
    assert.equal(comment.resolved, false);

    await fresh.resolveArtifactComment({
      workspaceId: w.id,
      artifactId: target.id,
      commentId: comment.id,
      actor: "Reviewer",
    });
    const after = await fresh.getSnapshot(w.id);
    const ref = after.artifacts.find((a) => a.id === target.id);
    const stored = ref.comments.find((c) => c.id === comment.id);
    assert.equal(stored.resolved, true);
  });
});
