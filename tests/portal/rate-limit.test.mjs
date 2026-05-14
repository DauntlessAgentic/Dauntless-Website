// ============================================================
// REST API rate limiter smoke test
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { checkRate, __resetRateLimiter, tokenKey, ipKey } = await import(url("lib/portal/api/rate-limit.ts"));

test("Rate limiter", async (t) => {
  __resetRateLimiter();

  await t.test("first burst succeeds", () => {
    const result = checkRate("test-key-1", 1);
    assert.equal(result.ok, true);
    assert.ok(result.remaining >= 0);
  });

  await t.test("exhausting burst returns 429", () => {
    __resetRateLimiter();
    let lastResult;
    for (let i = 0; i < 35; i += 1) {
      lastResult = checkRate("test-key-burst", 1);
    }
    assert.equal(lastResult.ok, false);
    assert.ok(lastResult.retryAfterSec > 0);
  });

  await t.test("expensive cost drains faster", () => {
    __resetRateLimiter();
    const a = checkRate("test-key-cost", 10);
    assert.equal(a.ok, true);
    const b = checkRate("test-key-cost", 20);
    assert.equal(b.ok, true);
    const c = checkRate("test-key-cost", 1);
    // Burst is 30; 10+20=30 = full drain. Next request fails.
    assert.equal(c.ok, false);
  });

  await t.test("buckets refill over time", () => {
    __resetRateLimiter();
    const now = Date.now();
    checkRate("test-key-refill", 30, now);
    const drained = checkRate("test-key-refill", 1, now);
    assert.equal(drained.ok, false);
    // Advance 10 seconds; refill rate is 5/sec → +50 tokens (capped to burst).
    const refilled = checkRate("test-key-refill", 5, now + 10_000);
    assert.equal(refilled.ok, true);
  });

  await t.test("tokenKey produces deterministic SHA256 prefix", () => {
    assert.equal(tokenKey("sek-abc"), tokenKey("sek-abc"));
    assert.notEqual(tokenKey("sek-abc"), tokenKey("sek-xyz"));
    assert.equal(tokenKey(null), "anon");
  });

  await t.test("ipKey prefers x-forwarded-for", () => {
    const request = { headers: { get: (n) => (n === "x-forwarded-for" ? "1.2.3.4, 10.0.0.1" : null) } };
    assert.equal(ipKey(request), "ip:1.2.3.4");
  });
});
