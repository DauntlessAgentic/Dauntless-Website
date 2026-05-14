// ============================================================
// Continuous Autonomous Innovation Engine (Phase 7.1)
//
// A long-running, in-process watcher that subscribes to the
// portal event bus and continuously emits innovation proposals
// based on workspace state. Phase 7.1 ships the heuristics +
// in-memory store; Phase 7.2 will swap the store for a
// persisted `innovation_proposals` table.
//
// The engine is a singleton per server process. The first call
// to `getInnovationEngine()` subscribes to the bus; subsequent
// calls reuse the same instance. A `tick()` runs the heuristics
// against the current repository snapshot; ticks fire on every
// event and (optionally) on a setInterval timer for environments
// that don't emit events frequently.
// ============================================================

import { getPortalRepository } from "@/lib/portal/repositories";
import {
  listPortalEvents,
  subscribePortalEvents,
  type PortalEvent,
} from "@/lib/portal/telemetry/event-bus";

import { PATTERN_LIBRARY } from "./patterns";

export type ProposalKind =
  | "pattern-reuse"
  | "decision-velocity"
  | "cross-engagement-playbook"
  | "capability-gap"
  | "canonical-leverage";

export type ProposalUrgency = "advisory" | "notable" | "urgent";

export interface InnovationProposal {
  id: string;
  workspaceId: string;
  kind: ProposalKind;
  urgency: ProposalUrgency;
  title: string;
  rationale: string;
  evidence: string[];
  suggestedActions: string[];
  /** Stable hash key. Engine de-duplicates proposals with the same key. */
  dedupeKey: string;
  generatedAt: Date;
  expiresAt: Date;
  acknowledgedAt?: Date;
}

interface EngineState {
  proposals: Map<string, InnovationProposal>;
  unsubscribe: () => void;
  lastTickAt: number;
}

const PROPOSAL_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MIN_TICK_INTERVAL_MS = 3_000; // throttle bursts
const MAX_PROPOSALS_PER_WORKSPACE = 25;

let state: EngineState | null = null;
let counter = 0;

function getEngine(): EngineState {
  if (state) return state;
  const initial: EngineState = {
    proposals: new Map(),
    lastTickAt: 0,
    unsubscribe: () => undefined,
  };
  initial.unsubscribe = subscribePortalEvents((event) => {
    void handleEvent(initial, event);
  });
  state = initial;
  return initial;
}

async function handleEvent(engine: EngineState, event: PortalEvent): Promise<void> {
  const now = Date.now();
  if (now - engine.lastTickAt < MIN_TICK_INTERVAL_MS) return;
  engine.lastTickAt = now;
  try {
    await tick(event.workspaceId);
  } catch {
    // Engine must not crash the event bus.
  }
}

/**
 * Run the heuristic suite for a workspace. Public so server-rendered
 * pages can force a refresh on load (the engine otherwise only ticks
 * on events).
 */
