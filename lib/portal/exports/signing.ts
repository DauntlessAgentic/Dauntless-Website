// ============================================================
// Evidence export signing (Phase D)
//
// HMAC-SHA256 signatures over exported Markdown bundles. Each
// workspace gets its own signing key, derived from the master
// `PORTAL_EXPORT_SIGNING_KEY` env var via HKDF-style HMAC. The
// derived key never leaves the server.
//
// Closes audit findings:
//   §8.A — webhook signing helper, reused here
//   §10.A — signed audit-log exports
//
// Bundle format: the original Markdown body, followed by a
// fenced HTML-comment footer that holds the signature manifest.
// Verification: re-compute HMAC over the body (everything before
// the footer marker) using the per-workspace key.
// ============================================================

import { createHash, createHmac, randomBytes } from "node:crypto";

const FOOTER_OPEN = "<!-- DAUNTLESS-EVIDENCE-SIGNATURE-V1";
const FOOTER_CLOSE = "END-SIGNATURE -->";
const SIGNATURE_VERSION = "v1";

export interface SignBundleInput {
  workspaceId: string;
  body: string;
  memberId: string;
  memberLabel: string;
  bundleKind: "impact-report" | "audit-log" | "evidence";
  generatedAt?: Date;
}

export interface SignedBundle {
  markdown: string;
  manifest: SignatureManifest;
}

export interface SignatureManifest {
  version: string;
  workspaceId: string;
  bundleKind: SignBundleInput["bundleKind"];
  memberId: string;
  memberLabel: string;
  generatedAt: string;
  bodySha256: string;
  signature: string;
  algorithm: "HMAC-SHA256";
  keyId: string;
}

/**
 * Sign a Markdown bundle for export. Appends a watermark line and
 * a signature footer so downstream readers can verify provenance.
 */
export function signBundle(input: SignBundleInput): SignedBundle {
  const generatedAt = input.generatedAt ?? new Date();
  // Canonical body: watermark applied, trailing whitespace trimmed.
  // Verification re-derives the body via the same trim, so signatures
  // are stable across newline normalisation by editors.
  const watermarked = appendWatermark(input.body, input.memberLabel, generatedAt).replace(/\s+$/, "");
  const bodySha256 = sha256Hex(watermarked);
  const key = deriveWorkspaceKey(input.workspaceId);
  const keyId = workspaceKeyId(input.workspaceId);
  const signature = createHmac("sha256", key).update(watermarked).digest("hex");
  const manifest: SignatureManifest = {
    version: SIGNATURE_VERSION,
    workspaceId: input.workspaceId,
    bundleKind: input.bundleKind,
    memberId: input.memberId,
    memberLabel: input.memberLabel,
    generatedAt: generatedAt.toISOString(),
    bodySha256,
    signature,
    algorithm: "HMAC-SHA256",
    keyId,
  };
  const markdown = `${watermarked}\n\n${renderFooter(manifest)}\n`;
  return { markdown, manifest };
}

export interface VerifyResult {
  ok: boolean;
  manifest?: SignatureManifest;
  reason?: string;
}

/**
 * Verify a signed bundle. Re-derives the per-workspace key from
 * the manifest's workspaceId, recomputes the HMAC over the body,
 * and constant-time compares the signature.
 */
export function verifyBundle(markdown: string): VerifyResult {
  const parsed = parseFooter(markdown);
  if (!parsed) return { ok: false, reason: "Signature footer not found." };
  const { body, manifest } = parsed;
  if (manifest.algorithm !== "HMAC-SHA256") {
    return { ok: false, reason: `Unsupported algorithm: ${manifest.algorithm}` };
  }
  const computedSha = sha256Hex(body);
  if (computedSha !== manifest.bodySha256) {
    return { ok: false, manifest, reason: "Body SHA-256 does not match manifest." };
  }
  const key = deriveWorkspaceKey(manifest.workspaceId);
  const expected = createHmac("sha256", key).update(body).digest("hex");
  if (!constantTimeEqualHex(expected, manifest.signature)) {
    return { ok: false, manifest, reason: "Signature mismatch." };
  }
  return { ok: true, manifest };
}

