// ============================================================
// REST API rate limiter (Phase 9.1 partial)
//
// Per-token + per-IP token-bucket limiter, in-process. Phase 9.2
// swaps to a Redis-backed bucket once scoped tokens land. Closes
// audit finding §3.2.D.
//
// Keys:
//   - "ip:<x-forwarded-for-or-remote-addr>"
//   - "token:<sha256(bearer)>"
//   - "anon" (dev-bypass)
//
// Buckets refill at `RATE_REFILL_PER_SEC` tokens/sec up to a
// `RATE_BURST` cap. Each request costs 1 token by default; agent
// runs cost more (they're expensive).
// ============================================================

import { createHash } from "node:crypto";

const RATE_REFILL_PER_SEC = Number(process.env.PORTAL_API_RATE_REFILL ?? 5);
const RATE_BURST = Number(process.env.PORTAL_API_RATE_BURST ?? 30);

interface Bucket {
  tokens: number;
  refilledAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 4096;

export interface RateCheckResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export function checkRate(key: string, cost = 1, now: number = Date.now()): RateCheckResult {
  if (buckets.size > MAX_BUCKETS) garbageCollect(now);
  const existing = buckets.get(key);
  const bucket = existing ?? { tokens: RATE_BURST, refilledAt: now };
  // Refill since last touch.
  const elapsedSec = Math.max(0, (now - bucket.refilledAt) / 1000);
  const refill = elapsedSec * RATE_REFILL_PER_SEC;
  bucket.tokens = Math.min(RATE_BURST, bucket.tokens + refill);
  bucket.refilledAt = now;

  if (bucket.tokens < cost) {
    const deficit = cost - bucket.tokens;
    const retryAfterSec = Math.ceil(deficit / RATE_REFILL_PER_SEC);
    buckets.set(key, bucket);
    return {
      ok: false,
      remaining: Math.floor(bucket.tokens),
      resetAt: now + retryAfterSec * 1000,
      retryAfterSec,
    };
  }
  bucket.tokens -= cost;
  buckets.set(key, bucket);
  return {
    ok: true,
    remaining: Math.floor(bucket.tokens),
    resetAt: now + Math.ceil((RATE_BURST - bucket.tokens) / RATE_REFILL_PER_SEC) * 1000,
    retryAfterSec: 0,
  };
}

export function tokenKey(bearer: string | null | undefined): string {
  if (!bearer) return "anon";
  const hash = createHash("sha256").update(bearer).digest("hex").slice(0, 12);
  return `token:${hash}`;
}

export function ipKey(request: Request): string {
  // X-Forwarded-For is comma-separated; first entry is the client.
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    if (ip) return `ip:${ip}`;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return `ip:${real.trim()}`;
  return "ip:unknown";
}

function garbageCollect(now: number): void {
  // Drop buckets idle for more than 5 minutes.
  const threshold = now - 5 * 60 * 1000;
  for (const [key, bucket] of buckets) {
    if (bucket.refilledAt < threshold) buckets.delete(key);
  }
}

/** Test-only escape hatch. */
export function __resetRateLimiter(): void {
  buckets.clear();
}
