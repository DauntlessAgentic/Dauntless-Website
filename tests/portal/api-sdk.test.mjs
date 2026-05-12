// ============================================================
// REST API auth + SDK smoke test (Phase 9.0)
//
// We test the auth helper + SDK against a stubbed fetch. The
// route handlers themselves are exercised at runtime; this suite
// keeps them honest at the unit level.
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetWebhookEvents, emitWebhook, listWebhookEvents } = await import(url("lib/portal/webhooks.ts"));
const { authenticateApiRequest } = await import(url("lib/portal/api/auth.ts"));
const sdk = await import(url("lib/portal-sdk/index.ts"));

function fakeRequest(headers = {}) {
  return { headers: { get: (name) => headers[name.toLowerCase()] ?? null } };
}

test("API auth", async (t) => {
  await t.test("dev-bypass when PORTAL_API_KEY is unset", () => {
    delete process.env.PORTAL_API_KEY;
    const result = authenticateApiRequest(fakeRequest());
    assert.equal(result.ok, true);
    assert.equal(result.mode, "dev-bypass");
  });

  await t.test("rejects missing bearer when configured", () => {
    process.env.PORTAL_API_KEY = "sek-secret";
    const result = authenticateApiRequest(fakeRequest());
    assert.equal(result.ok, false);
    assert.equal(result.status, 401);
  });

  await t.test("rejects wrong bearer when configured", () => {
    process.env.PORTAL_API_KEY = "sek-secret";
    const result = authenticateApiRequest(fakeRequest({ authorization: "Bearer wrong" }));
    assert.equal(result.ok, false);
    assert.equal(result.status, 403);
  });

  await t.test("accepts correct bearer when configured", () => {
    process.env.PORTAL_API_KEY = "sek-secret";
    const result = authenticateApiRequest(fakeRequest({ authorization: "Bearer sek-secret" }));
    assert.equal(result.ok, true);
    assert.equal(result.mode, "api-key");
  });
});

test("Webhook ledger", async (t) => {
  __resetWebhookEvents();
  emitWebhook({ kind: "decision-outcome", workspaceId: "ws-x", payload: { decisionId: "dec-1", outcome: "approved" } });
  emitWebhook({ kind: "schedule-item-proposed", workspaceId: "ws-x", payload: { scheduleItemId: "sch-1" } });

  await t.test("recent events are recorded with newest-first ordering", () => {
    const rows = listWebhookEvents({ limit: 5 });
    assert.equal(rows.length, 2);
    const kinds = rows.map((r) => r.kind);
    assert.ok(kinds.includes("schedule-item-proposed"));
    assert.ok(kinds.includes("decision-outcome"));
    // Newest first: the row at index 0 must not be older than row[1].
    assert.ok(rows[0].at.getTime() >= rows[1].at.getTime());
  });

  await t.test("filter by kind narrows correctly", () => {
    const rows = listWebhookEvents({ kind: "decision-outcome" });
    assert.equal(rows.length, 1);
  });
});

test("Portal SDK", async (t) => {
  await t.test("attaches Bearer header when apiKey is set", async () => {
    let lastInit;
    const stub = async (url, init) => {
      lastInit = init;
      return new Response(JSON.stringify({ workspaceId: "ws-x", engagements: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };
    const client = sdk.createPortalClient({
      baseUrl: "https://portal.example",
      apiKey: "sek-test",
      fetch: stub,
    });
    await client.engagements.list();
    assert.equal(lastInit.method, "GET");
    assert.equal(lastInit.headers.authorization, "Bearer sek-test");
  });

  await t.test("recordOutcome posts a JSON body and returns the decision", async () => {
    const stub = async (url, init) => {
      assert.equal(init.method, "POST");
      const body = JSON.parse(init.body);
      assert.equal(body.decisionId, "dec-y");
      return new Response(JSON.stringify({ decision: { id: "dec-y", status: "approved" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };
    const client = sdk.createPortalClient({ baseUrl: "https://portal.example", fetch: stub });
    const result = await client.decisions.recordOutcome({ decisionId: "dec-y", outcome: "approved" });
    assert.equal(result.decision.status, "approved");
  });

  await t.test("throws PortalApiError on non-2xx", async () => {
    const stub = async () =>
      new Response(JSON.stringify({ error: "nope", status: 403 }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    const client = sdk.createPortalClient({ baseUrl: "https://portal.example", fetch: stub });
    await assert.rejects(() => client.engagements.list(), (err) => {
      assert.equal(err.name, "PortalApiError");
      assert.equal(err.status, 403);
      assert.match(err.message, /nope/);
      return true;
    });
  });
});
