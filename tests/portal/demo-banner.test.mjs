// Smoke test for the marketing → portal continuity banner.
//
// We don't render the React component (no DOM in node:test); we just
// assert the file exports the expected named export. This catches
// rename / removal regressions without pulling in jsdom.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const path = "components/shell/demo-mode-banner.tsx";

test("demo-mode-banner exports DemoModeBanner", async () => {
  const src = await readFile(path, "utf8");
  assert.match(src, /export function DemoModeBanner\(\)/, "Named export DemoModeBanner missing");
});

test("demo-mode-banner is a client component", async () => {
  const src = await readFile(path, "utf8");
  // The banner uses next/navigation hooks; it must be marked "use client".
  assert.match(src, /^"use client";/, "Banner must declare 'use client'");
});

test("demo-mode-banner is gated to /portal paths", async () => {
  const src = await readFile(path, "utf8");
  // The banner should refuse to render outside the portal so deep links
  // from the marketing site to non-portal routes don't surface it.
  assert.match(src, /pathname\?\.startsWith\("\/portal"\)/, "Banner must gate on /portal pathname");
});

test("demo-mode-banner respects ?demo=1 activation", async () => {
  const src = await readFile(path, "utf8");
  assert.match(src, /search\.get\("demo"\) !== "1"/, "Banner must check the ?demo=1 query param");
});

test("demo-mode-banner uses no useEffect (avoids set-state-in-effect)", async () => {
  const src = await readFile(path, "utf8");
  assert.doesNotMatch(src, /useEffect/, "Banner should be effect-free; URL drives activation");
});
