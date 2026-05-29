// ============================================================
// Auth runtime launch posture
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { getAuthRuntimeState } = await import(url("lib/auth/runtime.ts"));

test("Auth runtime launch posture", async (t) => {
  await t.test("production without OAuth or demo flag is auth-unavailable", () => {
    const state = getAuthRuntimeState({
      NODE_ENV: "production",
    });
    assert.equal(state.mode, "auth-unavailable");
    assert.equal(state.isDevBypassEnabled, false);
    assert.equal(state.isDemoMode, false);
  });

  await t.test("production demo mode requires an explicit flag", () => {
    const state = getAuthRuntimeState({
      NODE_ENV: "production",
      PORTAL_DEMO_MODE: "true",
    });
    assert.equal(state.mode, "demo");
    assert.equal(state.isDevBypassEnabled, true);
    assert.equal(state.isDemoMode, true);
  });

  await t.test("production with OAuth configured uses oauth mode", () => {
    const state = getAuthRuntimeState({
      NODE_ENV: "production",
      AUTH_GOOGLE_ID: "google-client-id",
      AUTH_GOOGLE_SECRET: "google-client-secret",
    });
    assert.equal(state.mode, "oauth-configured");
    assert.equal(state.isConfigured, true);
    assert.equal(state.isDevBypassEnabled, false);
  });

  await t.test("local development still boots without OAuth", () => {
    const state = getAuthRuntimeState({
      NODE_ENV: "development",
    });
    assert.equal(state.mode, "dev-bypass");
    assert.equal(state.isDevBypassEnabled, true);
  });
});
