// Smoke tests for workspace-scoped API tokens (A7 pre-launch).
//
// Backed by the in-memory store at lib/portal/api/tokens.ts. Pre-launch
// posture is in-memory only; tokens persist for the lifetime of the Node
// process. Phase 2.1 ports this to the Supabase `api_tokens` table without
// changing the API surface.

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const {
  __resetApiTokenStore,
  issueApiToken,
  listApiTokens,
  revokeApiToken,
  verifyApiToken,
} = await import(url("lib/portal/api/tokens.ts"));

const { authenticateApiRequest } = await import(url("lib/portal/api/auth.ts"));

function fakeRequest(headers = {}) {
  return { headers: { get: (name) => headers[name.toLowerCase()] ?? null } };
}

test("issueApiToken returns plaintext once and stores only the hash + preview", () => {
  __resetApiTokenStore();
  const { plaintext, record } = issueApiToken({
    workspaceId: "ws-test",
    label: "Ops dashboard",
    scopeRole: "viewer",
    issuedBy: "test-runner",
  });
  assert.match(plaintext, /^dapt_[a-f0-9]{32}$/, "Plaintext must follow dapt_<32hex> format");
  assert.equal(record.preview.length, 12, "Preview is the first 12 chars");
  assert.equal(record.label, "Ops dashboard");
  assert.equal(record.scopeRole, "viewer");
  assert.equal(record.revokedAt, null);
  assert.equal(record.lastUsedAt, null);
});

test("verifyApiToken returns ok for the plaintext that was just issued", () => {
  __resetApiTokenStore();
  const { plaintext, record } = issueApiToken({
    workspaceId: "ws-test",
    label: "Read",
    scopeRole: "viewer",
    issuedBy: "test-runner",
  });
  const result = verifyApiToken(plaintext);
  assert.equal(result.ok, true);
  assert.equal(result.record?.id, record.id);
});

test("verifyApiToken rejects an unknown token", () => {
  __resetApiTokenStore();
  issueApiToken({ workspaceId: "ws-test", label: "L", scopeRole: "viewer", issuedBy: "x" });
  const result = verifyApiToken("dapt_deadbeefdeadbeefdeadbeefdeadbeef");
  assert.equal(result.ok, false);
});

test("verifyApiToken rejects a token without the dapt_ prefix", () => {
  __resetApiTokenStore();
  const result = verifyApiToken("legacy-shared-secret");
  assert.equal(result.ok, false);
});

test("revokeApiToken marks the token as revoked and verifyApiToken refuses", () => {
  __resetApiTokenStore();
  const { plaintext, record } = issueApiToken({
    workspaceId: "ws-test",
    label: "Temp",
    scopeRole: "lead",
    issuedBy: "test-runner",
  });
  const revoked = revokeApiToken(record.id);
  assert.equal(revoked, true);
  const verify = verifyApiToken(plaintext);
  assert.equal(verify.ok, false);
});

test("revokeApiToken is idempotent — second call returns false", () => {
  __resetApiTokenStore();
  const { record } = issueApiToken({
    workspaceId: "ws-test",
    label: "Once",
    scopeRole: "viewer",
    issuedBy: "test-runner",
  });
  assert.equal(revokeApiToken(record.id), true);
  assert.equal(revokeApiToken(record.id), false);
});

test("listApiTokens scopes by workspaceId and hides revoked rows by default", () => {
  __resetApiTokenStore();
  const a = issueApiToken({ workspaceId: "ws-a", label: "A1", scopeRole: "viewer", issuedBy: "x" });
  issueApiToken({ workspaceId: "ws-a", label: "A2", scopeRole: "lead", issuedBy: "x" });
  issueApiToken({ workspaceId: "ws-b", label: "B1", scopeRole: "viewer", issuedBy: "x" });
  revokeApiToken(a.record.id);

  const visible = listApiTokens({ workspaceId: "ws-a" });
  assert.equal(visible.length, 1, "Revoked rows should be hidden by default");
  assert.equal(visible[0].label, "A2");

  const withRevoked = listApiTokens({ workspaceId: "ws-a", includeRevoked: true });
  assert.equal(withRevoked.length, 2);

  const otherWorkspace = listApiTokens({ workspaceId: "ws-b" });
  assert.equal(otherWorkspace.length, 1);
  assert.equal(otherWorkspace[0].label, "B1");
});

test("verifyApiToken updates lastUsedAt on success", () => {
  __resetApiTokenStore();
  const { plaintext, record } = issueApiToken({
    workspaceId: "ws-test",
    label: "Tracked",
    scopeRole: "viewer",
    issuedBy: "x",
  });
  assert.equal(record.lastUsedAt, null);
  const result = verifyApiToken(plaintext);
  assert.equal(result.ok, true);
  assert.notEqual(result.record?.lastUsedAt, null);
});

test("authenticateApiRequest prefers a valid scoped token over PORTAL_API_KEY", () => {
  __resetApiTokenStore();
  process.env.PORTAL_API_KEY = "sek-secret";
  const { plaintext } = issueApiToken({
    workspaceId: "ws-test",
    label: "API gateway",
    scopeRole: "lead",
    issuedBy: "x",
  });
  const result = authenticateApiRequest(fakeRequest({ authorization: `Bearer ${plaintext}` }));
  assert.equal(result.ok, true);
  assert.equal(result.mode, "scoped-token");
  assert.equal(result.scopeRole, "lead");
  delete process.env.PORTAL_API_KEY;
});

test("authenticateApiRequest rejects a revoked scoped token even when PORTAL_API_KEY is set", () => {
  __resetApiTokenStore();
  process.env.PORTAL_API_KEY = "sek-secret";
  const { plaintext, record } = issueApiToken({
    workspaceId: "ws-test",
    label: "Soon-revoked",
    scopeRole: "viewer",
    issuedBy: "x",
  });
  revokeApiToken(record.id);
  const result = authenticateApiRequest(fakeRequest({ authorization: `Bearer ${plaintext}` }));
  assert.equal(result.ok, false);
  assert.equal(result.status, 403);
  delete process.env.PORTAL_API_KEY;
});
