// ============================================================
// Dauntless Agentic — Client Intelligence Portal
// Mock data (v1.0)
//
// Deterministic. No `Math.random()` in module scope. No random
// IDs in render paths. Every value is hand-curated to model one
// realistic government client across three concurrent engagements:
//   1. AI Operations Discovery Sprint
//   2. AI Literacy Training Program
//   3. Agentic Systems Architecture
//
// Shapes are bound to lib/portal/types.ts and intended to be the
// drop-in baseline for the Supabase-backed repositories that will
// replace this file when persistence lands.
// ============================================================

import type {
  Organization,
  Workspace,
  Membership,
  Engagement,
  Artifact,
  ArtifactVersion,
  Decision,
  Task,
  Signal,
  Agent,
  Conversation,
  KnowledgeItem,
  Metric,
  Evidence,
  NextBestAction,
  AuditEntry,
  PortalSnapshot,
} from "./types";

// ── Reference clock ──────────────────────────────────────────────────
// All "ago" timestamps anchor on this. Mutating it from a single place
// keeps every relative time consistent across the portal surfaces.
const NOW = new Date("2026-05-11T14:00:00.000Z");
const days = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);
const hours = (n: number) => new Date(NOW.getTime() - n * 60 * 60 * 1000);
const mins = (n: number) => new Date(NOW.getTime() - n * 60 * 1000);

// ── Organization & Workspace ─────────────────────────────────────────

export const mockOrganization: Organization = {
  id: "org-tbs",
  name: "Treasury Board of Canada Secretariat",
  shortName: "TBS",
  sector: "Federal Government — Central Agency",
  region: "Ottawa, Canada",
  trustTier: "elevated",
};

export const mockWorkspace: Workspace = {
  id: "ws-tbs-ai-modernization",
  orgId: mockOrganization.id,
  name: "TBS · AI Modernization Program",
  visibility: "private",
  trustBadge: "Protected B · Need-to-Know",
  primaryContact: "Dr. Eleanor Vance",
  lastUpdated: mins(7),
};

export const mockMemberships: Membership[] = [
  { userId: "u-evance", userName: "Dr. Eleanor Vance",  role: "executive", workspaceId: mockWorkspace.id, joinedAt: days(96) },
  { userId: "u-dkapoor", userName: "Devak Kapoor",      role: "lead",      workspaceId: mockWorkspace.id, joinedAt: days(96) },
  { userId: "u-mtremblay", userName: "Marie Tremblay",  role: "lead",      workspaceId: mockWorkspace.id, joinedAt: days(74) },
  { userId: "u-jokafor", userName: "Jonah Okafor",      role: "viewer",    workspaceId: mockWorkspace.id, joinedAt: days(40) },
  { userId: "u-skim", userName: "Soo-Jin Kim",          role: "auditor",   workspaceId: mockWorkspace.id, joinedAt: days(40) },
  { userId: "u-dauntless-1", userName: "Cassandra Reyes (Dauntless)", role: "owner", workspaceId: mockWorkspace.id, joinedAt: days(96) },
];

// ── Engagements ──────────────────────────────────────────────────────

export const mockEngagements: Engagement[] = [
  {
    id: "eng-discovery-01",
    workspaceId: mockWorkspace.id,
    name: "AI Operations Discovery Sprint",
    kind: "discovery",
    phase: "deliver",
    status: "review",
    service: "consulting",
    startedAt: days(58),
    targetCloseAt: days(-9),
    progress: 78,
    successCriteria: [
      "Operating-model assessment delivered with prioritized opportunity map",
      "Governance readiness scored against the 6-pillar trust framework",
      "Roadmap presented and accepted by the AI Modernization Steering Committee",
    ],
    risks: [
      "Two of nine line departments have not nominated SMEs for the interview round",
      "Procurement gating may slip the Phase 2 design sprint by 2–3 weeks",
    ],
    ownerName: "Cassandra Reyes (Dauntless)",
  },
  {
    id: "eng-training-01",
    workspaceId: mockWorkspace.id,
    name: "AI Literacy Training Program",
    kind: "build",
    phase: "activate",
    status: "active",
    service: "training",
    startedAt: days(74),
    targetCloseAt: days(-21),
    progress: 64,
    successCriteria: [
      "85% of executive cadre completes the Foundations cohort",
      "Capability score on the post-program assessment rises ≥ 18 points",
      "Departmental champions identified and resourced for the operate-and-evolve phase",
    ],
    risks: [
      "Calendaring conflicts with the spring estimates cycle — at-risk modules: 3 of 8",
    ],
    ownerName: "Cassandra Reyes (Dauntless)",
  },
  {
    id: "eng-agentic-01",
    workspaceId: mockWorkspace.id,
    name: "Agentic Systems Architecture",
    kind: "design",
    phase: "design",
    status: "active",
    service: "agentic",
    startedAt: days(40),
    targetCloseAt: days(-72),
    progress: 41,
    successCriteria: [
      "Agent fleet design completed for triage, reporting, and governance audit domains",
      "Decision architecture (risk tiers, propose→approve→commit) integrated with TBS policy gates",
      "Knowledge architecture stood up with M0–M4 memory tiers and canonical promotion",
    ],
    risks: [
      "Treasury Board policy on autonomous decisioning still in interpretation — possible scope reshape",
      "Identity federation with GCKey not yet greenlit for agent service accounts",
    ],
    ownerName: "Cassandra Reyes (Dauntless)",
  },
];

// ── Artifacts (10 living deliverables) ───────────────────────────────

interface MockArtifactSeed {
  id: string;
  engagementId: string;
  name: string;
  type: Artifact["type"];
  description: string;
  /** Markdown body. May embed `[[ev-id]]` references that render as evidence chips. */
  body?: string;
  ownerName: string;
  reviewState: Artifact["reviewState"];
  canonical: boolean;
  lastReviewedAgoDays: number;
  versions: Array<{ version: string; summary: string; changedBy: string; agoDays: number; body?: string }>;
  linkedDecisionIds: string[];
  linkedEvidenceIds: string[];
}

