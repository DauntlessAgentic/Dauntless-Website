// ============================================================
// Portal API tokens — workspace-scoped, in-memory (pre-launch)
//
// Replaces the single PORTAL_API_KEY env var with a per-workspace
// token list. Pre-launch posture: in-memory only; tokens persist for
// the lifetime of the Node process. Phase 2.1 will durably persist
// these in the Supabase `api_tokens` table without changing the API
// surface.
//
// Token format: `dapt_<32 random hex chars>`
//   - `dapt` prefix = "Dauntless API portal token"
//   - 128 bits of randomness via crypto.randomBytes
//   - displayed once on issuance, then masked everywhere else
//
// Verification is a constant-time compare against the stored hash
// (sha256). The plaintext token never leaves the issuer's response.
// ============================================================

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import type { MembershipRole } from "@/lib/portal/types";

export interface ApiTokenRecord {
  id: string;
  workspaceId: string;
  label: string;
  /** sha256 hex of the plaintext token. */
  hash: string;
  /** First 12 chars of the plaintext token, for display. Never the full key. */
  preview: string;
  /** The role the token's bearer assumes when calling the API. */
  scopeRole: MembershipRole;
  issuedBy: string;
  issuedAt: Date;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}

export interface IssueApiTokenInput {
  workspaceId: string;
  label: string;
  scopeRole: MembershipRole;
  issuedBy: string;
}

export interface IssueApiTokenResult {
  /** The plaintext token. SHOW THIS TO THE USER ONCE. */
  plaintext: string;
  record: ApiTokenRecord;
}

// Process-lifetime storage. Keyed by token id, not the plaintext.
const store = new Map<string, ApiTokenRecord>();

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function generatePlaintext(): { plaintext: string; preview: string } {
  const raw = randomBytes(16).toString("hex"); // 32 chars
  const plaintext = `dapt_${raw}`;
  const preview = plaintext.slice(0, 12);
  return { plaintext, preview };
}

export function issueApiToken(input: IssueApiTokenInput): IssueApiTokenResult {
  const { plaintext, preview } = generatePlaintext();
  const record: ApiTokenRecord = {
    id: `apit-${randomBytes(8).toString("hex")}`,
    workspaceId: input.workspaceId,
    label: input.label.trim() || "Untitled token",
    hash: sha256(plaintext),
    preview,
    scopeRole: input.scopeRole,
    issuedBy: input.issuedBy,
    issuedAt: new Date(),
    lastUsedAt: null,
    revokedAt: null,
  };
  store.set(record.id, record);
  return { plaintext, record };
}

export function revokeApiToken(tokenId: string): boolean {
  const record = store.get(tokenId);
  if (!record || record.revokedAt) return false;
  store.set(tokenId, { ...record, revokedAt: new Date() });
  return true;
}

export interface ListApiTokensOptions {
  workspaceId: string;
  /** Default false — include revoked rows for audit. */
  includeRevoked?: boolean;
}

export function listApiTokens(options: ListApiTokensOptions): ApiTokenRecord[] {
  const rows: ApiTokenRecord[] = [];
  for (const record of store.values()) {
    if (record.workspaceId !== options.workspaceId) continue;
    if (!options.includeRevoked && record.revokedAt) continue;
    rows.push(record);
  }
  return rows.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
}

export interface VerifyApiTokenResult {
  ok: boolean;
  record?: ApiTokenRecord;
}

export function verifyApiToken(presented: string): VerifyApiTokenResult {
  if (!presented.startsWith("dapt_")) return { ok: false };
  const presentedHash = sha256(presented);
  for (const record of store.values()) {
    if (record.revokedAt) continue;
    if (record.hash.length !== presentedHash.length) continue;
    const a = Buffer.from(record.hash, "hex");
    const b = Buffer.from(presentedHash, "hex");
    if (a.length !== b.length) continue;
    if (timingSafeEqual(a, b)) {
      // Touch lastUsedAt on a successful verify, and return the
      // updated record so callers can rely on the timestamp.
      const updated = { ...record, lastUsedAt: new Date() };
      store.set(record.id, updated);
      return { ok: true, record: updated };
    }
  }
  return { ok: false };
}

/**
 * Test-only escape hatch. Clears the in-memory store so each test
 * starts from a clean slate.
 */
export function __resetApiTokenStore(): void {
  store.clear();
}
