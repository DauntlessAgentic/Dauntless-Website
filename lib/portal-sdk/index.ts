// ============================================================
// @dauntlessagentic/portal-sdk (Phase 9.0)
//
// Typed client for the portal REST API. Ships in-repo for Phase
// 9.0; Phase 9.1 publishes to npm. Mirrors the resource shapes
// from `lib/portal/types.ts` so downstream code stays type-safe.
//
// Usage:
//
//   import { createPortalClient } from "@/lib/portal-sdk";
//   const portal = createPortalClient({
//     baseUrl: "https://portal.dauntlessagentic.com",
//     apiKey: process.env.PORTAL_API_KEY,
//   });
//   const { engagements } = await portal.engagements.list();
//
// Universal — runs in any fetch-capable environment.
// ============================================================

import type {
  Artifact,
  Decision,
  Engagement,
  KnowledgeItem,
  Metric,
  ScheduleItem,
  ScheduleItemKind,
  Signal,
} from "@/lib/portal/types";
import type { DerivedMetric } from "@/lib/portal/telemetry/metrics";
import type { SearchResult } from "@/lib/portal/knowledge";

export interface PortalClientOptions {
  baseUrl: string;
  apiKey?: string;
  /** Override the fetch implementation (e.g. for tests). */
  fetch?: typeof fetch;
}

export interface ProposeDecisionOutcomeInput {
  decisionId: string;
  outcome: "approved" | "deferred" | "rejected";
  actor?: string;
  notes?: string;
}

export interface ProposeScheduleItemInput {
  kind: ScheduleItemKind;
  title: string;
  startsAt: string | Date;
  durationMins: number;
  engagementId?: string;
  attendees?: string[];
  notes?: string;
  proposedBy?: string;
}

export interface PortalListResponse<_TKey extends string, _TItem> {
  workspaceId: string;
}

export type EngagementsListResponse = { workspaceId: string; engagements: Engagement[] };
export type DecisionsListResponse = { workspaceId: string; decisions: Decision[] };
export type ArtifactsListResponse = { workspaceId: string; artifacts: Artifact[] };
export type SignalsListResponse = { workspaceId: string; signals: Signal[] };
export type MetricsListResponse = { workspaceId: string; stored: Metric[]; derived: DerivedMetric[] };
export type KnowledgeListResponse =
  | { workspaceId: string; knowledge: KnowledgeItem[] }
  | { workspaceId: string; query: string; results: SearchResult[] };
export type ScheduleListResponse = { workspaceId: string; schedule: ScheduleItem[] };

export class PortalApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "PortalApiError";
    this.status = status;
  }
}

export function createPortalClient(options: PortalClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  const candidateFetch = options.fetch ?? (typeof fetch === "function" ? fetch : undefined);
  if (!candidateFetch) {
    throw new Error("createPortalClient requires a fetch implementation.");
  }
  const fetchImpl: typeof fetch = candidateFetch;

  async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (options.apiKey) headers["authorization"] = `Bearer ${options.apiKey}`;
    const res = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const parsed = (await res.json()) as { error?: string };
        if (parsed?.error) detail = parsed.error;
      } catch { /* leave detail as status text */ }
      throw new PortalApiError(res.status, detail);
    }
    return (await res.json()) as T;
  }

  return {
    engagements: {
      list: () => call<EngagementsListResponse>("GET", "/api/portal/v1/engagements"),
    },
    decisions: {
      list: () => call<DecisionsListResponse>("GET", "/api/portal/v1/decisions"),
      recordOutcome: (input: ProposeDecisionOutcomeInput) =>
        call<{ decision: Decision }>("POST", "/api/portal/v1/decisions", input),
    },
    artifacts: {
      list: () => call<ArtifactsListResponse>("GET", "/api/portal/v1/artifacts"),
    },
    signals: {
      list: () => call<SignalsListResponse>("GET", "/api/portal/v1/signals"),
    },
    metrics: {
      list: () => call<MetricsListResponse>("GET", "/api/portal/v1/metrics"),
    },
    knowledge: {
      list: () => call<KnowledgeListResponse>("GET", "/api/portal/v1/knowledge"),
      search: (query: string, limit = 20) =>
        call<KnowledgeListResponse>(
          "GET",
          `/api/portal/v1/knowledge?q=${encodeURIComponent(query)}&limit=${limit}`,
        ),
    },
    schedule: {
      list: () => call<ScheduleListResponse>("GET", "/api/portal/v1/schedule"),
      propose: (input: ProposeScheduleItemInput) =>
        call<{ scheduleItem: ScheduleItem }>("POST", "/api/portal/v1/schedule", {
          ...input,
          startsAt: typeof input.startsAt === "string" ? input.startsAt : input.startsAt.toISOString(),
        }),
    },
  };
}

export type PortalClient = ReturnType<typeof createPortalClient>;
