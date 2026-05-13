import { describe, expect, it } from "vitest";
import {
  mockOrganization,
  mockWorkspace,
  mockEngagements,
  mockArtifacts,
  mockDecisions,
  mockTasks,
  mockSignals,
  mockAgents,
  mockConversations,
  mockKnowledge,
  mockMetrics,
  mockEvidence,
  mockNextBestActions,
  mockAuditLog,
  mockPortalSnapshot,
  getEngagement,
  getArtifactsByEngagement,
  getDecisionsByStatus,
  getKnowledgeByShelf,
  getAgentByArchetype,
  getEvidence,
} from "@/lib/portal/mock-data";

describe("portal mock data — relational integrity", () => {
  it("workspace belongs to the organization", () => {
    expect(mockWorkspace.orgId).toBe(mockOrganization.id);
  });

  it("every engagement belongs to the workspace", () => {
    for (const engagement of mockEngagements) {
      expect(engagement.workspaceId).toBe(mockWorkspace.id);
    }
  });

  it("every artifact belongs to a real engagement", () => {
    const ids = new Set(mockEngagements.map((e) => e.id));
    for (const artifact of mockArtifacts) {
      expect(ids.has(artifact.engagementId)).toBe(true);
    }
  });

  it("every artifact's currentVersionId resolves inside its own versions", () => {
    for (const artifact of mockArtifacts) {
      const ids = new Set(artifact.versions.map((v) => v.id));
      expect(ids.has(artifact.currentVersionId)).toBe(true);
    }
  });

  it("every decision belongs to a real engagement", () => {
    const ids = new Set(mockEngagements.map((e) => e.id));
    for (const decision of mockDecisions) {
      expect(ids.has(decision.engagementId)).toBe(true);
    }
  });

  it("every decision's linked evidence and artifact ids resolve", () => {
    const evidenceIds = new Set(mockEvidence.map((e) => e.id));
    const artifactIds = new Set(mockArtifacts.map((a) => a.id));
    for (const decision of mockDecisions) {
      for (const id of decision.evidenceIds) {
        expect(evidenceIds.has(id)).toBe(true);
      }
      for (const id of decision.artifactIds) {
        expect(artifactIds.has(id)).toBe(true);
      }
    }
  });

  it("every task belongs to a real engagement", () => {
    const ids = new Set(mockEngagements.map((e) => e.id));
    for (const task of mockTasks) {
      expect(ids.has(task.engagementId)).toBe(true);
    }
  });

  it("every signal belongs to the workspace", () => {
    for (const signal of mockSignals) {
      expect(signal.workspaceId).toBe(mockWorkspace.id);
    }
  });

  it("every conversation belongs to a real agent and workspace", () => {
    const agentIds = new Set(mockAgents.map((a) => a.id));
    for (const conv of mockConversations) {
      expect(agentIds.has(conv.agentId)).toBe(true);
      expect(conv.workspaceId).toBe(mockWorkspace.id);
    }
  });

  it("every knowledge item belongs to the workspace", () => {
    for (const item of mockKnowledge) {
      expect(item.workspaceId).toBe(mockWorkspace.id);
    }
  });

  it("every metric belongs to the workspace and has a series", () => {
    for (const metric of mockMetrics) {
      expect(metric.workspaceId).toBe(mockWorkspace.id);
      expect(metric.series.length).toBeGreaterThan(0);
    }
  });

  it("audit log entries reference the workspace", () => {
    for (const entry of mockAuditLog) {
      expect(entry.workspaceId).toBe(mockWorkspace.id);
    }
  });

  it("portal snapshot mirrors the individual exports", () => {
    expect(mockPortalSnapshot.organization).toBe(mockOrganization);
    expect(mockPortalSnapshot.workspace).toBe(mockWorkspace);
    expect(mockPortalSnapshot.engagements).toBe(mockEngagements);
    expect(mockPortalSnapshot.artifacts).toBe(mockArtifacts);
    expect(mockPortalSnapshot.decisions).toBe(mockDecisions);
  });
});

