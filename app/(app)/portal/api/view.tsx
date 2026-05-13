"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Code2, Webhook } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";

import type { MembershipContext } from "@/lib/auth/session";
import type { WebhookEvent } from "@/lib/portal/webhooks";
import type { MembershipRole } from "@/lib/portal/types";

import { TokensPanel, type ApiTokenRow } from "./tokens-panel";

interface ApiExplorerViewProps {
  membership: MembershipContext;
  isConfigured: boolean;
  recentWebhooks: WebhookEvent[];
  tokens: ApiTokenRow[];
  canManageTokens: boolean;
  issueAction: (input: {
    label: string;
    scopeRole: MembershipRole;
  }) => Promise<{ ok: boolean; plaintext?: string; tokenId?: string; reason?: string }>;
  revokeAction: (input: { tokenId: string }) => Promise<{ ok: boolean; reason?: string }>;
}

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  title: string;
  summary: string;
  body?: string;
  sample?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/portal/v1/engagements",
    title: "List engagements",
    summary: "Returns every engagement under the active workspace with success criteria and risks.",
    sample: "curl -H 'Authorization: Bearer $PORTAL_API_KEY' https://portal.dauntlessagentic.com/api/portal/v1/engagements",
  },
  {
    method: "GET",
    path: "/api/portal/v1/decisions",
    title: "List decisions",
    summary: "Returns the Decision Register with recommendations, risk tiers, and evidence ids.",
  },
  {
    method: "POST",
    path: "/api/portal/v1/decisions",
    title: "Record decision outcome",
    summary: "Approve, defer, or reject a pending decision. Emits an audit entry + webhook.",
    body: `{
  "decisionId": "dec-roadmap-h2-anchor",
  "outcome": "approved",
  "actor": "Dr. Eleanor Vance",
  "notes": "SteerCo green-lit."
}`,
  },
  {
    method: "GET",
    path: "/api/portal/v1/artifacts",
    title: "List artifacts",
    summary: "Returns every living deliverable with current version, body, evidence ids.",
  },
  {
    method: "GET",
    path: "/api/portal/v1/signals",
    title: "List signals",
    summary: "Returns the 'What changed?' feed across the workspace.",
  },
  {
    method: "GET",
    path: "/api/portal/v1/metrics",
    title: "List metrics (stored + derived)",
    summary: "Stored Outcomes-page metrics + live Phase 6 telemetry-derived metrics.",
  },
  {
    method: "GET",
    path: "/api/portal/v1/knowledge",
    title: "List or search knowledge",
    summary: "List the Bookshelf or pass ?q=<query> for ranked workspace search.",
    sample: "curl -H 'Authorization: Bearer $PORTAL_API_KEY' 'https://portal.dauntlessagentic.com/api/portal/v1/knowledge?q=governance&limit=10'",
  },
  {
    method: "GET",
    path: "/api/portal/v1/schedule",
    title: "List schedule items",
    summary: "Returns upcoming + past touchpoints with linked artifacts/decisions.",
  },
  {
    method: "POST",
    path: "/api/portal/v1/schedule",
    title: "Propose schedule item",
    summary: "Lands a tentative schedule item. Emits an audit entry + webhook.",
    body: `{
  "kind": "walkthrough",
  "title": "Architecture review · Decision Architecture",
  "startsAt": "2026-05-18T15:00:00Z",
  "durationMins": 45,
  "attendees": ["Cassandra Reyes"],
  "engagementId": "eng-agentic-01"
}`,
  },
];

