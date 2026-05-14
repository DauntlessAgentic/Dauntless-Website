// ============================================================
// Portal REST API auth (Phase 9.0)
//
// Phase 9.0 ships a Bearer-token gate driven by PORTAL_API_KEY.
// When unset, the API runs in dev-bypass and accepts every
// request (visible on /portal/governance as an activation gap).
//
// Phase 9.1 wires per-Membership scoped tokens stored in the
// repository.
// ============================================================

import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

import { checkRate, ipKey, tokenKey } from "./rate-limit";

export type ApiAuthResult =
  | { ok: true; tokenLabel: string; mode: "dev-bypass" | "api-key" }
  | { ok: false; status: 401 | 403 | 503; reason: string };

export function authenticateApiRequest(request: NextRequest): ApiAuthResult {
  const configured = process.env.PORTAL_API_KEY;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;

  if (!configured) {
    // Production guard (audit §3.2.B): refuse to serve when no key is
    // set, unless an explicit opt-in escape hatch is provided.
    if (process.env.NODE_ENV === "production" && process.env.PORTAL_ALLOW_OPEN_API !== "true") {
      return {
        ok: false,
        status: 503,
        reason: "PORTAL_API_KEY required in production. Set the env var, or PORTAL_ALLOW_OPEN_API=true to explicitly opt into an unauthenticated API surface.",
      };
    }
    return { ok: true, tokenLabel: "dev-bypass", mode: "dev-bypass" };
  }

  if (!provided) {
    return { ok: false, status: 401, reason: "Bearer token required." };
  }
  // Timing-safe comparison (audit §3.2.A).
  if (!constantTimeEqual(provided, configured)) {
    return { ok: false, status: 403, reason: "Invalid Bearer token." };
  }
  return { ok: true, tokenLabel: "configured", mode: "api-key" };
}

function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function errorResponse(reason: string, status: number): Response {
  return jsonResponse({ error: reason, status }, status);
}

/**
 * Tiny helper: wrap an API handler with the auth check + envelope.
 */
export interface RateLimitOptions {
  cost?: number;
}

export async function withApiAuth<T>(
  request: NextRequest,
  handler: () => Promise<T>,
  options: RateLimitOptions = {},
): Promise<Response> {
  const auth = authenticateApiRequest(request);
  if (!auth.ok) return errorResponse(auth.reason, auth.status);

  // Rate limit: bucket per token (or per IP when in dev-bypass).
  const header = request.headers.get("authorization") ?? "";
  const provided = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;
  const key = provided ? tokenKey(provided) : ipKey(request);
  const rate = checkRate(key, options.cost ?? 1);
  if (!rate.ok) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded.",
        retryAfterSeconds: rate.retryAfterSec,
        status: 429,
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": String(rate.retryAfterSec),
          "x-ratelimit-remaining": String(rate.remaining),
          "x-ratelimit-reset": String(Math.floor(rate.resetAt / 1000)),
        },
      },
    );
  }

  try {
    const result = await handler();
    const response = jsonResponse(result satisfies T);
    response.headers.set("x-ratelimit-remaining", String(rate.remaining));
    response.headers.set("x-ratelimit-reset", String(Math.floor(rate.resetAt / 1000)));
    return response;
  } catch (err) {
    console.error("[api] handler failed:", err);
    return errorResponse("Internal server error.", 500);
  }
}
