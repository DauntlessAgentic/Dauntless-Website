// ============================================================
// Compliance posture (Phase 10.0)
//
// Phase 10.0 ships a deterministic posture computation across the
// four frameworks Dauntless cares about today (Protected B IL2,
// FedRAMP Low, SOC 2 Type II, HIPAA). The posture aggregates
// signals already in the portal:
//   - Audit log entries (depth + recency)
//   - Membership roles populated
//   - Canonical artifact density
//   - Decision approval gating (high tier evidence threshold)
//   - Knowledge revalidation pipeline
//
// Phase 10.1 will replace the per-control checks with real
// continuous-audit instrumentation (SOC 2 evidence collectors).
// ============================================================

// Server-only by convention.

import { computeRevalidationQueue } from "@/lib/portal/knowledge";
import type { Artifact, AuditEntry, Decision, KnowledgeItem, Membership } from "@/lib/portal/types";

export type FrameworkId = "protected-b-il2" | "fedramp-low" | "soc-2-type-ii" | "hipaa";

export interface ComplianceFramework {
  id: FrameworkId;
  name: string;
  sector: "federal-ca" | "federal-us" | "saas" | "healthcare";
  description: string;
}

export const FRAMEWORKS: ComplianceFramework[] = [
  {
    id: "protected-b-il2",
    name: "Government of Canada · Protected B (IL2)",
    sector: "federal-ca",
    description: "Confidentiality + data residency for Government of Canada client engagements.",
  },
  {
    id: "fedramp-low",
    name: "U.S. FedRAMP Low",
    sector: "federal-us",
    description: "Low-impact federal cloud baseline. Control mapping + third-party assessor coordination.",
  },
  {
    id: "soc-2-type-ii",
    name: "SOC 2 Type II",
    sector: "saas",
    description: "Continuous audit posture across security, availability, confidentiality, processing integrity.",
  },
  {
    id: "hipaa",
    name: "HIPAA",
    sector: "healthcare",
    description: "PHI handling, BAA-readiness, audit log enrichment for healthcare-sector clients.",
  },
];

export type ControlStatus = "pass" | "partial" | "gap" | "not-applicable";

export interface ControlCheck {
  id: string;
  family: string;
  title: string;
  status: ControlStatus;
  evidence: string;
  /** What unblocks moving to "pass". Empty when status is "pass". */
  nextStep?: string;
}

export interface FrameworkPosture {
  framework: ComplianceFramework;
  score: number; // 0–100 weighted readiness
  status: "ready" | "in-progress" | "not-started";
  controls: ControlCheck[];
}

export interface SectorPackEntry {
  id: string;
  title: string;
  framework: FrameworkId;
  kind: "policy" | "playbook" | "risk-register" | "control-mapping";
  summary: string;
}

export const SECTOR_PACKS: SectorPackEntry[] = [
  {
    id: "pack-pb-decision-arch",
    title: "Decision Architecture for Protected B",
    framework: "protected-b-il2",
    kind: "policy",
    summary: "Hard-separation Agent design + three-tier risk gating mapped onto TB Directive on Automated Decision-Making.",
  },
  {
    id: "pack-pb-risk-register",
    title: "Protected B sector risk register",
    framework: "protected-b-il2",
    kind: "risk-register",
    summary: "20 enumerated risks for a federal AI program with reversibility scores + mitigation playbooks.",
  },
  {
    id: "pack-fedramp-control-mapping",
    title: "FedRAMP Low control mapping",
    framework: "fedramp-low",
    kind: "control-mapping",
    summary: "Maps portal evidence types (decision approval, knowledge promotion, agent audit) onto FedRAMP Low control families.",
  },
  {
    id: "pack-soc2-cc7",
    title: "SOC 2 CC7 — system operations",
    framework: "soc-2-type-ii",
    kind: "control-mapping",
    summary: "Portal telemetry events mapped onto SOC 2 CC7 evidence requirements.",
  },
  {
    id: "pack-hipaa-baa",
    title: "HIPAA BAA template",
    framework: "hipaa",
    kind: "policy",
    summary: "Business Associate Agreement template tuned for AI-mediated PHI workflows.",
  },
];

export interface PortalComplianceInput {
  decisions: Decision[];
  artifacts: Artifact[];
  knowledge: KnowledgeItem[];
  memberships: Membership[];
  auditLog: AuditEntry[];
  isHostedRepository: boolean;
  isApiKeyConfigured: boolean;
  isAuthConfigured: boolean;
}