export function ApiExplorerView({
  membership,
  isConfigured,
  recentWebhooks,
  tokens,
  canManageTokens,
  issueAction,
  revokeAction,
}: ApiExplorerViewProps) {
  const authBadge =
    tokens.length > 0 ? "Scoped tokens" : isConfigured ? "Bearer required" : "Dev-bypass";
  const authBadgeVariant: "accent" | "success" | "warning" =
    tokens.length > 0 ? "accent" : isConfigured ? "success" : "warning";

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="API & SDK"
        title="REST surface + typed client"
        description="Phase 9.0 read endpoints, two writes (decisions + schedule), and a typed SDK shipping in-repo. Phase 9.1 wires real webhooks + the published npm package."
        badge={authBadge}
        badgeVariant={authBadgeVariant}
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="api-tokens"
            eyebrow="AUTH · SCOPED TOKENS"
            title="Workspace API tokens"
            subtitle={
              tokens.length > 0
                ? `${tokens.length} active. Tokens issued here gate every /api/portal/v1 request.`
                : isConfigured
                  ? `PORTAL_API_KEY is set. Issuing scoped tokens (preferred) takes precedence per-request when used.`
                  : `No tokens issued. Set PORTAL_API_KEY or issue a scoped token to gate the API.`
            }
          >
            <TokensPanel
              tokens={tokens}
              canManage={canManageTokens}
              issueAction={issueAction}
              revokeAction={revokeAction}
            />
          </DashboardCard>
          <DashboardCard
            id="api-sdk"
            eyebrow="SDK"
            title="@dauntlessagentic/portal-sdk (in-repo)"
            subtitle="Typed TypeScript / Node client. Path: lib/portal-sdk."
          >
            <div className="px-3 py-2.5 text-xs text-[--text-secondary]">
              <div className="flex items-center gap-2 mb-1.5">
                <Code2 className="h-3.5 w-3.5 text-[--accent-vivid]" />
                <span className="font-mono">createPortalClient({"{ baseUrl, apiKey }"})</span>
              </div>
              <pre className="font-mono text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-2 py-1.5 leading-snug whitespace-pre-wrap">{`import { createPortalClient } from "@/lib/portal-sdk";
const portal = createPortalClient({
  baseUrl: "https://portal.dauntlessagentic.com",
  apiKey: process.env.PORTAL_API_KEY,
});
const { engagements } = await portal.engagements.list();`}</pre>
            </div>
          </DashboardCard>
        </div>

        <DashboardCard
          id="api-endpoints"
          eyebrow="ENDPOINTS"
          title={`${ENDPOINTS.length} routes · v1`}
          subtitle="Versioned under /api/portal/v1. All responses are JSON."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[520px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {ENDPOINTS.map((e) => (
                <li key={`${e.method}-${e.path}`} className="flex flex-col gap-1.5 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <ContentTag variant={e.method === "GET" ? "info" : "accent"}>{e.method}</ContentTag>
                    <code className="text-xs font-mono text-[--text-primary] flex-1 truncate">{e.path}</code>
                  </div>
                  <p className="text-xs font-semibold text-[--text-primary] leading-snug">{e.title}</p>
                  <p className="text-xs text-[--text-secondary] leading-snug">{e.summary}</p>
                  {e.body && (
                    <pre className="font-mono text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-2 py-1.5 whitespace-pre-wrap text-[--text-primary]">{e.body}</pre>
                  )}
                  {e.sample && (
                    <pre className="font-mono text-xs bg-[--elevated-2] border border-[--border-subtle] rounded-[--radius-md] px-2 py-1.5 whitespace-pre-wrap text-[--text-secondary]">{e.sample}</pre>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="api-webhooks"
          eyebrow="WEBHOOKS"
          title={`${recentWebhooks.length} recent events`}
          subtitle="Phase 9.0 records would-be-delivered events in-process. Phase 9.1 wires real HTTP delivery + retries."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[320px]">
            {recentWebhooks.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                No webhook events yet. Trigger an API write or run an agent to seed.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {recentWebhooks.map((w) => (
                  <li key={w.id} className="flex flex-col gap-1 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Webhook className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                      <ContentTag variant="accent">{w.kind}</ContentTag>
                      <span className="ml-auto text-xs font-mono tabular-nums text-[--text-muted]">
                        {w.at.toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="font-mono text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-2 py-1.5 whitespace-pre-wrap text-[--text-secondary]">{JSON.stringify(w.payload, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DashboardCard>

        <p className="text-xs text-[--text-muted] leading-snug">
          {membership.role === "owner"
            ? "Owner — full visibility into the API surface."
            : `Read-only API explorer for ${membership.role}. Phase 9.1 will surface per-role scope hints inline.`}
        </p>
      </div>
    </div>
  );
}