const artifactSeeds: MockArtifactSeed[] = [
  {
    id: "art-roadmap",
    engagementId: "eng-discovery-01",
    name: "Strategic AI Roadmap — TBS 2026/27",
    type: "roadmap",
    description: "Three-horizon roadmap with sequenced bets, governance gates, and reversibility checkpoints.",
    ownerName: "Cassandra Reyes (Dauntless)",
    reviewState: "in-review",
    canonical: false,
    lastReviewedAgoDays: 2,
    versions: [
      { version: "0.4.0", summary: "Restructured Horizon 2 around two anchor bets after SteerCo feedback.", changedBy: "Cassandra Reyes (Dauntless)", agoDays: 2 },
      { version: "0.3.1", summary: "Added reversibility checkpoint to every Horizon 1 initiative.", changedBy: "Devak Kapoor", agoDays: 9 },
      { version: "0.3.0", summary: "First draft after Discovery interview synthesis.", changedBy: "Cassandra Reyes (Dauntless)", agoDays: 21 },
    ],
    linkedDecisionIds: ["dec-roadmap-h2-anchor", "dec-roadmap-phase2-procurement"],
    linkedEvidenceIds: ["ev-interview-synthesis", "ev-steerco-minutes-march"],
  },
  {
    id: "art-governance",
    engagementId: "eng-discovery-01",
    name: "Governance Framework — Six Pillars",
    type: "framework",
    description: "Risk tiering, propose→approve→commit, decision gates, audit trail, model registry, human-in-the-loop.",
    ownerName: "Devak Kapoor",
    reviewState: "approved",
    canonical: true,
    lastReviewedAgoDays: 5,
    versions: [
      { version: "1.0.0", summary: "Approved at AI Modernization SteerCo. Promoted to canonical.", changedBy: "Devak Kapoor", agoDays: 5 },
      { version: "0.9.2", summary: "Final pre-approval revision; added retention-of-evidence rule.", changedBy: "Devak Kapoor", agoDays: 12 },
    ],
    linkedDecisionIds: ["dec-governance-promotion"],
    linkedEvidenceIds: ["ev-policy-alignment", "ev-tb-directive-cross-ref"],
  },
  {
    id: "art-operating-model",
    engagementId: "eng-agentic-01",
    name: "Operating Model Blueprint — Strategists/Operators/Auditors/CoS",
    type: "blueprint",
    description: "Agent archetype assignments, scope boundaries, escalation paths, and the human-agent bridge.",
    ownerName: "Cassandra Reyes (Dauntless)",
    reviewState: "draft",
    canonical: false,
    lastReviewedAgoDays: 1,
    versions: [
      { version: "0.2.0", summary: "Locked archetype boundaries; added Chief-of-Staff escalation matrix.", changedBy: "Cassandra Reyes (Dauntless)", agoDays: 1 },
      { version: "0.1.0", summary: "Initial blueprint exploring two archetype layouts.", changedBy: "Cassandra Reyes (Dauntless)", agoDays: 14 },
    ],
    linkedDecisionIds: ["dec-archetype-boundary", "dec-cos-escalation"],
    linkedEvidenceIds: ["ev-fleet-design-workshop"],
  },
  {
    id: "art-curriculum",
    engagementId: "eng-training-01",
    name: "AI Literacy Curriculum — Foundations + Practitioner",
    type: "curriculum",
    description: "Eight-module curriculum with sectoral case work, post-program capability assessment, and champion track.",
    ownerName: "Marie Tremblay",
    reviewState: "approved",
    canonical: true,
    lastReviewedAgoDays: 11,
    versions: [
      { version: "2.1.0", summary: "Promoted to canonical; reusable across departments with minor cadence edits.", changedBy: "Marie Tremblay", agoDays: 11 },
      { version: "2.0.0", summary: "Module 6 (Governance-in-practice) rebuilt around live case work.", changedBy: "Marie Tremblay", agoDays: 28 },
    ],
    linkedDecisionIds: [],
    linkedEvidenceIds: ["ev-capability-baseline", "ev-cohort-feedback"],
  },
  {
    id: "art-executive-briefing",
    engagementId: "eng-discovery-01",
    name: "Executive Briefing — Q2 SteerCo",
    type: "briefing",
    description: "Eight-slide narrative for the AI Modernization SteerCo with the top three decisions teed up.",
    ownerName: "Cassandra Reyes (Dauntless)",
    reviewState: "in-review",
    canonical: false,
    lastReviewedAgoDays: 0,
    versions: [
      { version: "0.3.0", summary: "Tightened narrative; surfaced decision queue to slide 4.", changedBy: "Cassandra Reyes (Dauntless)", agoDays: 0 },
      { version: "0.2.0", summary: "First draft with embedded outcome metrics.", changedBy: "Cassandra Reyes (Dauntless)", agoDays: 6 },
    ],
    linkedDecisionIds: ["dec-roadmap-h2-anchor", "dec-archetype-boundary"],
    linkedEvidenceIds: ["ev-steerco-minutes-march"],
  },
  {
    id: "art-decision-architecture",
    engagementId: "eng-agentic-01",
    name: "Decision Architecture — Risk Tiers & Gates",
    type: "decision-architecture",
    description: "Risk-tier matrix mapped to TBS directives, with propose→approve→commit flow per tier.",
    ownerName: "Devak Kapoor",
    reviewState: "needs-revision",
    canonical: false,
    lastReviewedAgoDays: 3,
    versions: [
      { version: "0.2.1", summary: "Revisions requested by Auditor: tighten the high-tier evidence requirement.", changedBy: "Devak Kapoor", agoDays: 3 },
      { version: "0.2.0", summary: "Initial mapping to TB directives complete.", changedBy: "Devak Kapoor", agoDays: 19 },
    ],
    linkedDecisionIds: ["dec-high-tier-evidence"],
    linkedEvidenceIds: ["ev-tb-directive-cross-ref"],
  },
  {
    id: "art-knowledge-map",
    engagementId: "eng-agentic-01",
    name: "Knowledge System Map — Desk/Bookshelf/Cabinet",
    type: "knowledge-map",
    description: "Topology of knowledge artifacts across M0–M4 memory tiers with canonical-promotion paths.",
    ownerName: "Cassandra Reyes (Dauntless)",
    reviewState: "draft",
    canonical: false,
    lastReviewedAgoDays: 4,
    versions: [
      { version: "0.1.0", summary: "First topology with five canonical anchors identified.", changedBy: "Cassandra Reyes (Dauntless)", agoDays: 4 },
    ],
    linkedDecisionIds: ["dec-canonical-promotion-cadence"],
    linkedEvidenceIds: ["ev-canonical-anchor-list"],
  },
  {
    id: "art-activation-plan",
    engagementId: "eng-training-01",
    name: "Activation Plan — Departmental Champions",
    type: "activation-plan",
    description: "Quarter-by-quarter activation plan for embedding training graduates as champions in each line department.",
    ownerName: "Marie Tremblay",
    reviewState: "in-review",
    canonical: false,
    lastReviewedAgoDays: 6,
    versions: [
      { version: "0.3.0", summary: "Added Q3 calibration touchpoints; tightened owner mapping.", changedBy: "Marie Tremblay", agoDays: 6 },
      { version: "0.2.0", summary: "Initial draft with two activation tracks.", changedBy: "Marie Tremblay", agoDays: 20 },
    ],
    linkedDecisionIds: ["dec-activation-pace"],
    linkedEvidenceIds: ["ev-cohort-feedback"],
  },
  {
    id: "art-risk-register",
    engagementId: "eng-discovery-01",
    name: "Risk Register — AI Modernization Program",
    type: "risk-register",
    description: "Living register of program-level risks with risk tier, mitigation, owner, and last review.",
    ownerName: "Devak Kapoor",
    reviewState: "approved",
    canonical: true,
    lastReviewedAgoDays: 8,
    versions: [
      { version: "1.2.0", summary: "Added two procurement-cycle risks; closed one mitigated risk.", changedBy: "Devak Kapoor", agoDays: 8 },
    ],
    linkedDecisionIds: [],
    linkedEvidenceIds: ["ev-procurement-timeline"],
  },
  {
    id: "art-quarterly-impact",
    engagementId: "eng-training-01",
    name: "Quarterly Impact Report — Q1 2026",
    type: "impact-report",
    description: "Before/after evidence on adoption, capability score, cycle time, and decision approval velocity.",
    ownerName: "Cassandra Reyes (Dauntless)",
    reviewState: "approved",
    canonical: true,
    lastReviewedAgoDays: 13,
    versions: [
      { version: "1.0.0", summary: "Promoted to canonical for cross-engagement reference.", changedBy: "Cassandra Reyes (Dauntless)", agoDays: 13 },
    ],
    linkedDecisionIds: [],
    linkedEvidenceIds: ["ev-capability-baseline", "ev-cohort-feedback"],
  },
];