export async function tick(workspaceId: string): Promise<InnovationProposal[]> {
  const engine = getEngine();
  const repo = getPortalRepository();
  const [engagements, decisions, artifacts] = await Promise.all([
    repo.listEngagements(workspaceId),
    repo.listDecisions(workspaceId),
    repo.listArtifacts(workspaceId),
  ]);

  const newProposals: InnovationProposal[] = [];

  // Heuristic 1: canonical leverage — a freshly-promoted canonical
  // artifact should propagate to other engagements that lack one.
  for (const canonical of artifacts.filter((a) => a.canonical).slice(0, 3)) {
    const engagementsLacking = engagements.filter((e) => {
      return !artifacts.some(
        (a) => a.canonical && a.engagementId === e.id && a.type === canonical.type,
      );
    });
    if (engagementsLacking.length >= 1) {
      const dedupeKey = `canonical-leverage:${canonical.id}`;
      newProposals.push(
        makeProposal({
          workspaceId,
          kind: "canonical-leverage",
          urgency: "notable",
          title: `Propagate "${canonical.name}" pattern to ${engagementsLacking.length} engagement${engagementsLacking.length === 1 ? "" : "s"}`,
          rationale: `Canonical artifact "${canonical.name}" (${canonical.type}) is missing on ${engagementsLacking.map((e) => e.name).join(", ")}.`,
          evidence: [
            `Canonical artifact id: ${canonical.id}`,
            ...engagementsLacking.slice(0, 5).map((e) => `Engagement without ${canonical.type}: ${e.name}`),
          ],
          suggestedActions: [
            `Open Engagement Analyst on each gap engagement with prompt "Adapt ${canonical.name} for this engagement."`,
            "Promote the resulting artifact to canonical after audit.",
          ],
          dedupeKey,
        }),
      );
    }
  }

  // Heuristic 2: pattern reuse — match PATTERN_LIBRARY entries to
  // active engagements whose `kind` is among the pattern's
  // provenAcrossKinds, OR whose criteria tokens overlap with the
  // pattern's `whenItApplies` text.
  for (const engagement of engagements.filter((e) => e.status === "active").slice(0, 3)) {
    const criteriaText = engagement.successCriteria.join(" ").toLowerCase();
    const criteriaTokens = new Set(
      criteriaText.split(/[^a-z0-9]+/g).filter((t) => t.length > 4),
    );
    const matches = PATTERN_LIBRARY.filter((p) => {
      if (p.provenAcrossKinds.includes(engagement.kind)) return true;
      const patternTokens = `${p.whenItApplies} ${p.summary}`
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .filter((t) => t.length > 4);
      return patternTokens.some((t) => criteriaTokens.has(t));
    }).slice(0, 2);
    for (const pattern of matches) {
      const dedupeKey = `pattern-reuse:${engagement.id}:${pattern.id}`;
      newProposals.push(
        makeProposal({
          workspaceId,
          kind: "pattern-reuse",
          urgency: "advisory",
          title: `Apply "${pattern.title}" to ${engagement.name}`,
          rationale: `Pattern "${pattern.title}" (${pattern.maturity}) tags overlap with ${engagement.name}'s success criteria.`,
          evidence: [
            `Pattern category: ${pattern.category}`,
            `Pattern maturity: ${pattern.maturity}`,
            `Engagement criteria: ${engagement.successCriteria.slice(0, 3).join("; ")}`,
          ],
          suggestedActions: [
            `Review pattern "${pattern.title}" in the Innovation Studio.`,
            `Spin up an Engagement Analyst run on ${engagement.name} citing this pattern.`,
          ],
          dedupeKey,
        }),
      );
    }
  }

  // Heuristic 3: decision velocity — pending-approval decisions whose
  // dueAt has passed (or which are pending with no due date set) are
  // velocity risks.
  const now = new Date();
  const stalePending = decisions.filter((d) => {
    if (d.status !== "pending-approval") return false;
    if (!d.dueAt) return true;
    return d.dueAt.getTime() < now.getTime();
  });
  if (stalePending.length >= 1) {
    const dedupeKey = `decision-velocity:${stalePending.map((d) => d.id).sort().join(",")}`;
    newProposals.push(
      makeProposal({
        workspaceId,
        kind: "decision-velocity",
        urgency: stalePending.some((d) => d.riskTier === "high") ? "urgent" : "notable",
        title: `${stalePending.length} decision${stalePending.length === 1 ? "" : "s"} past due in pending-approval`,
        rationale: `Decisions sitting in pending-approval are losing context. Time-to-decide is a leading indicator of agentic-org friction.`,
        evidence: stalePending.slice(0, 5).map((d) => {
          const due = d.dueAt ? d.dueAt.toISOString().slice(0, 10) : "no due date";
          return `${d.title} · ${d.riskTier} · due ${due}`;
        }),
        suggestedActions: [
          "Schedule a decision-review sync with the SteerCo for this week.",
          "Trigger a Risk Inspector agent on each high-tier item.",
        ],
        dedupeKey,
      }),
    );
  }

  // Heuristic 4: cross-engagement playbook — when two or more active
  // engagements share a success-criterion stem, propose a shared playbook.
  const stems = new Map<string, string[]>();
  for (const e of engagements.filter((e) => e.status === "active")) {
    for (const criterion of e.successCriteria) {
      const stem = criterion.toLowerCase().slice(0, 40);
      const bucket = stems.get(stem) ?? [];
      bucket.push(e.name);
      stems.set(stem, bucket);
    }
  }
  for (const [stem, names] of stems) {
    if (names.length >= 2) {
      const dedupeKey = `playbook:${stem}`;
      newProposals.push(
        makeProposal({
          workspaceId,
          kind: "cross-engagement-playbook",
          urgency: "advisory",
          title: `Shared playbook opportunity across ${names.length} engagements`,
          rationale: `Engagements ${names.join(", ")} all carry a similar success criterion ("${stem}…"). Codify once, reuse across.`,
          evidence: names.map((n) => `Engagement: ${n}`),
          suggestedActions: [
            "Open the Knowledge canvas and draft a cross-engagement playbook.",
            "Tag the resulting Knowledge item as canonical once two engagements adopt it.",
          ],
          dedupeKey,
        }),
      );
      // Limit to one cross-engagement proposal per tick to avoid noise.
      break;
    }
  }

  // Heuristic 5: capability gap — pending-approval high-risk decisions
  // with no Risk Inspector activity in the last 24h.
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentRiskRuns = listPortalEvents({
    workspaceId,
    kinds: ["agent-run-completed"],
    since: oneDayAgo,
  }).filter((e) => e.kind === "agent-run-completed" && e.agentId.toLowerCase().includes("risk"));
  if (
    decisions.some((d) => d.status === "pending-approval" && d.riskTier === "high") &&
    recentRiskRuns.length === 0
  ) {
    const dedupeKey = `capability-gap:risk-inspector`;
    newProposals.push(
      makeProposal({
        workspaceId,
        kind: "capability-gap",
        urgency: "urgent",
        title: "Risk Inspector idle while high-risk decisions are pending",
        rationale: "High-tier decisions deserve a Risk Inspector pass before approval; no such run has fired in the last 24h.",
        evidence: ["No agent-run-completed events for a Risk Inspector archetype in 24h."],
        suggestedActions: [
          "Trigger a Risk Inspector run on each pending-approval high-risk decision.",
          "Add an automation rule so the Inspector fires on `decision-proposed` for tier=high.",
        ],
        dedupeKey,
      }),
    );
  }

  for (const proposal of newProposals) {
    const existing = engine.proposals.get(proposal.dedupeKey);
    if (existing && !isExpired(existing)) {
      existing.expiresAt = proposal.expiresAt;
      continue;
    }
    engine.proposals.set(proposal.dedupeKey, proposal);
  }

  enforceWindow(engine, workspaceId);
  return listProposals(workspaceId);
}