export interface PortalCompliancePosture {
  generatedAt: Date;
  overallScore: number;
  frameworks: FrameworkPosture[];
  highlights: string[];
  blockingGaps: ControlCheck[];
}

export function computePortalCompliance(input: PortalComplianceInput): PortalCompliancePosture {
  const baselineControls = computeBaselineControls(input);
  const frameworks = FRAMEWORKS.map((framework) => buildFrameworkPosture(framework, baselineControls, input));

  const overallScore = Math.round(
    frameworks.reduce((acc, f) => acc + f.score, 0) / Math.max(1, frameworks.length),
  );

  const blockingGaps = frameworks
    .flatMap((f) => f.controls.filter((c) => c.status === "gap"))
    .slice(0, 6);

  const highlights = [
    input.auditLog.length >= 10
      ? `Audit log is populated (${input.auditLog.length} entries).`
      : "Audit log is thin — fewer than 10 entries recorded.",
    input.memberships.length >= 4
      ? `${input.memberships.length} memberships across five roles.`
      : "Membership roster is small; fill out the role table before claiming SOC 2 CC1.",
    input.isHostedRepository
      ? "Repository is hosted (real persistence)."
      : "Repository is the in-memory seed. Persistence is required for SOC 2 + FedRAMP audits.",
    input.isApiKeyConfigured
      ? "API gate is configured (PORTAL_API_KEY set)."
      : "API gate is in dev-bypass — set PORTAL_API_KEY before opening the surface to clients.",
  ];

  return {
    generatedAt: new Date(),
    overallScore,
    frameworks,
    highlights,
    blockingGaps,
  };
}

interface BaselineControls {
  auditDepth: ControlStatus;
  auditRecency: ControlStatus;
  membershipRoster: ControlStatus;
  evidenceBar: ControlStatus;
  canonicalDensity: ControlStatus;
  revalidationDiscipline: ControlStatus;
  persistence: ControlStatus;
  apiGate: ControlStatus;
  authConfigured: ControlStatus;
}

function computeBaselineControls(input: PortalComplianceInput): BaselineControls {
  const recentAudits = input.auditLog.filter(
    (a) => Date.now() - a.at.getTime() < 30 * 24 * 60 * 60 * 1000,
  );
  const highTierDecisions = input.decisions.filter((d) => d.riskTier === "high");
  const evidenceShortDecisions = highTierDecisions.filter((d) => d.evidenceIds.length < 3);

  return {
    auditDepth: input.auditLog.length >= 8 ? "pass" : input.auditLog.length >= 3 ? "partial" : "gap",
    auditRecency: recentAudits.length >= 3 ? "pass" : recentAudits.length >= 1 ? "partial" : "gap",
    membershipRoster:
      input.memberships.length >= 5
        ? "pass"
        : input.memberships.length >= 3
          ? "partial"
          : "gap",
    evidenceBar:
      highTierDecisions.length === 0
        ? "pass"
        : evidenceShortDecisions.length === 0
          ? "pass"
          : evidenceShortDecisions.length <= 1
            ? "partial"
            : "gap",
    canonicalDensity:
      input.artifacts.length === 0
        ? "gap"
        : input.artifacts.filter((a) => a.canonical).length / input.artifacts.length >= 0.2
          ? "pass"
          : "partial",
    revalidationDiscipline:
      computeRevalidationQueue(input.knowledge).filter((c) => c.recommendedAction === "supersede").length <= 1
        ? "pass"
        : "partial",
    persistence: input.isHostedRepository ? "pass" : "gap",
    apiGate: input.isApiKeyConfigured ? "pass" : "partial",
    authConfigured: input.isAuthConfigured ? "pass" : "partial",
  };
}