export const mockArtifacts: Artifact[] = artifactSeeds.map((seed) => {
  const seedBody = seed.body ?? defaultBodyFor(seed);
  const versions: ArtifactVersion[] = seed.versions.map((v, idx) => ({
    id: `${seed.id}-v${idx + 1}`,
    artifactId: seed.id,
    version: v.version,
    summary: v.summary,
    changedBy: v.changedBy,
    changedAt: days(v.agoDays),
    // Newest version inherits the seed body; older versions get an
    // abridged snapshot so the diff view has something to render.
    body: idx === 0 ? seedBody : `${seedBody.split("\n").slice(0, 5).join("\n")}\n\n_(historical snapshot of v${v.version})_`,
  }));
  return {
    id: seed.id,
    engagementId: seed.engagementId,
    name: seed.name,
    type: seed.type,
    description: seed.description,
    body: seedBody,
    ownerName: seed.ownerName,
    reviewState: seed.reviewState,
    currentVersionId: versions[0].id,
    versions,
    linkedDecisionIds: seed.linkedDecisionIds,
    linkedEvidenceIds: seed.linkedEvidenceIds,
    lastReviewedAt: days(seed.lastReviewedAgoDays),
    canonical: seed.canonical,
    comments: [],
  };
});

function defaultBodyFor(seed: MockArtifactSeed): string {
  const cites = seed.linkedEvidenceIds.slice(0, 2).map((id) => `[[${id}]]`).join(" ");
  return `# ${seed.name}\n\n${seed.description}\n\n## Why this matters\n\nThis artifact anchors the workspace's thinking on ${seed.type.replace("-", " ")}. Cited evidence: ${cites || "_(none yet)_"}.\n\n## Status\n\n- Owner: ${seed.ownerName}\n- Review: ${seed.reviewState}\n${seed.canonical ? "- Canonical: yes\n" : ""}\n## Open questions\n\nReplace this block with the open questions surfaced by the engagement team.`;
}

// ── Decisions ───────────────────────────────────────────────────────

export const mockDecisions: Decision[] = [
  {
    id: "dec-roadmap-h2-anchor",
    engagementId: "eng-discovery-01",
    title: "Anchor Horizon-2 around 'AI for service-design' instead of 'AI for HR-ops'",
    status: "pending-approval",
    riskTier: "high",
    dueAt: days(-3),
    recommendation: {
      summary: "Move HR-ops to Horizon 3 and elevate Service Design as the anchor bet for Horizon 2.",
      rationale: "Service design has clearer outcome telemetry, stronger SME availability, and is the unblocker for three downstream bets.",
      options: [
        { label: "Adopt — anchor on Service Design", description: "Re-sequence the roadmap; communicate to HR-ops branch by end of week.", isDefault: true },
        { label: "Defer to Q3", description: "Keep both bets parallel until the next SteerCo." },
        { label: "Reject", description: "Maintain HR-ops as the Horizon-2 anchor and accept the SME-availability risk." },
      ],
      defaultChoice: "Adopt — anchor on Service Design",
      confidence: 0.78,
    },
    evidenceIds: ["ev-interview-synthesis", "ev-steerco-minutes-march"],
    artifactIds: ["art-roadmap", "art-executive-briefing"],
    proposedBy: "agent-engagement-analyst",
  },
  {
    id: "dec-archetype-boundary",
    engagementId: "eng-agentic-01",
    title: "Hard-separate Strategist agents from Operator agents in the production fleet",
    status: "pending-approval",
    riskTier: "high",
    dueAt: days(-1),
    recommendation: {
      summary: "Codify the separation of powers: no agent both routes and executes work.",
      rationale: "Auditor flagged a path where the triage agent could shortcut into operator actions. The marketing principle ('no agent routes and executes, no agent produces and audits') is the right hardening.",
      options: [
        { label: "Adopt — hard separation", description: "Enforce at the agent runtime layer; deny operator tools to strategists.", isDefault: true },
        { label: "Soft separation w/ alerts", description: "Allow both, raise an alert on combined-use." },
      ],
      defaultChoice: "Adopt — hard separation",
      confidence: 0.91,
    },
    evidenceIds: ["ev-fleet-design-workshop"],
    artifactIds: ["art-operating-model", "art-executive-briefing"],
    proposedBy: "agent-governance-auditor",
  },
  {
    id: "dec-high-tier-evidence",
    engagementId: "eng-agentic-01",
    title: "Require two independent evidence sources for every high-tier decision",
    status: "pending-approval",
    riskTier: "medium",
    dueAt: days(-5),
    recommendation: {
      summary: "Tighten the evidence requirement for high-tier decisions from one to two independent sources.",
      rationale: "Three of the last twelve high-tier decisions had only a single sourced evidence record. Doubling the bar costs the team ~3% more cycle time but materially raises auditability.",
      options: [
        { label: "Adopt — two-source rule", description: "Apply prospectively; do not back-revise approved decisions.", isDefault: true },
        { label: "Defer", description: "Revisit after the Q2 SteerCo." },
      ],
      defaultChoice: "Adopt — two-source rule",
      confidence: 0.83,
    },
    evidenceIds: ["ev-tb-directive-cross-ref"],
    artifactIds: ["art-decision-architecture", "art-governance"],
    proposedBy: "agent-governance-auditor",
  },
  {
    id: "dec-canonical-promotion-cadence",
    engagementId: "eng-agentic-01",
    title: "Set canonical-promotion review cadence to bi-weekly",
    status: "pending-approval",
    riskTier: "low",
    dueAt: days(-12),
    recommendation: {
      summary: "Run the canonical-promotion review on a fixed bi-weekly cadence chaired by the Knowledge Lead.",
      rationale: "Without a cadence, the Bookshelf accumulates lag and the M2/M3 boundary blurs. Bi-weekly aligns with TBS branch operating rhythm.",
      options: [
        { label: "Bi-weekly", description: "Recommended.", isDefault: true },
        { label: "Monthly", description: "Less burden, slower compounding." },
      ],
      defaultChoice: "Bi-weekly",
      confidence: 0.74,
    },
    evidenceIds: ["ev-canonical-anchor-list"],
    artifactIds: ["art-knowledge-map"],
    proposedBy: "agent-engagement-analyst",
  },
  {
    id: "dec-roadmap-phase2-procurement",
    engagementId: "eng-discovery-01",
    title: "Pre-stage procurement for the Phase-2 Design Sprint",
    status: "approved",
    riskTier: "medium",
    decidedAt: days(4),
    decidedBy: "Dr. Eleanor Vance",
    recommendation: {
      summary: "Open the procurement vehicle two weeks ahead of formal Phase-1 close to avoid the gating slip.",
      rationale: "Three of the last four similar engagements lost 18–22 days at this gate. Pre-staging recovers most of it.",
      options: [
        { label: "Pre-stage now", description: "Approved.", isDefault: true },
        { label: "Wait", description: "Accept the historical slip." },
      ],
      defaultChoice: "Pre-stage now",
      confidence: 0.88,
    },
    evidenceIds: ["ev-procurement-timeline"],
    artifactIds: ["art-roadmap"],
    proposedBy: "Dauntless team",
  },
  {
    id: "dec-governance-promotion",
    engagementId: "eng-discovery-01",
    title: "Promote Governance Framework v1.0.0 to canonical",
    status: "approved",
    riskTier: "low",
    decidedAt: days(5),
    decidedBy: "Devak Kapoor",
    recommendation: {
      summary: "Canonical-promote the framework so all subsequent engagements reuse it.",
      rationale: "Two SteerCo cycles validated it; no outstanding revisions.",
      options: [
        { label: "Promote", description: "Approved.", isDefault: true },
      ],
      defaultChoice: "Promote",
      confidence: 0.96,
    },
    evidenceIds: ["ev-policy-alignment"],
    artifactIds: ["art-governance"],
    proposedBy: "agent-engagement-analyst",
  },
  {
    id: "dec-cos-escalation",
    engagementId: "eng-agentic-01",
    title: "Route 'medium-tier ambiguity' escalations through the Chief-of-Staff agent",
    status: "deferred",
    riskTier: "medium",
    decidedAt: days(2),
    decidedBy: "Dr. Eleanor Vance",
    dueAt: days(-21),
    recommendation: {
      summary: "Centralize medium-tier ambiguity escalations through the CoS agent for consistency.",
      rationale: "Currently each Operator decides whether to escalate; results vary by agent.",
      options: [
        { label: "Centralize via CoS", description: "Default.", isDefault: true },
        { label: "Keep decentralized", description: "Status quo." },
      ],
      defaultChoice: "Centralize via CoS",
      confidence: 0.62,
    },
    evidenceIds: ["ev-fleet-design-workshop"],
    artifactIds: ["art-operating-model"],
    proposedBy: "agent-chief-of-staff",
  },
  {
    id: "dec-activation-pace",
    engagementId: "eng-training-01",
    title: "Hold the activation pace at one department per fortnight",
    status: "approved",
    riskTier: "low",
    decidedAt: days(6),
    decidedBy: "Marie Tremblay",
    recommendation: {
      summary: "Maintain the current cadence; resist the pull to compress.",
      rationale: "Champion calibration time is the bottleneck, not curriculum throughput.",
      options: [
        { label: "Hold pace", description: "Approved.", isDefault: true },
        { label: "Compress", description: "Risky given calibration data." },
      ],
      defaultChoice: "Hold pace",
      confidence: 0.81,
    },
    evidenceIds: ["ev-cohort-feedback"],
    artifactIds: ["art-activation-plan"],
    proposedBy: "agent-activation-coach",
  },
  {
    id: "dec-superseded-roadmap-h1",
    engagementId: "eng-discovery-01",
    title: "Anchor Horizon-1 on 'Document triage' bet",
    status: "superseded",
    riskTier: "medium",
    decidedAt: days(28),
    decidedBy: "Dauntless team",
    recommendation: {
      summary: "Superseded by decision dec-roadmap-h2-anchor and the revised three-horizon structure.",
      rationale: "Horizon-1 was rebalanced after the Discovery synthesis surfaced higher-leverage anchors.",
      options: [
        { label: "Adopt", description: "Now superseded.", isDefault: true },
      ],
      defaultChoice: "Adopt",
      confidence: 0.70,
    },
    evidenceIds: ["ev-interview-synthesis"],
    artifactIds: ["art-roadmap"],
    proposedBy: "Dauntless team",
  },
];

