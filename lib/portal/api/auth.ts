// ============================================================
// Portal REST API auth (Phase 9.0 + A7 pre-launch hardening)
//
// The portal supports three layered authentication modes:
//
//   1. Workspace-scoped tokens (`dapt_…`) — issued from /portal/api by
//      an owner/executive. Each token has a workspaceId, scopeRole,
//      and audit metadata. Stored in the in-memory token store
//      (lib/portal/api/tokens.ts). Phase 2.1 ports this to Supabase.
//
//   2. PORTAL_API_KEY env var — single shared secret. Legacy / single-
//      operator fallback. Still supported for backward compatibility.
//
//   3. Dev-bypass — when neither token nor env var match, and no env
//      var is configured, every request is accepted with a "dev-bypass"
//      label. Visible on /portal/governance as an activation gap.
// ============================================================

import type { NextRequest } from "next/server";

import { verifyApiToken } from "./tokens";

export type ApiAuthResult =
  | {
      ok: true;
      tokenLabel: string;
      mode: "dev-bypass" | "api-key" | "scoped-token";
      tokenId?: string;
      workspaceId?: string;
      scopeRole?: string;
    }
  | { ok: false; status: 401 | 403; reason: string };

export function authenticateApiRequest(request: NextRequest): ApiAuthResult {
  const configured = process.env.PORTAL_API_KEY;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : null;

  // 1. Scoped token — preferred when present (no env var dependency).
  if (provided && provided.startsWith("dapt_")) {
    const verified = verifyApiToken(provided);
    if (verified.ok && verified.record) {
      return {
        ok: true,
        tokenLabel: verified.record.label,
        mode: "scoped-token",
        tokenId: verified.record.id,
        workspaceId: verified.record.workspaceId,
        scopeRole: verified.record.scopeRole,
      };
    }
    // Token has the right prefix but failed verification → explicit deny.
    return { ok: false, status: 403, reason: "Scoped API token is invalid or revoked." };
  }

  // 2. Env-var fallback.
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