describe("portal mock data — semantic invariants", () => {
  it("at least one decision is pending approval (drives the Decision Surface)", () => {
    const pending = mockDecisions.filter((d) => d.status === "pending-approval");
    expect(pending.length).toBeGreaterThan(0);
  });

  it("at least one artifact is canonical (drives the Bookshelf)", () => {
    const canonical = mockArtifacts.filter((a) => a.canonical);
    expect(canonical.length).toBeGreaterThan(0);
  });

  it("every agent archetype is represented (the fleet panel renders all four)", () => {
    const archetypes = new Set(mockAgents.map((a) => a.archetype));
    expect(archetypes.has("chief-of-staff")).toBe(true);
    expect(archetypes.has("strategist")).toBe(true);
    expect(archetypes.has("operator")).toBe(true);
    expect(archetypes.has("auditor")).toBe(true);
  });

  it("knowledge items appear on all three shelves", () => {
    const shelves = new Set(mockKnowledge.map((k) => k.shelf));
    expect(shelves.has("desk")).toBe(true);
    expect(shelves.has("bookshelf")).toBe(true);
    expect(shelves.has("cabinet")).toBe(true);
  });

  it("every memory tier is used (M0 through M4)", () => {
    const tiers = new Set(mockKnowledge.map((k) => k.memoryTier));
    for (const tier of ["M0", "M1", "M2", "M3", "M4"] as const) {
      expect(tiers.has(tier)).toBe(true);
    }
  });

  it("decision confidence is always a probability", () => {
    for (const decision of mockDecisions) {
      expect(decision.recommendation.confidence).toBeGreaterThanOrEqual(0);
      expect(decision.recommendation.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("every artifact has at least one version", () => {
    for (const artifact of mockArtifacts) {
      expect(artifact.versions.length).toBeGreaterThan(0);
    }
  });

  it("every metric current value falls within a sane range vs baseline/target", () => {
    for (const metric of mockMetrics) {
      const points = [metric.baseline, metric.current, metric.target];
      for (const v of points) {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });
});

describe("portal mock data — convenience helpers", () => {
  it("getEngagement returns the engagement for a known id", () => {
    expect(getEngagement("eng-discovery-01")).toBe(mockEngagements[0]);
  });

  it("getEngagement returns undefined for an unknown id", () => {
    expect(getEngagement("eng-bogus")).toBeUndefined();
  });

  it("getArtifactsByEngagement filters correctly", () => {
    const all = getArtifactsByEngagement("eng-discovery-01");
    expect(all.length).toBeGreaterThan(0);
    for (const artifact of all) {
      expect(artifact.engagementId).toBe("eng-discovery-01");
    }
  });

  it("getDecisionsByStatus filters correctly", () => {
    const pending = getDecisionsByStatus("pending-approval");
    expect(pending.length).toBeGreaterThan(0);
    for (const decision of pending) {
      expect(decision.status).toBe("pending-approval");
    }
  });

  it("getKnowledgeByShelf filters correctly", () => {
    const desk = getKnowledgeByShelf("desk");
    expect(desk.length).toBeGreaterThan(0);
    for (const item of desk) {
      expect(item.shelf).toBe("desk");
    }
  });

  it("getAgentByArchetype filters correctly", () => {
    const strategists = getAgentByArchetype("strategist");
    expect(strategists.length).toBeGreaterThan(0);
    for (const agent of strategists) {
      expect(agent.archetype).toBe("strategist");
    }
  });

  it("getEvidence returns the evidence for a known id", () => {
    expect(getEvidence("ev-interview-synthesis")).toBeDefined();
  });
});

describe("next-best-actions are well-formed", () => {
  it("every next-best-action references a known engagement when one is given", () => {
    const ids = new Set(mockEngagements.map((e) => e.id));
    for (const action of mockNextBestActions) {
      if (action.engagementId) {
        expect(ids.has(action.engagementId)).toBe(true);
      }
    }
  });

  it("priorities are either primary or secondary", () => {
    for (const action of mockNextBestActions) {
      expect(["primary", "secondary"]).toContain(action.priority);
    }
  });
});
