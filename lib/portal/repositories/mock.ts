// ============================================================
// Mock backend for the portal repository layer.
//
// Reads from lib/portal/mock-data and returns Promises so call
// sites can be written as if persistence already exists.  When
// the Supabase backend lands, swap PORTAL_REPOSITORY_BACKEND=
// supabase and the call sites stay identical.
//
// All methods are pure functions of the mock-data module-level
// arrays.  No mutation, no caching.
// ============================================================

import {
  mockAgents,
  mockArtifacts,
  mockAuditLog,
  mockConversations,
  mockDecisions,
  mockEngagements,
  mockEvidence,
  mockKnowledge,
  mockMemberships,
  mockMetrics,
  mockNextBestActions,
  mockOrganization,
  mockPortalSnapshot,
  mockSignals,
  mockTasks,
  mockWorkspace,
} from "../mock-data";
import type {
  AgentRepository,
  ArtifactRepository,
  AuditLogRepository,
  ConversationRepository,
  DecisionRepository,
  EngagementRepository,
  EvidenceRepository,
  KnowledgeRepository,
  MembershipRepository,
  MetricRepository,
  NextBestActionRepository,
  OrganizationRepository,
  PortalRepository,
  SignalRepository,
  TaskRepository,
  WorkspaceRepository,
} from "./types";
import type {
  DecisionStatus,
  KnowledgeShelf,
} from "../types";

// Helper: resolve a value as a Promise without introducing a
// microtask hop in synchronous test contexts.
const resolve = <T,>(value: T): Promise<T> => Promise.resolve(value);

const organizations: OrganizationRepository = {
  get: (id) => resolve(id === mockOrganization.id ? mockOrganization : undefined),
};

const workspaces: WorkspaceRepository = {
  get: (id) => resolve(id === mockWorkspace.id ? mockWorkspace : undefined),
  byOrganization: (orgId) =>
    resolve(mockWorkspace.orgId === orgId ? [mockWorkspace] : []),
};

const memberships: MembershipRepository = {
  forWorkspace: (workspaceId) =>
    resolve(mockMemberships.filter((m) => m.workspaceId === workspaceId)),
  forUser: (userId) =>
    resolve(mockMemberships.filter((m) => m.userId === userId)),
};

const engagements: EngagementRepository = {
  get: (id) => resolve(mockEngagements.find((e) => e.id === id)),
  forWorkspace: (workspaceId) =>
    resolve(mockEngagements.filter((e) => e.workspaceId === workspaceId)),
};

const artifacts: ArtifactRepository = {
  get: (id) => resolve(mockArtifacts.find((a) => a.id === id)),
  forWorkspace: (workspaceId) => {
    const engagementIds = new Set(
      mockEngagements
        .filter((e) => e.workspaceId === workspaceId)
        .map((e) => e.id),
    );
    return resolve(mockArtifacts.filter((a) => engagementIds.has(a.engagementId)));
  },
  forEngagement: (engagementId) =>
    resolve(mockArtifacts.filter((a) => a.engagementId === engagementId)),
  canonical: (workspaceId) => {
    const engagementIds = new Set(
      mockEngagements
        .filter((e) => e.workspaceId === workspaceId)
        .map((e) => e.id),
    );
    return resolve(
      mockArtifacts.filter((a) => a.canonical && engagementIds.has(a.engagementId)),
    );
  },
};

const decisions: DecisionRepository = {
  get: (id) => resolve(mockDecisions.find((d) => d.id === id)),
  forWorkspace: (workspaceId) => {
    const engagementIds = new Set(
      mockEngagements
        .filter((e) => e.workspaceId === workspaceId)
        .map((e) => e.id),
    );
    return resolve(mockDecisions.filter((d) => engagementIds.has(d.engagementId)));
  },
  forEngagement: (engagementId) =>
    resolve(mockDecisions.filter((d) => d.engagementId === engagementId)),
  byStatus: (workspaceId, status: DecisionStatus) => {
    const engagementIds = new Set(
      mockEngagements
        .filter((e) => e.workspaceId === workspaceId)
        .map((e) => e.id),
    );
    return resolve(
      mockDecisions.filter(
        (d) => d.status === status && engagementIds.has(d.engagementId),
      ),
    );
  },
};

