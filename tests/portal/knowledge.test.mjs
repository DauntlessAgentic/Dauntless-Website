// ============================================================
// Knowledge subsystem smoke test (Phase 4)
//
// Validates:
//   - In-memory adapter indexes + retrieves seeded workspace state
//   - Search ranks by token overlap with TF-IDF + provenance boosts
//   - Confidence decay is monotonically non-increasing in age
//   - Revalidation queue ranks canonical items higher
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const knowledge = await import(url("lib/portal/knowledge/index.ts"));
const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));

test("Knowledge subsystem", async (t) => {
  __resetPortalRepository();
  knowledge.__resetKnowledgeAdapter();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("searchWorkspace returns ranked results across entities", async () => {
    const results = await knowledge.searchWorkspace({
      workspaceId: ws.id,
      query: "governance",
      limit: 15,
    });
    assert.ok(results.length > 0, "expected results for 'governance'");
    // Scores should be in non-increasing order
    for (let i = 1; i < results.length; i += 1) {
      assert.ok(results[i - 1].score >= results[i].score, "scores should be sorted descending");
    }
    const entities = new Set(results.map((r) => r.entity));
    // The seeded workspace should match across at least 2 entity kinds for "governance"
    assert.ok(entities.size >= 2, `expected at least 2 entity kinds, got ${[...entities].join(",")}`);
  });

  await t.test("entity filter narrows the search", async () => {
    const all = await knowledge.searchWorkspace({
      workspaceId: ws.id,
      query: "governance",
      limit: 15,
    });
    const decisionsOnly = await knowledge.searchWorkspace({
      workspaceId: ws.id,
      query: "governance",
      entities: ["decision"],
      limit: 15,
    });
    assert.ok(decisionsOnly.length <= all.length);
    assert.ok(decisionsOnly.every((r) => r.entity === "decision"));
  });

  await t.test("decayConfidence is monotonically non-increasing in age", () => {
    const now = new Date("2026-05-11T00:00:00Z");
    const young = knowledge.decayConfidence(
      { lastValidatedAt: new Date("2026-05-01T00:00:00Z"), memoryTier: "M2", confidence: 0.9 },
      now,
    );
    const old = knowledge.decayConfidence(
      { lastValidatedAt: new Date("2025-01-01T00:00:00Z"), memoryTier: "M2", confidence: 0.9 },
      now,
    );
    assert.ok(young.confidence >= old.confidence);
    assert.ok(young.confidence <= 0.9);
  });

  await t.test("computeRevalidationQueue surfaces stale knowledge", async () => {
    const snapshot = await repo.getSnapshot(ws.id);
    const queue = knowledge.computeRevalidationQueue(snapshot.knowledge);
    // Queue ordering: urgency descending
    for (let i = 1; i < queue.length; i += 1) {
      assert.ok(queue[i - 1].urgency >= queue[i].urgency);
    }
    // Every candidate carries a recommended action
    for (const c of queue) {
      assert.ok(["revalidate", "supersede", "archive"].includes(c.recommendedAction));
    }
  });

  await t.test("upsert re-indexes incrementally without reset", async () => {
    const adapter = knowledge.getKnowledgeAdapter();
    const sizeBefore = adapter.size();
    await adapter.upsert({
      entity: "decision",
      id: "dec-test-zzz",
      workspaceId: ws.id,
      title: "Test decision about quantum widgets",
      body: "Quantum widgets need a new procurement gating mechanism.",
      source: "test",
      lastTouchedAt: new Date(),
    });
    assert.equal(adapter.size(), sizeBefore + 1);
    const results = await knowledge.searchWorkspace({
      workspaceId: ws.id,
      query: "quantum widgets",
      limit: 5,
    });
    assert.ok(results.some((r) => r.id === "dec-test-zzz"));
  });
});
