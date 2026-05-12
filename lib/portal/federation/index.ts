// ============================================================
// Federation surface (Phase 12.0)
//
// Single entry point. Catalog of federations, membership store,
// anonymization pipeline.
// ============================================================

import type { Artifact } from "@/lib/portal/types";

import type {
  FederationContribution,
  FederationContributionInput,
  FederationDefinition,
  FederationMembership,
} from "./types";

const FEDERATIONS: FederationDefinition[] = [
  {
    id: "fed-federal-canada",
    name: "Federal Canada Federation",
    sector: "federal-canada",
    description:
      "Cross-departmental canonical layer for Government of Canada workspaces. Anchored on TB directives + Protected B governance.",
    curatedAnchors: [
      "TB Directive on Automated Decision-Making (annotated)",
      "Protected B Risk Tiering Framework",
      "Federal AI Procurement Playbook",
    ],
    memberCount: 4,
    tier: "professional",
  },
  {
    id: "fed-federal-us",
    name: "U.S. Federal Federation",
    sector: "federal-us",
    description: "Cross-agency canonical layer aligned to FedRAMP Low + OMB AI guidance.",
    curatedAnchors: ["OMB AI Bill of Rights mapping", "FedRAMP Low control overlay"],
    memberCount: 2,
    tier: "professional",
  },
  {
    id: "fed-healthcare",
    name: "Healthcare Federation",
    sector: "healthcare",
    description: "HIPAA + clinical-governance canonical layer.",
    curatedAnchors: ["HIPAA evidence chain templates", "Clinical AI risk register"],
    memberCount: 3,
    tier: "strategic",
  },
  {
    id: "fed-financial-services",
    name: "Financial Services Federation",
    sector: "financial-services",
    description: "Regulated-finance canonical layer with FFIEC + OSFI overlays.",
    curatedAnchors: ["FFIEC AI guidance overlay", "OSFI E-23 mapping"],
    memberCount: 2,
    tier: "strategic",
  },
];

const memberships: FederationMembership[] = [
  {
    federationId: "fed-federal-canada",
    workspaceId: "ws-tbs-ai-modernization",
    joinedAt: new Date("2026-03-01T12:00:00Z"),
    status: "active",
    contributionCount: 2,
  },
];

const contributions: FederationContribution[] = [];
let counter = 0;

function generateId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

export function listFederations(): FederationDefinition[] {
  return structuredClone(FEDERATIONS);
}

export function listMemberships(workspaceId: string): FederationMembership[] {
  return memberships.filter((m) => m.workspaceId === workspaceId).map((m) => ({ ...m }));
}

export function listContributions(workspaceId: string): FederationContribution[] {
  return contributions
    .filter((c) => c.workspaceId === workspaceId)
    .map((c) => structuredClone(c))
    .sort((a, b) => b.contributedAt.getTime() - a.contributedAt.getTime());
}

export function joinFederation(workspaceId: string, federationId: string): FederationMembership {
  let existing = memberships.find((m) => m.workspaceId === workspaceId && m.federationId === federationId);
  if (existing) {
    existing.status = "active";
    return { ...existing };
  }
  existing = {
    federationId,
    workspaceId,
    joinedAt: new Date(),
    status: "active",
    contributionCount: 0,
  };
  memberships.push(existing);
  return { ...existing };
}

export function leaveFederation(workspaceId: string, federationId: string): void {
  const m = memberships.find((row) => row.workspaceId === workspaceId && row.federationId === federationId);
  if (!m) return;
  m.status = "withdrawn";
  // Withdrawals revoke all active contributions.
  for (const c of contributions) {
    if (c.workspaceId === workspaceId && c.federationId === federationId && c.status === "active") {
      c.status = "withdrawn";
      c.withdrawnAt = new Date();
      c.withdrawnBy = "workspace-withdrawal";
    }
  }
}

export function contributeArtifact(input: FederationContributionInput, artifact: Artifact): FederationContribution {
  const membership = memberships.find(
    (m) => m.workspaceId === input.workspaceId && m.federationId === input.federationId && m.status === "active",
  );
  if (!membership) {
    throw new Error(`Workspace ${input.workspaceId} is not an active member of ${input.federationId}.`);
  }
  const snapshot = anonymize(artifact, input.anonymizationLevel);
  const contribution: FederationContribution = {
    id: generateId("fed-c"),
    workspaceId: input.workspaceId,
    federationId: input.federationId,
    artifactId: input.artifactId,
    contributedAt: new Date(),
    contributedBy: input.contributedBy,
    anonymizationLevel: input.anonymizationLevel,
    snapshot,
    status: "active",
  };
  contributions.push(contribution);
  membership.contributionCount += 1;
  return structuredClone(contribution);
}