function buildFrameworkPosture(
  framework: ComplianceFramework,
  baseline: BaselineControls,
  input: PortalComplianceInput,
): FrameworkPosture {
  const controls: ControlCheck[] = [];

  // Shared controls across every framework.
  controls.push({
    id: `${framework.id}-audit-depth`,
    family: "Audit + monitoring",
    title: "Append-only audit log populated",
    status: baseline.auditDepth,
    evidence: `Audit log has ${input.auditLog.length} entries (target ≥ 8).`,
    nextStep: baseline.auditDepth === "pass" ? undefined : "Run more agents or record more decisions to deepen the audit trail.",
  });
  controls.push({
    id: `${framework.id}-audit-recency`,
    family: "Audit + monitoring",
    title: "Recent activity (last 30d)",
    status: baseline.auditRecency,
    evidence: `${input.auditLog.filter((a) => Date.now() - a.at.getTime() < 30 * 24 * 60 * 60 * 1000).length} entries in the last 30 days.`,
    nextStep: baseline.auditRecency === "pass" ? undefined : "Drive at least 3 audited mutations in the next month.",
  });
  controls.push({
    id: `${framework.id}-roles`,
    family: "Access control",
    title: "Membership roster spans roles",
    status: baseline.membershipRoster,
    evidence: `${input.memberships.length} memberships configured.`,
    nextStep: baseline.membershipRoster === "pass" ? undefined : "Add at least one membership for every role (owner / executive / lead / viewer / auditor).",
  });
  controls.push({
    id: `${framework.id}-persistence`,
    family: "Data handling",
    title: "Real persistence layer (not in-memory)",
    status: baseline.persistence,
    evidence: input.isHostedRepository ? "Repository is hosted." : "Repository is the in-memory seed.",
    nextStep: input.isHostedRepository ? undefined : "Land Phase 2.1 Supabase adapter and configure PORTAL_DATABASE_URL.",
  });
  controls.push({
    id: `${framework.id}-evidence-bar`,
    family: "Decision evidence",
    title: "High-tier decisions cite ≥3 evidence rows",
    status: baseline.evidenceBar,
    evidence: `${input.decisions.filter((d) => d.riskTier === "high" && d.evidenceIds.length < 3).length} high-tier decisions below the bar.`,
    nextStep: baseline.evidenceBar === "pass" ? undefined : "Backfill evidence rows on the affected high-tier decisions.",
  });

  // Framework-specific tweaks.
  if (framework.id === "soc-2-type-ii") {
    controls.push({
      id: `${framework.id}-canonical-density`,
      family: "Continuous improvement (CC7)",
      title: "Canonical artifact density ≥ 20%",
      status: baseline.canonicalDensity,
      evidence: `${Math.round((input.artifacts.filter((a) => a.canonical).length / Math.max(1, input.artifacts.length)) * 100)}% of artifacts are canonical.`,
      nextStep: baseline.canonicalDensity === "pass" ? undefined : "Run the Governance Auditor on the strongest in-review artifacts.",
    });
    controls.push({
      id: `${framework.id}-api-gate`,
      family: "Access control (CC6)",
      title: "API key gate is configured",
      status: baseline.apiGate,
      evidence: input.isApiKeyConfigured ? "PORTAL_API_KEY is set." : "API runs in dev-bypass mode.",
      nextStep: input.isApiKeyConfigured ? undefined : "Set PORTAL_API_KEY before exposing the API externally.",
    });
  }

  if (framework.id === "protected-b-il2") {
    controls.push({
      id: `${framework.id}-revalidation`,
      family: "Information integrity",
      title: "Revalidation queue under control",
      status: baseline.revalidationDiscipline,
      evidence: "Confidence decay + revalidation queue running per Phase 4.",
      nextStep: baseline.revalidationDiscipline === "pass" ? undefined : "Clear the supersede candidates surfaced on the Knowledge page.",
    });
  }

  if (framework.id === "fedramp-low") {
    controls.push({
      id: `${framework.id}-auth`,
      family: "Identification & authentication",
      title: "Real OAuth wired",
      status: baseline.authConfigured,
      evidence: input.isAuthConfigured ? "AUTH_GOOGLE_ID is set." : "Auth is in dev-bypass mode.",
      nextStep: input.isAuthConfigured ? undefined : "Configure AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET; land Phase 2.1 NextAuth integration.",
    });
  }

  if (framework.id === "hipaa") {
    controls.push({
      id: `${framework.id}-phi-tagging`,
      family: "PHI handling",
      title: "PHI-tagging on artifacts (Phase 10.1 control)",
      status: "not-applicable",
      evidence: "PHI tagging lands in Phase 10.1; portal is sector-agnostic today.",
    });
  }

  const score = scoreControls(controls);
  return {
    framework,
    score,
    status: score >= 75 ? "ready" : score >= 35 ? "in-progress" : "not-started",
    controls,
  };
}

function scoreControls(controls: ControlCheck[]): number {
  if (controls.length === 0) return 0;
  const total = controls.reduce((acc, c) => {
    if (c.status === "not-applicable") return acc;
    return acc + 1;
  }, 0);
  const earned = controls.reduce((acc, c) => {
    if (c.status === "pass") return acc + 1;
    if (c.status === "partial") return acc + 0.5;
    return acc;
  }, 0);
  return Math.round((earned / Math.max(1, total)) * 100);
}