// ── Tasks / milestones ──────────────────────────────────────────────

export const mockTasks: Task[] = [
  { id: "t-1",  engagementId: "eng-discovery-01", title: "Run Discovery interview round 3 (line departments E–I)", status: "in-progress", phase: "discovery", ownerName: "Devak Kapoor", progress: 60, dueAt: days(-4), isMilestone: false },
  { id: "t-2",  engagementId: "eng-discovery-01", title: "Synthesize interview data into opportunity map",          status: "in-progress", phase: "discovery", ownerName: "Cassandra Reyes (Dauntless)", progress: 35, dueAt: days(-6), isMilestone: false },
  { id: "t-3",  engagementId: "eng-discovery-01", title: "Deliver Executive Briefing to AI Modernization SteerCo",  status: "todo",        phase: "deliver",   ownerName: "Cassandra Reyes (Dauntless)", progress: 0,  dueAt: days(-9), isMilestone: true },
  { id: "t-4",  engagementId: "eng-discovery-01", title: "Confirm Phase-2 procurement vehicle is staged",            status: "complete",    phase: "deliver",   ownerName: "Devak Kapoor", progress: 100, dueAt: days(2),  isMilestone: false },
  { id: "t-5",  engagementId: "eng-training-01",  title: "Deliver Foundations cohort 3 (executive level)",            status: "in-progress", phase: "deliver",   ownerName: "Marie Tremblay", progress: 70, dueAt: days(-2), isMilestone: false },
  { id: "t-6",  engagementId: "eng-training-01",  title: "Run capability post-assessment for cohorts 1–2",            status: "todo",        phase: "activate",  ownerName: "Marie Tremblay", progress: 0,  dueAt: days(-11), isMilestone: true },
  { id: "t-7",  engagementId: "eng-training-01",  title: "Nominate departmental champions",                           status: "blocked",     phase: "activate",  ownerName: "Marie Tremblay", progress: 25, dueAt: days(-7), isMilestone: false, blockedReason: "Awaiting nominee lists from 2 of 9 line departments." },
  { id: "t-8",  engagementId: "eng-agentic-01",   title: "Lock agent archetype boundaries in the blueprint",          status: "in-progress", phase: "design",    ownerName: "Cassandra Reyes (Dauntless)", progress: 80, dueAt: days(-1), isMilestone: false },
  { id: "t-9",  engagementId: "eng-agentic-01",   title: "Map risk tiers to TB directives end-to-end",                status: "in-progress", phase: "design",    ownerName: "Devak Kapoor", progress: 55, dueAt: days(-5), isMilestone: false },
  { id: "t-10", engagementId: "eng-agentic-01",   title: "Draft canonical-promotion playbook",                        status: "todo",        phase: "design",    ownerName: "Cassandra Reyes (Dauntless)", progress: 10, dueAt: days(-14), isMilestone: false },
  { id: "t-11", engagementId: "eng-agentic-01",   title: "GCKey federation conversation w/ TBS identity",             status: "blocked",     phase: "design",    ownerName: "Devak Kapoor", progress: 0,  dueAt: days(-10), isMilestone: false, blockedReason: "Awaiting identity branch greenlight before scoping work continues." },
  { id: "t-12", engagementId: "eng-discovery-01", title: "Approve Horizon-2 anchor bet",                              status: "todo",        phase: "deliver",   ownerName: "Dr. Eleanor Vance", progress: 0, dueAt: days(-3), isMilestone: true },
  { id: "t-13", engagementId: "eng-agentic-01",   title: "Approve agent-archetype hard-separation",                   status: "todo",        phase: "design",    ownerName: "Dr. Eleanor Vance", progress: 0, dueAt: days(-1), isMilestone: true },
  { id: "t-14", engagementId: "eng-training-01",  title: "Quarterly Impact Report Q2 outline",                        status: "todo",        phase: "compound",  ownerName: "Cassandra Reyes (Dauntless)", progress: 0, dueAt: days(-32), isMilestone: false },
];

// ── Signals ─────────────────────────────────────────────────────────

