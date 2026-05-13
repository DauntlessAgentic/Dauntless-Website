import { describe, expect, it } from "vitest";
import { mockPortalRepository } from "@/lib/portal/repositories";
import {
  mockArtifacts,
  mockDecisions,
  mockEngagements,
  mockOrganization,
  mockPortalSnapshot,
  mockWorkspace,
} from "@/lib/portal/mock-data";

const ws = mockWorkspace.id;

describe("mock portal repository — basic reads", () => {
  it("snapshot returns the full mock snapshot for the canonical workspace", async () => {
    const snap = await mockPortalRepository.snapshot(ws);
    expect(snap).toBe(mockPortalSnapshot);
  });

  it("snapshot returns empty collections for an unknown workspace", async () => {
    const snap = await mockPortalRepository.snapshot("ws-unknown");
    expect(snap.engagements).toEqual([]);
    expect(snap.decisions).toEqual([]);
  });

  it("organizations.get resolves the canonical org", async () => {
    const org = await mockPortalRepository.organizations.get(mockOrganization.id);
    expect(org).toBe(mockOrganization);
  });

  it("workspaces.byOrganization returns the canonical workspace", async () => {
    const list = await mockPortalRepository.workspaces.byOrganization(mockOrganization.id);
    expect(list).toEqual([mockWorkspace]);
  });

  it("engagements.forWorkspace returns all engagements", async () => {
    const list = await mockPortalRepository.engagements.forWorkspace(ws);
    expect(list.length).toBe(mockEngagements.length);
  });

  it("artifacts.forEngagement filters correctly", async () => {
    const eng = mockEngagements[0];
    const list = await mockPortalRepository.artifacts.forEngagement(eng.id);
    expect(list.length).toBeGreaterThan(0);
    for (const a of list) expect(a.engagementId).toBe(eng.id);
  });

  it("artifacts.canonical filters by canonical and workspace", async () => {
    const list = await mockPortalRepository.artifacts.canonical(ws);
    expect(list.length).toBe(mockArtifacts.filter((a) => a.canonical).length);
    for (const a of list) expect(a.canonical).toBe(true);
  });

  it("decisions.byStatus returns only matching statuses", async () => {
    const pending = await mockPortalRepository.decisions.byStatus(ws, "pending-approval");
    expect(pending.length).toBe(mockDecisions.filter((d) => d.status === "pending-approval").length);
    for (const d of pending) expect(d.status).toBe("pending-approval");
  });

  it("signals.forWorkspace returns newest first and honors limit", async () => {
    const all = await mockPortalRepository.signals.forWorkspace(ws);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].capturedAt.getTime()).toBeGreaterThanOrEqual(all[i].capturedAt.getTime());
    }
    const trimmed = await mockPortalRepository.signals.forWorkspace(ws, 3);
    expect(trimmed.length).toBe(3);
  });

  it("evidence.byIds returns the requested set in any order", async () => {
    const ids = ["ev-interview-synthesis", "ev-policy-alignment"];
    const list = await mockPortalRepository.evidence.byIds(ids);
    expect(new Set(list.map((e) => e.id))).toEqual(new Set(ids));
  });

  it("knowledge.byShelf filters by shelf", async () => {
    const desk = await mockPortalRepository.knowledge.byShelf(ws, "desk");
    expect(desk.length).toBeGreaterThan(0);
    for (const item of desk) expect(item.shelf).toBe("desk");
  });

  it("metrics.byKey resolves a known key", async () => {
    const adoption = await mockPortalRepository.metrics.byKey(ws, "adoption");
    expect(adoption).toBeDefined();
    expect(adoption?.key).toBe("adoption");
  });

  it("auditLog.forWorkspace returns newest first and honors limit", async () => {
    const all = await mockPortalRepository.auditLog.forWorkspace(ws);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].at.getTime()).toBeGreaterThanOrEqual(all[i].at.getTime());
    }
    const trimmed = await mockPortalRepository.auditLog.forWorkspace(ws, 2);
    expect(trimmed.length).toBe(2);
  });
});

describe("mock portal repository — unknown ids", () => {
  it("organizations.get returns undefined for an unknown id", async () => {
    expect(await mockPortalRepository.organizations.get("org-unknown")).toBeUndefined();
  });

  it("engagements.get returns undefined for an unknown id", async () => {
    expect(await mockPortalRepository.engagements.get("eng-unknown")).toBeUndefined();
  });

  it("artifacts.forWorkspace returns empty for an unknown workspace", async () => {
    expect(await mockPortalRepository.artifacts.forWorkspace("ws-unknown")).toEqual([]);
  });
});
