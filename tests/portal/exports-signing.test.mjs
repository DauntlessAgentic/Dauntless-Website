// ============================================================
// Signed evidence export smoke test (Phase D)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

// Pin a stable master key so verification is deterministic across runs.
process.env.PORTAL_EXPORT_SIGNING_KEY =
  process.env.PORTAL_EXPORT_SIGNING_KEY ?? "test-master-key-do-not-use-in-prod-32bytes!!";

const { signBundle, verifyBundle, workspaceKeyId } = await import(url("lib/portal/exports/signing.ts"));

test("Signed exports", async (t) => {
  await t.test("round-trip: sign then verify succeeds", () => {
    const signed = signBundle({
      workspaceId: "ws-acme",
      body: "# Hello\n\nThis is an Impact Report.",
      memberId: "usr-1",
      memberLabel: "Ada Lovelace (owner)",
      bundleKind: "impact-report",
    });
    assert.ok(signed.markdown.includes("DAUNTLESS-EVIDENCE-SIGNATURE-V1"));
    assert.ok(signed.markdown.includes("Exported by Ada Lovelace"));
    assert.equal(signed.manifest.workspaceId, "ws-acme");
    assert.equal(signed.manifest.bundleKind, "impact-report");
    assert.equal(signed.manifest.algorithm, "HMAC-SHA256");
    assert.equal(signed.manifest.keyId, workspaceKeyId("ws-acme"));

    const result = verifyBundle(signed.markdown);
    assert.equal(result.ok, true);
    assert.equal(result.manifest.workspaceId, "ws-acme");
  });

  await t.test("verification fails when body is tampered with", () => {
    const signed = signBundle({
      workspaceId: "ws-acme",
      body: "Original content.",
      memberId: "usr-1",
      memberLabel: "Ada Lovelace (owner)",
      bundleKind: "audit-log",
    });
    const tampered = signed.markdown.replace("Original content.", "Forged content.");
    const result = verifyBundle(tampered);
    assert.equal(result.ok, false);
    assert.match(result.reason, /SHA-256|Signature/);
  });

  await t.test("verification fails when signature is tampered with", () => {
    const signed = signBundle({
      workspaceId: "ws-acme",
      body: "Body that matters.",
      memberId: "usr-1",
      memberLabel: "Ada Lovelace (owner)",
      bundleKind: "evidence",
    });
    const flipped = signed.markdown.replace(
      `signature: ${signed.manifest.signature}`,
      `signature: ${"0".repeat(signed.manifest.signature.length)}`,
    );
    const result = verifyBundle(flipped);
    assert.equal(result.ok, false);
    assert.match(result.reason, /Signature mismatch/);
  });

  await t.test("different workspaces get different signatures for the same body", () => {
    const a = signBundle({
      workspaceId: "ws-one",
      body: "shared body",
      memberId: "usr-1",
      memberLabel: "Same human (owner)",
      bundleKind: "impact-report",
      generatedAt: new Date("2026-01-01T00:00:00Z"),
    });
    const b = signBundle({
      workspaceId: "ws-two",
      body: "shared body",
      memberId: "usr-1",
      memberLabel: "Same human (owner)",
      bundleKind: "impact-report",
      generatedAt: new Date("2026-01-01T00:00:00Z"),
    });
    assert.notEqual(a.manifest.signature, b.manifest.signature);
    assert.notEqual(a.manifest.keyId, b.manifest.keyId);
  });

  await t.test("missing footer fails gracefully", () => {
    const result = verifyBundle("# Just markdown, no footer.\n");
    assert.equal(result.ok, false);
    assert.match(result.reason, /not found/);
  });

  await t.test("watermark records the requesting member", () => {
    const signed = signBundle({
      workspaceId: "ws-acme",
      body: "Some report.",
      memberId: "usr-42",
      memberLabel: "Grace Hopper (executive)",
      bundleKind: "impact-report",
      generatedAt: new Date("2026-05-14T10:00:00Z"),
    });
    assert.ok(signed.markdown.includes("Exported by Grace Hopper (executive) on 2026-05-14T10:00:00.000Z"));
    assert.equal(signed.manifest.memberLabel, "Grace Hopper (executive)");
    assert.equal(signed.manifest.memberId, "usr-42");
  });

  await t.test("key rotation: previous-key bundle still verifies with NOTE", () => {
    const originalCurrent = process.env.PORTAL_EXPORT_SIGNING_KEY;
    const originalPrev = process.env.PORTAL_EXPORT_SIGNING_KEY_PREVIOUS;
    // 1. Sign under the original key.
    const signed = signBundle({
      workspaceId: "ws-rotation",
      body: "Rotation test body.",
      memberId: "usr-1",
      memberLabel: "Ada (owner)",
      bundleKind: "impact-report",
    });
    // 2. Rotate: original becomes PREVIOUS, a fresh key takes CURRENT.
    process.env.PORTAL_EXPORT_SIGNING_KEY_PREVIOUS = originalCurrent;
    process.env.PORTAL_EXPORT_SIGNING_KEY = "rotated-master-key-do-not-use-in-prod-32!!";
    // 3. The old bundle still verifies, with a rotation NOTE in the reason.
    const result = verifyBundle(signed.markdown);
    assert.equal(result.ok, true);
    assert.match(result.reason ?? "", /PREVIOUS signing key/);
    // restore
    process.env.PORTAL_EXPORT_SIGNING_KEY = originalCurrent;
    if (originalPrev === undefined) delete process.env.PORTAL_EXPORT_SIGNING_KEY_PREVIOUS;
    else process.env.PORTAL_EXPORT_SIGNING_KEY_PREVIOUS = originalPrev;
  });
});
