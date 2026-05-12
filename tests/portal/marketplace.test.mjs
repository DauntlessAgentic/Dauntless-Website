// ============================================================
// Third-party marketplace smoke test (Phase 15.0)
// ============================================================

import "tsx/esm";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const url = (rel) => pathToFileURL(path.join(repoRoot, rel)).href;

const { __resetPortalRepository, getPortalRepository } = await import(url("lib/portal/repositories/index.ts"));
const store = await import(url("lib/portal/marketplace/store.ts"));

test("Marketplace", async (t) => {
  __resetPortalRepository();
  store.__resetMarketplace();
  const repo = getPortalRepository();
  const ws = await repo.getDefaultWorkspace();

  await t.test("seed lists three listings spanning archetypes", () => {
    const listings = store.listListings();
    assert.ok(listings.length >= 3);
    const archetypes = new Set(listings.map((l) => l.archetype));
    assert.ok(archetypes.has("strategist"));
    assert.ok(archetypes.has("auditor"));
    assert.ok(archetypes.has("operator"));
  });

  await t.test("submit → eval pass for a well-scoped listing", () => {
    const listing = store.submitListing({
      name: "Smoke Operator",
      developer: "Smoke Co.",
      archetype: "operator",
      description: "A smoke-test operator agent that drafts and hands off.",
      scopeBullets: ["draft only", "must handoff"],
      toolSurface: ["search_artifacts", "draft_artifact_version", "request_review", "cite_evidence"],
      models: ["claude-haiku-4-5"],
    });
    assert.equal(listing.status, "pending-eval");
    const result = store.runEvalForListing(listing.id);
    assert.equal(result.verdict, "pass");
    assert.equal(result.separationOfPowersRespect, true);
  });

  await t.test("eval fails when listing declares out-of-archetype tools", () => {
    const listing = store.submitListing({
      name: "Smoke Violator",
      developer: "Smoke Co.",
      archetype: "operator",
      description: "Tries to declare propose_decision (strategist-only).",
      scopeBullets: ["abusive"],
      toolSurface: ["draft_artifact_version", "propose_decision"],
      models: ["claude-haiku-4-5"],
    });
    const result = store.runEvalForListing(listing.id);
    assert.equal(result.verdict, "fail");
    assert.equal(result.separationOfPowersRespect, false);
  });

  await t.test("install + uninstall lifecycle", () => {
    // The seed pre-installs Policy Foresight; pick the other live listing.
    const live = store.listListings().find((l) => l.status === "live" && !store.listInstalls("ws-tbs-ai-modernization").some((i) => i.listingId === l.id && i.status === "active"));
    assert.ok(live, "expected a live listing not already installed");
    const before = live.installCount;
    const install = store.installListing({ listingId: live.id, workspaceId: ws.id, installedBy: "Test Author" });
    assert.equal(install.status, "active");
    const after = store.listListings().find((l) => l.id === live.id);
    assert.equal(after.installCount, before + 1);
    store.removeInstall(install.id);
    const installs = store.listInstalls(ws.id);
    assert.ok(installs.find((i) => i.id === install.id).status === "removed");
  });

  await t.test("killswitch revokes installs globally", () => {
    store.__resetMarketplace();
    const live = store.listListings().find((l) => l.status === "live");
    assert.ok(live);
    // Killswitch the pre-existing install (Policy Foresight) — seed has one active install on ws-tbs-ai-modernization.
    const installsBefore = store.listInstalls(ws.id).filter((i) => i.listingId === live.id && i.status === "active");
    assert.ok(installsBefore.length >= 1, "expected the seed install");
    store.killSwitch(live.id, "Smoke killswitch");
    const updated = store.listListings().find((l) => l.id === live.id);
    assert.equal(updated.status, "killswitched");
    assert.equal(updated.installCount, 0);
    const installs = store.listInstalls(ws.id);
    assert.ok(installs.filter((i) => i.listingId === live.id).every((i) => i.status !== "active"));
  });
});
