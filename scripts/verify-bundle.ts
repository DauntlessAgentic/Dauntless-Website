#!/usr/bin/env node
// ============================================================
// Standalone signed-bundle verifier
//
// Usage:
//   PORTAL_EXPORT_SIGNING_KEY=<secret> \
//     npx tsx scripts/verify-bundle.ts path/to/bundle.signed.md
//
// Optional PORTAL_EXPORT_SIGNING_KEY_PREVIOUS for rotation windows.
//
// Exits with code 0 on success, 1 on failure. Prints the parsed
// manifest on success so a procurement officer can confirm the
// member id and workspace id by eye.
//
// Advisory action #31. The point of this script is that anyone with
// the master signing key can verify a bundle outside the portal —
// the trust does not rest on the portal being online.
// ============================================================

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { verifyBundle } from "../lib/portal/exports/signing";

function fail(reason: string, code = 1): never {
  console.error(`FAIL: ${reason}`);
  process.exit(code);
}

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: PORTAL_EXPORT_SIGNING_KEY=<key> tsx scripts/verify-bundle.ts <bundle.signed.md>");
  process.exit(2);
}
if (!process.env.PORTAL_EXPORT_SIGNING_KEY) {
  fail("PORTAL_EXPORT_SIGNING_KEY env var is required.", 2);
}

let markdown: string;
try {
  markdown = readFileSync(resolve(arg), "utf8");
} catch (err) {
  fail(`Cannot read file: ${(err as Error).message}`, 2);
}

const result = verifyBundle(markdown);
if (!result.ok) {
  fail(result.reason ?? "Unknown failure.");
}

console.log("OK");
console.log(JSON.stringify(result.manifest, null, 2));
if (result.reason) {
  console.warn(`NOTE: ${result.reason}`);
}
process.exit(0);
