// ============================================================
// Weekly digest smoke test (Advisory actions #13 + #20)
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
const { __resetInnovationEngine } = await import(url("lib/portal/innovation/engine.ts"));
const { buildThisWeekDigest } = await import(url("lib/portal/digests/this-week.ts"));
const { renderWeeklyDigest } = await import(url("lib/portal/digests/weekly-render.ts"));

test("Weekly digest", async (t) => {
  __resetPortalRepository();
  __resetPortalEvents();
  __resetInnovationEngine();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("buildThisWeekDigest returns structured payload", async () => {
    const digest = await buildThisWeekDigest({ workspaceId: ws.id, role: "executive" });
    assert.ok(typeof digest.windowDays === "number");
    assert.ok(Array.isArray(digest.items));
    assert.ok(typeof digest.summary.urgent === "number");
    assert.equal(digest.forRole, "executive");
    for (const item of digest.items) {
      assert.ok(item.title);
      assert.ok(item.detail);
      assert.ok(item.href.startsWith("/portal/"));
    }
  });

  await t.test("renderWeeklyDigest produces subject + html + text", async () => {
    const digest = await buildThisWeekDigest({ workspaceId: ws.id, role: "executive" });
    const render = renderWeeklyDigest(ws.name, digest);
    assert.ok(render.subject.includes(ws.name));
    assert.ok(render.html.startsWith("<!DOCTYPE html>"));
    assert.ok(render.text.length > 0);
    // No tag leakage in plain text
    assert.equal(render.text.includes("<table"), false);
  });

  await t.test("subject reflects urgency tier", async () => {
    const digest = await buildThisWeekDigest({ workspaceId: ws.id, role: "executive" });
    const render = renderWeeklyDigest(ws.name, digest);
    if (digest.summary.urgent > 0) {
      assert.match(render.subject, /urgent/);
    } else if (digest.summary.notable > 0) {
      assert.match(render.subject, /review/);
    } else {
      assert.match(render.subject, /All clear/i);
    }
  });
});