export function withdrawContribution(contributionId: string, by: string): void {
  const c = contributions.find((row) => row.id === contributionId);
  if (!c || c.status !== "active") return;
  c.status = "withdrawn";
  c.withdrawnAt = new Date();
  c.withdrawnBy = by;
  const membership = memberships.find(
    (m) => m.workspaceId === c.workspaceId && m.federationId === c.federationId,
  );
  if (membership) membership.contributionCount = Math.max(0, membership.contributionCount - 1);
}

/** Test-only escape hatch. */
export function __resetFederation(): void {
  memberships.length = 0;
  contributions.length = 0;
  counter = 0;
  memberships.push({
    federationId: "fed-federal-canada",
    workspaceId: "ws-tbs-ai-modernization",
    joinedAt: new Date("2026-03-01T12:00:00Z"),
    status: "active",
    contributionCount: 0,
  });
}

// ── Anonymization pipeline ────────────────────────────────────

const STRICT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Treasury Board of Canada Secretariat/gi, "[Federal Department]"],
  [/Dauntless Agentic/gi, "[Consultancy]"],
  [/TBS/g, "[Department]"],
  [/Dr\. Eleanor Vance/g, "[Executive Sponsor]"],
  [/Devak Kapoor/g, "[Engagement Lead]"],
  [/Marie Tremblay/g, "[Training Lead]"],
  [/Cassandra Reyes/g, "[Engagement Owner]"],
  [/Soo-Jin Kim/g, "[Auditor]"],
  [/Jonah Okafor/g, "[Viewer]"],
];

const STANDARD_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Treasury Board of Canada Secretariat/gi, "[Federal Department]"],
  [/Dauntless Agentic/gi, "[Consultancy]"],
  [/Dr\. Eleanor Vance|Devak Kapoor|Marie Tremblay|Cassandra Reyes|Soo-Jin Kim|Jonah Okafor/g, "[member]"],
];

function anonymize(artifact: Artifact, level: "light" | "standard" | "strict"): FederationContribution["snapshot"] {
  const apply = (text: string) => {
    const replacements = level === "strict" ? STRICT_REPLACEMENTS : level === "standard" ? STANDARD_REPLACEMENTS : [];
    let out = text;
    for (const [pattern, replacement] of replacements) {
      out = out.replace(pattern, replacement);
    }
    return out;
  };
  const body = artifact.body ?? artifact.description ?? "";
  return {
    title: apply(artifact.name),
    description: apply(artifact.description),
    body: apply(body),
  };
}

// ── Cross-federation search ──────────────────────────────────

export interface FederationSearchResult {
  contributionId: string;
  federationId: string;
  federationName: string;
  artifactId: string;
  title: string;
  snippet: string;
  score: number;
  contributedAt: Date;
  /** Workspace is intentionally omitted from search results — that's the federation's privacy contract. */
}

export function searchFederation(query: string, federationId?: string, limit = 20): FederationSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const rows = contributions.filter((c) => c.status === "active" && (!federationId || c.federationId === federationId));
  const matches: FederationSearchResult[] = [];
  for (const c of rows) {
    const haystack = `${c.snapshot.title}\n${c.snapshot.description}\n${c.snapshot.body}`.toLowerCase();
    if (!haystack.includes(q)) continue;
    const idx = haystack.indexOf(q);
    const fed = FEDERATIONS.find((f) => f.id === c.federationId);
    matches.push({
      contributionId: c.id,
      federationId: c.federationId,
      federationName: fed?.name ?? c.federationId,
      artifactId: c.artifactId,
      title: c.snapshot.title,
      snippet:
        c.snapshot.body.slice(Math.max(0, idx - 60), Math.min(c.snapshot.body.length, idx + 100)) +
        (idx + 100 < c.snapshot.body.length ? "…" : ""),
      score: 1 - idx / Math.max(haystack.length, 1),
      contributedAt: c.contributedAt,
    });
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
}