/** Returns the keyId for a workspace (no secret material). */
export function workspaceKeyId(workspaceId: string): string {
  return `workspace:${workspaceId}:${SIGNATURE_VERSION}`;
}

// ── internals ────────────────────────────────────────────────

function appendWatermark(body: string, memberLabel: string, generatedAt: Date): string {
  const trimmed = body.replace(/\s+$/, "");
  return `${trimmed}\n\n> _Exported by ${memberLabel} on ${generatedAt.toISOString()}._\n`;
}

function renderFooter(m: SignatureManifest): string {
  const lines = [
    FOOTER_OPEN,
    `version: ${m.version}`,
    `workspace: ${m.workspaceId}`,
    `bundle: ${m.bundleKind}`,
    `member_id: ${m.memberId}`,
    `member_label: ${m.memberLabel}`,
    `generated_at: ${m.generatedAt}`,
    `body_sha256: ${m.bodySha256}`,
    `algorithm: ${m.algorithm}`,
    `key_id: ${m.keyId}`,
    `signature: ${m.signature}`,
    FOOTER_CLOSE,
  ];
  return lines.join("\n");
}

function parseFooter(markdown: string): { body: string; manifest: SignatureManifest } | null {
  const openIdx = markdown.lastIndexOf(FOOTER_OPEN);
  if (openIdx === -1) return null;
  const closeIdx = markdown.indexOf(FOOTER_CLOSE, openIdx);
  if (closeIdx === -1) return null;
  const footer = markdown.slice(openIdx + FOOTER_OPEN.length, closeIdx);
  const body = markdown.slice(0, openIdx).replace(/\s+$/, "");
  const kv = new Map<string, string>();
  for (const raw of footer.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    kv.set(line.slice(0, sep).trim(), line.slice(sep + 1).trim());
  }
  const required = [
    "version",
    "workspace",
    "bundle",
    "member_id",
    "member_label",
    "generated_at",
    "body_sha256",
    "algorithm",
    "key_id",
    "signature",
  ];
  for (const k of required) {
    if (!kv.has(k)) return null;
  }
  const manifest: SignatureManifest = {
    version: kv.get("version")!,
    workspaceId: kv.get("workspace")!,
    bundleKind: kv.get("bundle") as SignatureManifest["bundleKind"],
    memberId: kv.get("member_id")!,
    memberLabel: kv.get("member_label")!,
    generatedAt: kv.get("generated_at")!,
    bodySha256: kv.get("body_sha256")!,
    signature: kv.get("signature")!,
    algorithm: kv.get("algorithm") as SignatureManifest["algorithm"],
    keyId: kv.get("key_id")!,
  };
  return { body, manifest };
}

let cachedDevKey: Buffer | null = null;

function getMasterKey(): Buffer {
  const configured = process.env.PORTAL_EXPORT_SIGNING_KEY;
  if (configured && configured.length > 0) {
    return Buffer.from(configured, "utf8");
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "PORTAL_EXPORT_SIGNING_KEY is required in production. Set a 32+ byte secret to sign evidence exports.",
    );
  }
  // Dev fallback: stable per-process random key so verification works
  // within a single dev session. Logged once so operators know to set
  // a real key before shipping audit-grade exports.
  if (!cachedDevKey) {
    cachedDevKey = randomBytes(32);
    console.warn(
      "[portal/exports] PORTAL_EXPORT_SIGNING_KEY not set — using ephemeral dev key. Signatures will not verify across restarts.",
    );
  }
  return cachedDevKey;
}

function deriveWorkspaceKey(workspaceId: string): Buffer {
  // HKDF-style: workspace key = HMAC(masterKey, "dauntless-evidence-v1|" + workspaceId).
  return createHmac("sha256", getMasterKey())
    .update(`dauntless-evidence-${SIGNATURE_VERSION}|${workspaceId}`)
    .digest();
}

function sha256Hex(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** Test-only: clear the cached dev key so tests can simulate restarts. */
export function __resetSigningCache(): void {
  cachedDevKey = null;
}