export const mockSignals: Signal[] = [
  { id: "s-1",  workspaceId: mockWorkspace.id, engagementId: "eng-discovery-01", kind: "decision-proposed", severity: "important", title: "New decision proposed: anchor Horizon-2 on Service Design", detail: "Engagement Analyst surfaced a re-sequencing recommendation after the interview synthesis. Confidence 0.78.", source: "Engagement Analyst", refId: "dec-roadmap-h2-anchor", capturedAt: hours(2) },
  { id: "s-2",  workspaceId: mockWorkspace.id, engagementId: "eng-agentic-01",   kind: "decision-proposed", severity: "urgent",    title: "Auditor recommends hard separation of Strategist/Operator agents", detail: "Path identified where a triage agent could shortcut into operator actions.", source: "Governance Auditor", refId: "dec-archetype-boundary", capturedAt: hours(5) },
  { id: "s-3",  workspaceId: mockWorkspace.id, engagementId: "eng-agentic-01",   kind: "artifact-updated", severity: "notable",   title: "Operating Model Blueprint v0.2.0 published", detail: "Locked archetype boundaries; added Chief-of-Staff escalation matrix.", source: "Cassandra Reyes", refId: "art-operating-model", capturedAt: hours(28) },
  { id: "s-4",  workspaceId: mockWorkspace.id, engagementId: "eng-discovery-01", kind: "milestone-hit",    severity: "notable",   title: "Phase-2 procurement vehicle staged", detail: "Recovers an estimated 18 days at the Discovery→Design gate.", source: "Devak Kapoor", refId: "t-4", capturedAt: hours(46) },
  { id: "s-5",  workspaceId: mockWorkspace.id, engagementId: "eng-training-01",  kind: "risk-raised",      severity: "important", title: "Champion nomination blocked at 2 of 9 departments", detail: "Calendaring conflicts with spring estimates cycle.", source: "Marie Tremblay", refId: "t-7", capturedAt: hours(34) },
  { id: "s-6",  workspaceId: mockWorkspace.id, engagementId: "eng-discovery-01", kind: "decision-decided", severity: "notable",   title: "Governance Framework v1.0.0 approved & promoted", detail: "Promoted to canonical. Reusable across engagements.", source: "Devak Kapoor", refId: "dec-governance-promotion", capturedAt: days(5) },
  { id: "s-7",  workspaceId: mockWorkspace.id, engagementId: "eng-agentic-01",   kind: "agent-action",     severity: "info",      title: "Engagement Analyst summarized 14 source documents", detail: "Output linked to the Strategic AI Roadmap synthesis.", source: "Engagement Analyst", refId: "agent-engagement-analyst", capturedAt: hours(11) },
  { id: "s-8",  workspaceId: mockWorkspace.id, engagementId: "eng-training-01",  kind: "metric-shift",     severity: "important", title: "Capability score baseline rose 12 points across cohorts 1–2", detail: "Largest gains in Module 6 (Governance-in-practice).", source: "Training program telemetry", refId: "met-capability-score", capturedAt: days(2) },
  { id: "s-9",  workspaceId: mockWorkspace.id, engagementId: "eng-agentic-01",   kind: "knowledge-promoted", severity: "notable", title: "Risk Register promoted to canonical", detail: "Now part of the reusable workspace Bookshelf.", source: "Knowledge Lead", refId: "art-risk-register", capturedAt: days(8) },
  { id: "s-10", workspaceId: mockWorkspace.id, engagementId: "eng-discovery-01", kind: "artifact-updated", severity: "info",      title: "Executive Briefing draft updated", detail: "Decision queue surfaced to slide 4.", source: "Cassandra Reyes", refId: "art-executive-briefing", capturedAt: mins(180) },
  { id: "s-11", workspaceId: mockWorkspace.id, engagementId: "eng-agentic-01",   kind: "risk-raised",      severity: "important", title: "GCKey federation greenlight still pending", detail: "Blocking agent service-account scoping.", source: "Devak Kapoor", refId: "t-11", capturedAt: days(1) },
  { id: "s-12", workspaceId: mockWorkspace.id, engagementId: "eng-training-01",  kind: "agent-action",     severity: "info",      title: "Activation Coach proposed Q3 calibration cadence", detail: "Routed to the activation plan.", source: "Activation Coach", refId: "agent-activation-coach", capturedAt: hours(20) },
];

// ── Agents ──────────────────────────────────────────────────────────

export const mockAgents: Agent[] = [
  {
    id: "agent-concierge",
    name: "Concierge",
    archetype: "chief-of-staff",
    role: "Workspace concierge — routing, escalations, summaries",
    state: "active",
    model: "claude-opus-4-7",
    scope: [],
    tools: ["search", "summarize", "schedule", "route-to-agent"],
    decisionsTouched: 14,
    conversationsLast7d: 22,
    lastActiveAt: mins(3),
    exampleQuestions: [
      "What are the top three decisions waiting on me?",
      "Summarize the last SteerCo and what changed since.",
      "Schedule a 20-minute walkthrough of the Decision Architecture.",
    ],
  },
  {
    id: "agent-engagement-analyst",
    name: "Engagement Analyst",
    archetype: "strategist",
    role: "Cross-engagement synthesis and proposal",
    state: "thinking",
    model: "claude-sonnet-4-6",
    scope: ["eng-discovery-01", "eng-agentic-01"],
    tools: ["search", "synthesize", "propose-decision", "draft-artifact"],
    decisionsTouched: 9,
    conversationsLast7d: 11,
    lastActiveAt: mins(6),
    exampleQuestions: [
      "What patterns appeared across the interview round?",
      "Draft a Horizon-2 anchor recommendation for the SteerCo.",
      "Compare risk tiers across the active engagements.",
    ],
  },
  {
    id: "agent-report-builder",
    name: "Report Builder",
    archetype: "operator",
    role: "Polished executive narratives and briefings",
    state: "idle",
    model: "claude-sonnet-4-6",
    scope: ["eng-discovery-01", "eng-training-01"],
    tools: ["draft-briefing", "render-chart", "format-narrative", "cite-evidence"],
    decisionsTouched: 4,
    conversationsLast7d: 5,
    lastActiveAt: hours(7),
    exampleQuestions: [
      "Draft the Q2 SteerCo briefing in eight slides.",
      "Build a board-ready summary of training outcomes.",
      "Generate a one-pager for each Horizon-2 bet.",
    ],
  },
  {
    id: "agent-governance-auditor",
    name: "Governance Auditor",
    archetype: "auditor",
    role: "Independent assurance — risk tier and decision-gate enforcement",
    state: "complete",
    model: "claude-opus-4-7",
    scope: ["eng-agentic-01", "eng-discovery-01"],
    tools: ["check-evidence", "verify-risk-tier", "audit-decision", "flag-deviation"],
    decisionsTouched: 12,
    conversationsLast7d: 7,
    lastActiveAt: hours(2),
    exampleQuestions: [
      "Which high-tier decisions are missing a second evidence source?",
      "Has any agent both routed and executed in the last 7 days?",
      "Audit the trail for decision dec-archetype-boundary.",
    ],
  },
  {
    id: "agent-activation-coach",
    name: "Activation Coach",
    archetype: "operator",
    role: "Champion enablement and post-engagement calibration",
    state: "updated",
    model: "claude-sonnet-4-6",
    scope: ["eng-training-01"],
    tools: ["coach-prompt", "calibrate", "schedule-checkpoint", "summarize-feedback"],
    decisionsTouched: 3,
    conversationsLast7d: 9,
    lastActiveAt: mins(45),
    exampleQuestions: [
      "Which champions need a calibration touchpoint this cycle?",
      "Summarize the cohort-2 post-program feedback.",
      "Recommend a Q3 cadence based on real calibration data.",
    ],
  },
  {
    id: "agent-roadmap-strategist",
    name: "Roadmap Strategist",
    archetype: "strategist",
    role: "Cross-engagement sequencing — what should run when and why",
    state: "idle",
    model: "claude-sonnet-4-6",
    scope: [],
    tools: ["search-artifacts", "summarize-signals", "propose-decision"],
    decisionsTouched: 2,
    conversationsLast7d: 4,
    lastActiveAt: hours(18),
    exampleQuestions: [
      "Which engagement should anchor next quarter?",
      "Are we paying for two Discovery streams that should be one?",
      "What's the simplest path that unblocks the most engagements?",
    ],
  },
  {
    id: "agent-artifact-drafter",
    name: "Artifact Drafter",
    archetype: "operator",
    role: "Focused artifact drafts from cited evidence",
    state: "idle",
    model: "claude-haiku-4-5",
    scope: [],
    tools: ["search-artifacts", "draft-artifact-version", "request-review"],
    decisionsTouched: 0,
    conversationsLast7d: 2,
    lastActiveAt: hours(36),
    exampleQuestions: [
      "Draft a tight Decision Brief for the next SteerCo packet.",
      "Patch the Curriculum artifact with the cohort-2 rebuild outcomes.",
      "Add an Impact Report section anchoring on Adoption + Capability.",
    ],
  },
  {
    id: "agent-evidence-auditor",
    name: "Evidence Auditor",
    archetype: "auditor",
    role: "Verifies evidence chains across decisions and artifacts",
    state: "idle",
    model: "claude-haiku-4-5",
    scope: [],
    tools: ["search-artifacts", "audit-evidence-completeness", "propose-revision"],
    decisionsTouched: 5,
    conversationsLast7d: 3,
    lastActiveAt: hours(9),
    exampleQuestions: [
      "Find decisions citing fewer than two evidence rows.",
      "Verify the evidence chain on the canonical Operating Model Blueprint.",
      "Sweep for artifacts that need to recite evidence after the latest signals.",
    ],
  },
];

