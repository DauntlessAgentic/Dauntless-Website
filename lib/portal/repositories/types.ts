// ============================================================
// Portal repository interfaces.
//
// Every UI surface fetches portal data through these
// interfaces.  v1 ships two backends:
//   - "mock"     — re-exports lib/portal/mock-data.  Default.
//   - "supabase" — backed by the schema in supabase/migrations.
//                   Stub-only in v1; activated when keys land.
//
// The repository factory (lib/portal/repositories/index.ts)
// chooses a backend at module-load time based on
// PORTAL_REPOSITORY_BACKEND.  No call site changes when the
// backend swaps.
// ============================================================

import type {
  Agent,
  Artifact,
  AuditEntry,
  Conversation,
  Decision,
  DecisionStatus,
  Engagement,
  Evidence,
  KnowledgeItem,
  KnowledgeShelf,
  Membership,
  Metric,
  NextBestAction,
  Organization,
  PortalSnapshot,
  Signal,
  Task,
  Workspace,
} from "../types";

export interface PortalRepository {
  // Single-call snapshot for the Command Center (and tests).
  snapshot(workspaceId: string): Promise<PortalSnapshot>;

  // Identity & workspace
  organizations: OrganizationRepository;
  workspaces:    WorkspaceRepository;
  memberships:   MembershipRepository;

  // Engagement graph
  engagements:   EngagementRepository;
  artifacts:     ArtifactRepository;
  decisions:     DecisionRepository;
  tasks:         TaskRepository;
  signals:       SignalRepository;
  evidence:      EvidenceRepository;

  // Agents & conversations
  agents:        AgentRepository;
  conversations: ConversationRepository;

  // Knowledge & outcomes
  knowledge:     KnowledgeRepository;
  metrics:       MetricRepository;

  // Surfaces
  nextBestActions: NextBestActionRepository;
  auditLog:        AuditLogRepository;
}

export interface OrganizationRepository {
  get(id: string): Promise<Organization | undefined>;
}

export interface WorkspaceRepository {
  get(id: string): Promise<Workspace | undefined>;
  byOrganization(orgId: string): Promise<Workspace[]>;
}

export interface MembershipRepository {
  forWorkspace(workspaceId: string): Promise<Membership[]>;
  forUser(userId: string): Promise<Membership[]>;
}

export interface EngagementRepository {
  get(id: string): Promise<Engagement | undefined>;
  forWorkspace(workspaceId: string): Promise<Engagement[]>;
}

export interface ArtifactRepository {
  get(id: string): Promise<Artifact | undefined>;
  forWorkspace(workspaceId: string): Promise<Artifact[]>;
  forEngagement(engagementId: string): Promise<Artifact[]>;
  canonical(workspaceId: string): Promise<Artifact[]>;
}

export interface DecisionRepository {
  get(id: string): Promise<Decision | undefined>;
  forWorkspace(workspaceId: string): Promise<Decision[]>;
  forEngagement(engagementId: string): Promise<Decision[]>;
  byStatus(workspaceId: string, status: DecisionStatus): Promise<Decision[]>;
}

export interface TaskRepository {
  forWorkspace(workspaceId: string): Promise<Task[]>;
  forEngagement(engagementId: string): Promise<Task[]>;
}

export interface SignalRepository {
  // Newest first.
  forWorkspace(workspaceId: string, limit?: number): Promise<Signal[]>;
}

export interface EvidenceRepository {
  get(id: string): Promise<Evidence | undefined>;
  forWorkspace(workspaceId: string): Promise<Evidence[]>;
  byIds(ids: string[]): Promise<Evidence[]>;
}

export interface AgentRepository {
  get(id: string): Promise<Agent | undefined>;
  forWorkspace(workspaceId: string): Promise<Agent[]>;
}

export interface ConversationRepository {
  forAgent(agentId: string): Promise<Conversation[]>;
  forWorkspace(workspaceId: string): Promise<Conversation[]>;
}

export interface KnowledgeRepository {
  forWorkspace(workspaceId: string): Promise<KnowledgeItem[]>;
  byShelf(workspaceId: string, shelf: KnowledgeShelf): Promise<KnowledgeItem[]>;
}

export interface MetricRepository {
  forWorkspace(workspaceId: string): Promise<Metric[]>;
  byKey(workspaceId: string, key: string): Promise<Metric | undefined>;
}

export interface NextBestActionRepository {
  forWorkspace(workspaceId: string): Promise<NextBestAction[]>;
}

export interface AuditLogRepository {
  // Newest first.
  forWorkspace(workspaceId: string, limit?: number): Promise<AuditEntry[]>;
}

export type RepositoryBackend = "mock" | "supabase";
