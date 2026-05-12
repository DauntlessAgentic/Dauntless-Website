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

import type { NextRequest } from "next/server";

export type ApiAuthResult =
  | { ok: true; tokenLabel: string; mode: "dev-bypass" | "api-key" }
  | { ok: false; status: 401 | 403; reason: string };

export function authenticateApiRequest(request: NextRequest): ApiAuthResult {
  const configured = process.env.PORTAL_API_KEY;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;

  if (!configured) {
    return { ok: true, tokenLabel: "dev-bypass", mode: "dev-bypass" };
  }

  if (!provided) {
    return { ok: false, status: 401, reason: "Bearer token required." };
  }
  if (provided !== configured) {
    return { ok: false, status: 403, reason: "Invalid Bearer token." };
  }
  return { ok: true, tokenLabel: "configured", mode: "api-key" };
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
export async function withApiAuth<T>(
  request: NextRequest,
  handler: () => Promise<T>,
): Promise<Response> {
  const auth = authenticateApiRequest(request);
  if (!auth.ok) return errorResponse(auth.reason, auth.status);
  try {
    const result = await handler();
    return jsonResponse(result satisfies T);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
