// ============================================================
// Unified changelog smoke test
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const { collectChangelog } = await import(url("lib/portal/changelog.ts"));

test("Changelog stream", async (t) => {
  __resetPortalRepository();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();
  const snap = await repo.getSnapshot(ws.id);

  await t.test("returns entries ordered newest first", () => {
    const entries = collectChangelog({
      workspaceId: ws.id,
      auditLog: snap.auditLog,
      signals: snap.signals,
    });
    assert.ok(entries.length > 0);
    for (let i = 1; i < entries.length; i += 1) {
      assert.ok(entries[i - 1].at.getTime() >= entries[i].at.getTime());
    }
  });

  await t.test("limit caps the returned set", () => {
    const limited = collectChangelog(
      {
        workspaceId: ws.id,
        auditLog: snap.auditLog,
        signals: snap.signals,
      },
      { limit: 5 },
    );
    assert.ok(limited.length <= 5);
  });

  await t.test("audit + signal sources both appear", () => {
    const entries = collectChangelog({
      workspaceId: ws.id,
      auditLog: snap.auditLog,
      signals: snap.signals,
    });
    const sources = new Set(entries.map((e) => e.source));
    assert.ok(sources.has("audit"));
    assert.ok(sources.has("signal"));
  });
});