// ── Conversations ───────────────────────────────────────────────────

export const mockConversations: Conversation[] = [
  {
    id: "conv-concierge-1",
    agentId: "agent-concierge",
    workspaceId: mockWorkspace.id,
    title: "What needs my judgment this week?",
    lastTurnAt: mins(4),
    messages: [
      { id: "m1", role: "user", content: "Concierge — what are the top three decisions waiting on me?", timestamp: mins(6) },
      {
        id: "m2", role: "assistant", agentId: "agent-concierge",
        content:
          "Three decisions are waiting on you, in order of risk × due-date:\n" +
          "1. Anchor Horizon-2 on Service Design — high tier, default: Adopt, confidence 0.78.\n" +
          "2. Hard-separate Strategist & Operator agents — high tier, default: Adopt, confidence 0.91.\n" +
          "3. Require two evidence sources for high-tier decisions — medium tier, default: Adopt, confidence 0.83.\n" +
          "I can pull each one into a 5-minute briefing if you want to start with #1.",
        timestamp: mins(4),
      },
    ],
  },
  {
    id: "conv-analyst-1",
    agentId: "agent-engagement-analyst",
    workspaceId: mockWorkspace.id,
    title: "Horizon-2 anchor rationale",
    lastTurnAt: hours(2),
    messages: [
      { id: "m1", role: "user", content: "Why service design over HR-ops for the Horizon-2 anchor?", timestamp: hours(3) },
      {
        id: "m2", role: "assistant", agentId: "agent-engagement-analyst",
        content:
          "Three lines of evidence pointed to Service Design: (1) outcome telemetry is already wired in your Service Design Catalogue, so before/after measurement is cheap; (2) SME availability is roughly 2× HR-ops based on the interview matrix; (3) three downstream Horizon-3 bets depend on Service-Design plumbing, so anchoring here unblocks them. I attached the synthesis evidence and the Horizon dependency map to the proposal.",
        timestamp: hours(2),
      },
    ],
  },
];

// ── Knowledge items (Desk / Bookshelf / Cabinet) ────────────────────

export const mockKnowledge: KnowledgeItem[] = [
  // Desk — operational (M0–M1)
  { id: "k-1",  workspaceId: mockWorkspace.id, title: "Live Q2 SteerCo briefing draft",                         shelf: "desk",      memoryTier: "M0", confidence: 0.62, freshness: "fresh", source: "Executive Briefing v0.3.0", sourceKind: "artifact", canonical: false, lastValidatedAt: mins(180), summary: "Draft narrative — high churn, do not cite yet." },
  { id: "k-2",  workspaceId: mockWorkspace.id, title: "Interview round 3 raw notes",                            shelf: "desk",      memoryTier: "M0", confidence: 0.55, freshness: "fresh", source: "Discovery field notes",       sourceKind: "external", canonical: false, lastValidatedAt: days(1),   summary: "Raw qualitative input; awaiting synthesis." },
  { id: "k-3",  workspaceId: mockWorkspace.id, title: "Current decision queue (top 4)",                         shelf: "desk",      memoryTier: "M1", confidence: 0.85, freshness: "fresh", source: "Decision Register",          sourceKind: "decision",  canonical: false, lastValidatedAt: hours(2),  summary: "What needs the executive's judgment this week." },
  { id: "k-4",  workspaceId: mockWorkspace.id, title: "Champion calibration backlog",                           shelf: "desk",      memoryTier: "M1", confidence: 0.71, freshness: "aging", source: "Activation Plan",            sourceKind: "artifact",  canonical: false, lastValidatedAt: days(6),   summary: "Three champions due for calibration touchpoint." },
  // Bookshelf — proven, promoted (M2–M3)
  { id: "k-5",  workspaceId: mockWorkspace.id, title: "Governance Framework — Six Pillars (v1.0.0)",            shelf: "bookshelf", memoryTier: "M3", confidence: 0.96, freshness: "fresh", source: "Governance Framework v1.0.0", sourceKind: "artifact", canonical: true,  promotedAt: days(5),  lastValidatedAt: days(5),  summary: "Canonical. Reusable across engagements." },
  { id: "k-6",  workspaceId: mockWorkspace.id, title: "Risk Register — TBS AI Modernization",                   shelf: "bookshelf", memoryTier: "M2", confidence: 0.88, freshness: "fresh", source: "Risk Register v1.2.0",        sourceKind: "artifact", canonical: true,  promotedAt: days(8),  lastValidatedAt: days(8),  summary: "Bi-weekly review. Two new procurement risks added." },
  { id: "k-7",  workspaceId: mockWorkspace.id, title: "AI Literacy Curriculum — Foundations + Practitioner",    shelf: "bookshelf", memoryTier: "M3", confidence: 0.92, freshness: "fresh", source: "Curriculum v2.1.0",          sourceKind: "artifact", canonical: true,  promotedAt: days(11), lastValidatedAt: days(11), summary: "Canonical. Reusable with minor cadence edits." },
  { id: "k-8",  workspaceId: mockWorkspace.id, title: "Quarterly Impact Report — Q1 2026",                       shelf: "bookshelf", memoryTier: "M2", confidence: 0.86, freshness: "aging", source: "Impact Report Q1 2026",     sourceKind: "artifact", canonical: true,  promotedAt: days(13), lastValidatedAt: days(13), summary: "Before/after evidence on adoption and capability." },
  // Filing Cabinet — archived (M4)
  { id: "k-9",  workspaceId: mockWorkspace.id, title: "Horizon-1 doc-triage anchor (superseded)",                shelf: "cabinet",   memoryTier: "M4", confidence: 0.40, freshness: "stale", source: "Decision dec-superseded-roadmap-h1", sourceKind: "decision", canonical: false, lastValidatedAt: days(28), summary: "Superseded by the revised Horizon structure. Kept for audit." },
  { id: "k-10", workspaceId: mockWorkspace.id, title: "Q4 2025 SteerCo minutes",                                 shelf: "cabinet",   memoryTier: "M4", confidence: 0.55, freshness: "stale", source: "SteerCo minutes Q4 2025",   sourceKind: "external", canonical: false, lastValidatedAt: days(120), summary: "Historical context for procurement gating decisions." },
  { id: "k-11", workspaceId: mockWorkspace.id, title: "Legacy AI Pilot inventory (pre-engagement)",              shelf: "cabinet",   memoryTier: "M4", confidence: 0.48, freshness: "stale", source: "Pre-engagement intake",     sourceKind: "external", canonical: false, lastValidatedAt: days(150), summary: "What TBS had tried before — 7 pilots, 2 still live." },
  { id: "k-12", workspaceId: mockWorkspace.id, title: "Curriculum v1.x — legacy modules",                        shelf: "cabinet",   memoryTier: "M4", confidence: 0.50, freshness: "stale", source: "Curriculum v1.4.2",        sourceKind: "artifact",  canonical: false, lastValidatedAt: days(85),  summary: "Pre-v2 modules; replaced after Module 6 rebuild." },
];

// ── Metrics (8 outcome metrics with short series) ───────────────────