function makeProposal(input: {
  workspaceId: string;
  kind: ProposalKind;
  urgency: ProposalUrgency;
  title: string;
  rationale: string;
  evidence: string[];
  suggestedActions: string[];
  dedupeKey: string;
}): InnovationProposal {
  counter += 1;
  const now = new Date();
  return {
    id: `prop-${now.getTime().toString(36)}-${counter.toString(36)}`,
    workspaceId: input.workspaceId,
    kind: input.kind,
    urgency: input.urgency,
    title: input.title,
    rationale: input.rationale,
    evidence: input.evidence,
    suggestedActions: input.suggestedActions,
    dedupeKey: input.dedupeKey,
    generatedAt: now,
    expiresAt: new Date(now.getTime() + PROPOSAL_TTL_MS),
  };
}

function isExpired(p: InnovationProposal): boolean {
  return p.expiresAt.getTime() < Date.now();
}

function enforceWindow(engine: EngineState, workspaceId: string): void {
  const rows = Array.from(engine.proposals.values()).filter((p) => p.workspaceId === workspaceId);
  if (rows.length <= MAX_PROPOSALS_PER_WORKSPACE) return;
  rows.sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime());
  const toEvict = rows.slice(0, rows.length - MAX_PROPOSALS_PER_WORKSPACE);
  for (const p of toEvict) engine.proposals.delete(p.dedupeKey);
}

export function listProposals(workspaceId: string): InnovationProposal[] {
  const engine = getEngine();
  const rows: InnovationProposal[] = [];
  for (const proposal of engine.proposals.values()) {
    if (proposal.workspaceId !== workspaceId) continue;
    if (isExpired(proposal)) continue;
    rows.push(proposal);
  }
  rows.sort((a, b) => {
    const urgencyOrder: Record<ProposalUrgency, number> = { urgent: 0, notable: 1, advisory: 2 };
    const u = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (u !== 0) return u;
    return b.generatedAt.getTime() - a.generatedAt.getTime();
  });
  return rows;
}

export function acknowledgeProposal(id: string): InnovationProposal | null {
  const engine = getEngine();
  for (const proposal of engine.proposals.values()) {
    if (proposal.id === id) {
      proposal.acknowledgedAt = new Date();
      return proposal;
    }
  }
  return null;
}

/** Test-only. Wipes proposals + tears down the subscription. */
export function __resetInnovationEngine(): void {
  if (state) {
    state.unsubscribe();
    state = null;
  }
  counter = 0;
}
