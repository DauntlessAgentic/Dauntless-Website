// ============================================================
// Repository contract smoke test (Phase 2)
//
// Run with: node --test tests/portal/repository.test.mjs
//
// Lightweight by design: validates that the in-memory repository
// fulfils the read + write contract, that mutations append to the
// audit log, and that decision/promotion state transitions are
// observable on subsequent reads.
//
// We import the TypeScript source through the Next.js build's
// transpiled output. For zero-dep CI compatibility we instead
// re-implement a tiny TS loader at test time by relying on tsx
// when available; otherwise we skip with a clear message.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

async function loadRepositoryModule() {
  try {
    // tsx registers a hook that lets us import .ts files directly.
    await import("tsx/esm");
  } catch {
    return null;
  }
  const target = path.join(repoRoot, "lib", "portal", "repositories", "in-memory.ts");
  return import(pathToFileURL(target).href);
}

test("portal repository: in-memory contract", async (t) => {
  const mod = await loadRepositoryModule();
  if (!mod) {
    t.diagnostic("tsx not installed; skipping. Install with `npm install -D tsx`.");
    return;
  }
  const { InMemoryPortalRepository } = mod;
  const repo = new InMemoryPortalRepository();

  await t.test("getDefaultWorkspace returns the seeded workspace", async () => {
    const ws = await repo.getDefaultWorkspace();
    assert.equal(typeof ws.id, "string");
    assert.equal(ws.id, "ws-tbs-ai-modernization");
  });

  await t.test("getSnapshot returns all entity slices populated", async () => {
    const ws = await repo.getDefaultWorkspace();
    const snap = await repo.getSnapshot(ws.id);
    assert.ok(snap.engagements.length >= 3, "expected 3+ engagements");
    assert.ok(snap.decisions.length >= 5, "expected 5+ decisions");
    assert.ok(snap.knowledge.length >= 10, "expected 10+ knowledge items");
    assert.ok(snap.auditLog.length >= 1);
  });

  await t.test("approving a decision appends an audit entry and emits a signal", async () => {
    const ws = await repo.getDefaultWorkspace();
    const before = await repo.getSnapshot(ws.id);
    const pending = before.decisions.find((d) => d.status === "pending-approval");
    assert.ok(pending, "expected at least one pending decision in seed");

    const auditCountBefore = before.auditLog.length;
    const signalCountBefore = before.signals.length;

    const updated = await repo.recordDecisionOutcome({
      decisionId: pending.id,
      workspaceId: ws.id,
      actor: "Test Reviewer",
      actorKind: "human",
      outcome: "approved",
      notes: "Smoke-test approval.",
    });

    assert.equal(updated.status, "approved");
    assert.equal(updated.decidedBy, "Test Reviewer");

    const after = await repo.getSnapshot(ws.id);
    assert.equal(after.auditLog.length, auditCountBefore + 1);
    assert.equal(after.signals.length, signalCountBefore + 1);
    const newEntry = after.auditLog.at(-1);
    assert.equal(newEntry.action, "decision-approved");
    assert.equal(newEntry.refId, pending.id);
  });

  await t.test("promoting knowledge sets canonical + Bookshelf + audit", async () => {
    const ws = await repo.getDefaultWorkspace();
    const before = await repo.getSnapshot(ws.id);
    const candidate = before.knowledge.find((k) => !k.canonical);
    assert.ok(candidate, "expected at least one non-canonical knowledge item");

    const result = await repo.promoteKnowledgeToCanonical({
      knowledgeId: candidate.id,
      workspaceId: ws.id,
      actor: "Test Auditor",
      actorKind: "human",
      promotionNotes: "Smoke-test promotion.",
    });

    assert.equal(result.canonical, true);
    assert.equal(result.shelf, "bookshelf");
    assert.ok(result.promotedAt);

    const after = await repo.getSnapshot(ws.id);
    assert.equal(
      after.knowledge.find((k) => k.id === candidate.id)?.canonical,
      true,
    );
    const recentAudit = after.auditLog.at(-1);
    assert.equal(recentAudit.refId, candidate.id);
  });

  await t.test("workspace isolation: foreign workspaceId throws", async () => {
    await assert.rejects(() => repo.getSnapshot("ws-other"), /Unknown workspaceId/);
  });
});