export const mockMetrics: Metric[] = [
  {
    id: "met-adoption",
    workspaceId: mockWorkspace.id,
    key: "adoption",
    label: "Tool & workflow adoption",
    unit: "percent",
    current: 71,
    baseline: 34,
    target: 85,
    trend: "up",
    trendValue: "+9 pts",
    series: [
      { period: "Wk 1", value: 34 }, { period: "Wk 2", value: 41 }, { period: "Wk 3", value: 48 },
      { period: "Wk 4", value: 55 }, { period: "Wk 5", value: 60 }, { period: "Wk 6", value: 64 },
      { period: "Wk 7", value: 68 }, { period: "Wk 8", value: 71 },
    ],
    narrative: "Adoption is climbing steadily as cohorts complete and champions activate. Largest gains in Service Design and Audit branches.",
  },
  {
    id: "met-cycle-time",
    workspaceId: mockWorkspace.id,
    key: "cycle-time",
    label: "Decision cycle time",
    unit: "days",
    current: 5.4,
    baseline: 12.1,
    target: 4.0,
    trend: "down",
    trendValue: "-1.6 d",
    series: [
      { period: "Wk 1", value: 12.1 }, { period: "Wk 2", value: 11.4 }, { period: "Wk 3", value: 9.8 },
      { period: "Wk 4", value: 8.6 },  { period: "Wk 5", value: 7.4 },  { period: "Wk 6", value: 6.5 },
      { period: "Wk 7", value: 5.9 },  { period: "Wk 8", value: 5.4 },
    ],
    narrative: "From propose to decided — falling because the decision register surfaces ambiguity earlier and the audit pass is parallelized.",
  },
  {
    id: "met-capability-score",
    workspaceId: mockWorkspace.id,
    key: "capability-score",
    label: "Capability score (avg.)",
    unit: "score",
    current: 73,
    baseline: 51,
    target: 80,
    trend: "up",
    trendValue: "+12 pts",
    series: [
      { period: "Wk 1", value: 51 }, { period: "Wk 2", value: 54 }, { period: "Wk 3", value: 58 },
      { period: "Wk 4", value: 62 }, { period: "Wk 5", value: 65 }, { period: "Wk 6", value: 68 },
      { period: "Wk 7", value: 71 }, { period: "Wk 8", value: 73 },
    ],
    narrative: "Capability score rose 12 points after the Module 6 rebuild. Champion track expected to add another 4–6 points.",
  },
  {
    id: "met-governance-readiness",
    workspaceId: mockWorkspace.id,
    key: "governance-readiness",
    label: "Governance readiness",
    unit: "percent",
    current: 84,
    baseline: 42,
    target: 90,
    trend: "up",
    trendValue: "+6 pts",
    series: [
      { period: "Wk 1", value: 42 }, { period: "Wk 2", value: 49 }, { period: "Wk 3", value: 58 },
      { period: "Wk 4", value: 65 }, { period: "Wk 5", value: 71 }, { period: "Wk 6", value: 76 },
      { period: "Wk 7", value: 81 }, { period: "Wk 8", value: 84 },
    ],
    narrative: "Pillar coverage at 84%. The two open pillars are 'evidence retention SOP' and 'auditor independence rotation' — both inside scope.",
  },
  {
    id: "met-review-velocity",
    workspaceId: mockWorkspace.id,
    key: "review-velocity",
    label: "Artifact review velocity",
    unit: "days",
    current: 2.3,
    baseline: 6.1,
    target: 2.0,
    trend: "down",
    trendValue: "-0.4 d",
    series: [
      { period: "Wk 1", value: 6.1 }, { period: "Wk 2", value: 5.4 }, { period: "Wk 3", value: 4.6 },
      { period: "Wk 4", value: 3.9 }, { period: "Wk 5", value: 3.2 }, { period: "Wk 6", value: 2.8 },
      { period: "Wk 7", value: 2.5 }, { period: "Wk 8", value: 2.3 },
    ],
    narrative: "Median time from artifact published to reviewer comment. Approaching the 2-day target.",
  },
  {
    id: "met-decision-approval-cycle",
    workspaceId: mockWorkspace.id,
    key: "decision-approval-cycle",
    label: "Decision approval cycle",
    unit: "days",
    current: 3.6,
    baseline: 9.4,
    target: 3.0,
    trend: "down",
    trendValue: "-0.7 d",
    series: [
      { period: "Wk 1", value: 9.4 }, { period: "Wk 2", value: 8.1 }, { period: "Wk 3", value: 7.0 },
      { period: "Wk 4", value: 6.2 }, { period: "Wk 5", value: 5.3 }, { period: "Wk 6", value: 4.5 },
      { period: "Wk 7", value: 4.0 }, { period: "Wk 8", value: 3.6 },
    ],
    narrative: "From propose to decided across approved decisions only. Falling because evidence is pre-bundled.",
  },
  {
    id: "met-canonical-density",
    workspaceId: mockWorkspace.id,
    key: "canonical-density",
    label: "Canonical knowledge density",
    unit: "ratio",
    current: 0.31,
    baseline: 0.07,
    target: 0.40,
    trend: "up",
    trendValue: "+0.04",
    series: [
      { period: "Wk 1", value: 0.07 }, { period: "Wk 2", value: 0.10 }, { period: "Wk 3", value: 0.13 },
      { period: "Wk 4", value: 0.17 }, { period: "Wk 5", value: 0.21 }, { period: "Wk 6", value: 0.25 },
      { period: "Wk 7", value: 0.28 }, { period: "Wk 8", value: 0.31 },
    ],
    narrative: "Share of knowledge items promoted to canonical. The compounding metric — every promotion lowers the cost of the next engagement.",
  },
  {
    id: "met-agent-action-trace",
    workspaceId: mockWorkspace.id,
    key: "agent-action-trace",
    label: "Agent actions traced (audit)",
    unit: "percent",
    current: 100,
    baseline: 100,
    target: 100,
    trend: "flat",
    trendValue: "100%",
    series: [
      { period: "Wk 1", value: 100 }, { period: "Wk 2", value: 100 }, { period: "Wk 3", value: 100 },
      { period: "Wk 4", value: 100 }, { period: "Wk 5", value: 100 }, { period: "Wk 6", value: 100 },
      { period: "Wk 7", value: 100 }, { period: "Wk 8", value: 100 },
    ],
    narrative: "Every agent action has a trace entry. Non-negotiable — flat at 100% by design.",
  },
];

// ── Evidence ────────────────────────────────────────────────────────