const tasks: TaskRepository = {
  forWorkspace: (workspaceId) => {
    const engagementIds = new Set(
      mockEngagements
        .filter((e) => e.workspaceId === workspaceId)
        .map((e) => e.id),
    );
    return resolve(mockTasks.filter((t) => engagementIds.has(t.engagementId)));
  },
  forEngagement: (engagementId) =>
    resolve(mockTasks.filter((t) => t.engagementId === engagementId)),
};

const signals: SignalRepository = {
  forWorkspace: (workspaceId, limit) => {
    const all = mockSignals
      .filter((s) => s.workspaceId === workspaceId)
      .slice()
      .sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
    return resolve(typeof limit === "number" ? all.slice(0, limit) : all);
  },
};

const evidence: EvidenceRepository = {
  get: (id) => resolve(mockEvidence.find((e) => e.id === id)),
  forWorkspace: (workspaceId) =>
    resolve(mockEvidence.filter((e) => e.workspaceId === workspaceId)),
  byIds: (ids) => {
    const wanted = new Set(ids);
    return resolve(mockEvidence.filter((e) => wanted.has(e.id)));
  },
};

const agents: AgentRepository = {
  get: (id) => resolve(mockAgents.find((a) => a.id === id)),
  forWorkspace: (_workspaceId) => resolve(mockAgents.slice()),
};

const conversations: ConversationRepository = {
  forAgent: (agentId) =>
    resolve(mockConversations.filter((c) => c.agentId === agentId)),
  forWorkspace: (workspaceId) =>
    resolve(mockConversations.filter((c) => c.workspaceId === workspaceId)),
};

const knowledge: KnowledgeRepository = {
  forWorkspace: (workspaceId) =>
    resolve(mockKnowledge.filter((k) => k.workspaceId === workspaceId)),
  byShelf: (workspaceId, shelf: KnowledgeShelf) =>
    resolve(
      mockKnowledge.filter((k) => k.workspaceId === workspaceId && k.shelf === shelf),
    ),
};

const metrics: MetricRepository = {
  forWorkspace: (workspaceId) =>
    resolve(mockMetrics.filter((m) => m.workspaceId === workspaceId)),
  byKey: (workspaceId, key) =>
    resolve(
      mockMetrics.find((m) => m.workspaceId === workspaceId && m.key === key),
    ),
};

const nextBestActions: NextBestActionRepository = {
  forWorkspace: (_workspaceId) => resolve(mockNextBestActions.slice()),
};

const auditLog: AuditLogRepository = {
  forWorkspace: (workspaceId, limit) => {
    const all = mockAuditLog
      .filter((e) => e.workspaceId === workspaceId)
      .slice()
      .sort((a, b) => b.at.getTime() - a.at.getTime());
    return resolve(typeof limit === "number" ? all.slice(0, limit) : all);
  },
};

export const mockPortalRepository: PortalRepository = {
  snapshot: (workspaceId) =>
    resolve(
      workspaceId === mockWorkspace.id
        ? mockPortalSnapshot
        : ({
            ...mockPortalSnapshot,
            engagements: [],
            artifacts: [],
            decisions: [],
            tasks: [],
            signals: [],
            agents: [],
            conversations: [],
            knowledge: [],
            metrics: [],
            evidence: [],
            nextBestActions: [],
            auditLog: [],
          } as typeof mockPortalSnapshot),
    ),
  organizations,
  workspaces,
  memberships,
  engagements,
  artifacts,
  decisions,
  tasks,
  signals,
  evidence,
  agents,
  conversations,
  knowledge,
  metrics,
  nextBestActions,
  auditLog,
};