export const mockEvidence: Evidence[] = [
  { id: "ev-interview-synthesis",  workspaceId: mockWorkspace.id, kind: "workflow-log", refId: "wf-interview-synth-04", title: "Interview synthesis log — round 3",                snippet: "14 source documents fused into 6 themes; 2 themes promoted to Horizon-anchor candidates.", source: "Engagement Analyst",  capturedAt: hours(11) },
  { id: "ev-steerco-minutes-march",workspaceId: mockWorkspace.id, kind: "source",       refId: "doc-steerco-march",   title: "AI Modernization SteerCo — March minutes",            snippet: "SteerCo signaled willingness to anchor around outcome-rich domains; Service Design called out by 4/7 members.", source: "TBS SteerCo Secretariat", capturedAt: days(28) },
  { id: "ev-policy-alignment",     workspaceId: mockWorkspace.id, kind: "source",       refId: "doc-policy-align",    title: "Cross-reference: Governance Framework × TB directives", snippet: "Six pillars map 1:1 to TB directive sections 4.1–4.6 with no exception cases.", source: "Devak Kapoor", capturedAt: days(7) },
  { id: "ev-tb-directive-cross-ref", workspaceId: mockWorkspace.id, kind: "source",     refId: "doc-tb-directive",    title: "TB Directive on Automated Decision-Making — annotated", snippet: "High-tier decisions require auditability; current bar of one evidence source is the floor, not the ceiling.", source: "Devak Kapoor", capturedAt: days(10) },
  { id: "ev-fleet-design-workshop",workspaceId: mockWorkspace.id, kind: "workflow-log", refId: "wf-fleet-design-1",   title: "Fleet design workshop — outcome log",                snippet: "Three boundary scenarios stress-tested; only the hard-separation layout survived all three.", source: "Cassandra Reyes", capturedAt: days(2) },
  { id: "ev-capability-baseline", workspaceId: mockWorkspace.id,  kind: "metric",       refId: "met-capability-score", title: "Capability score baseline (pre-training)",            snippet: "Average 51 across 168 participants. Bottom quartile concentrated in Service Design.", source: "Training program telemetry", capturedAt: days(74) },
  { id: "ev-cohort-feedback",     workspaceId: mockWorkspace.id,  kind: "workflow-log", refId: "wf-cohort-fb-2",      title: "Cohort 2 post-program feedback synthesis",            snippet: "Module 6 rebuild rated 'most valuable' by 81% of respondents.", source: "Marie Tremblay", capturedAt: days(14) },
  { id: "ev-procurement-timeline",workspaceId: mockWorkspace.id,  kind: "source",       refId: "doc-procurement",     title: "Procurement gating — historical timeline",            snippet: "Three of the last four similar engagements slipped 18–22 days at the Discovery→Design gate.", source: "TBS Procurement", capturedAt: days(35) },
  { id: "ev-canonical-anchor-list", workspaceId: mockWorkspace.id, kind: "artifact",   refId: "art-knowledge-map",    title: "Canonical-anchor candidates",                         snippet: "Five anchors identified: Governance, Curriculum, Risk Register, Impact Report, Operating Model.", source: "Knowledge Lead", capturedAt: days(4) },
];

// ── Next-best actions (Command Center) ──────────────────────────────

export const mockNextBestActions: NextBestAction[] = [
  { id: "nba-1", label: "Decide on the Horizon-2 anchor before Friday's SteerCo",                 rationale: "High-tier, due in 3 days, default Adopt at 0.78 confidence.",        engagementId: "eng-discovery-01", estimatedEffort: "minutes", priority: "primary" },
  { id: "nba-2", label: "Approve the agent archetype hard-separation",                            rationale: "High-tier, due in 1 day, auditor confidence 0.91.",                  engagementId: "eng-agentic-01",   estimatedEffort: "minutes", priority: "primary" },
  { id: "nba-3", label: "Unblock champion nominations for the two outstanding departments",       rationale: "One escalation message likely closes both. Activation depends on it.", engagementId: "eng-training-01",  estimatedEffort: "minutes", priority: "secondary" },
  { id: "nba-4", label: "Walk through the Decision Architecture revisions with the Auditor",      rationale: "Tightening the high-tier evidence rule needs an executive nod before publication.", engagementId: "eng-agentic-01", estimatedEffort: "hours",   priority: "secondary" },
  { id: "nba-5", label: "Schedule the Q3 calibration cadence with departmental champions",        rationale: "Activation Coach proposed a cadence; pick a fortnightly slot.",      engagementId: "eng-training-01",  estimatedEffort: "hours",   priority: "secondary" },
];

// ── Audit log ───────────────────────────────────────────────────────

export const mockAuditLog: AuditEntry[] = [
  { id: "au-1",  workspaceId: mockWorkspace.id, action: "decision-approved",   actor: "Dr. Eleanor Vance",        actorKind: "human", refId: "dec-roadmap-phase2-procurement", detail: "Approved pre-staging of the Phase-2 procurement vehicle.", riskTier: "medium", at: days(4) },
  { id: "au-2",  workspaceId: mockWorkspace.id, action: "decision-approved",   actor: "Devak Kapoor",             actorKind: "human", refId: "dec-governance-promotion",       detail: "Promoted Governance Framework v1.0.0 to canonical.",          riskTier: "low",    at: days(5) },
  { id: "au-3",  workspaceId: mockWorkspace.id, action: "decision-deferred",   actor: "Dr. Eleanor Vance",        actorKind: "human", refId: "dec-cos-escalation",             detail: "Deferred CoS centralization decision pending more data.",     riskTier: "medium", at: days(2) },
  { id: "au-4",  workspaceId: mockWorkspace.id, action: "artifact-published",  actor: "Cassandra Reyes",          actorKind: "human", refId: "art-operating-model",            detail: "Published Operating Model Blueprint v0.2.0.",                  riskTier: "low",    at: hours(28) },
  { id: "au-5",  workspaceId: mockWorkspace.id, action: "artifact-superseded", actor: "Dauntless team",           actorKind: "human", refId: "dec-superseded-roadmap-h1",      detail: "Superseded the Horizon-1 doc-triage anchor.",                  riskTier: "medium", at: days(28) },
  { id: "au-6",  workspaceId: mockWorkspace.id, action: "agent-run",           actor: "Governance Auditor",       actorKind: "agent", refId: "agent-governance-auditor",       detail: "Audited 12 decisions; flagged 3 with single-source evidence.", riskTier: "low",    at: hours(2) },
  { id: "au-7",  workspaceId: mockWorkspace.id, action: "agent-run",           actor: "Engagement Analyst",       actorKind: "agent", refId: "agent-engagement-analyst",       detail: "Proposed decision dec-roadmap-h2-anchor with rationale.",      riskTier: "medium", at: hours(2) },
  { id: "au-8",  workspaceId: mockWorkspace.id, action: "access-granted",      actor: "Cassandra Reyes",          actorKind: "human", refId: "u-skim",                         detail: "Granted Auditor role to Soo-Jin Kim.",                          riskTier: "medium", at: days(40) },
  { id: "au-9",  workspaceId: mockWorkspace.id, action: "evidence-exported",   actor: "Devak Kapoor",             actorKind: "human", refId: "ev-tb-directive-cross-ref",      detail: "Exported TB directive cross-reference for SteerCo packet.",     riskTier: "low",    at: days(7) },
  { id: "au-10", workspaceId: mockWorkspace.id, action: "agent-run",           actor: "Activation Coach",         actorKind: "agent", refId: "agent-activation-coach",         detail: "Proposed Q3 calibration cadence; routed to activation plan.",   riskTier: "low",    at: hours(20) },
];

// ── Snapshot — what repositories will return ────────────────────────

export const mockPortalSnapshot: PortalSnapshot = {
  organization: mockOrganization,
  workspace: mockWorkspace,
  memberships: mockMemberships,
  engagements: mockEngagements,
  artifacts: mockArtifacts,
  decisions: mockDecisions,
  tasks: mockTasks,
  signals: mockSignals,
  agents: mockAgents,
  conversations: mockConversations,
  knowledge: mockKnowledge,
  metrics: mockMetrics,
  evidence: mockEvidence,
  nextBestActions: mockNextBestActions,
  auditLog: mockAuditLog,
};

// ── Convenience helpers (used by portal pages) ──────────────────────

export function getEngagement(id: string): Engagement | undefined {
  return mockEngagements.find((e) => e.id === id);
}

export function getArtifactsByEngagement(engagementId: string): Artifact[] {
  return mockArtifacts.filter((a) => a.engagementId === engagementId);
}

export function getDecisionsByStatus(status: Decision["status"]): Decision[] {
  return mockDecisions.filter((d) => d.status === status);
}

export function getKnowledgeByShelf(shelf: KnowledgeItem["shelf"]): KnowledgeItem[] {
  return mockKnowledge.filter((k) => k.shelf === shelf);
}

export function getAgentByArchetype(archetype: Agent["archetype"]): Agent[] {
  return mockAgents.filter((a) => a.archetype === archetype);
}

export function getEvidence(id: string): Evidence | undefined {
  return mockEvidence.find((e) => e.id === id);
}
