// ============================================================
// Outbound action payload schemas (Phase 11.1)
//
// Zod schemas keyed by `<connectorId>/<capabilityId>`. Closes audit
// finding §7.A — propose-time validation prevents malformed
// payloads from sitting in pending-approval state.
//
// Phase 11.2 wires real HTTP adapters per connector; those
// adapters consume the same schema for outbound serialization.
// ============================================================

import { z } from "zod";

import type { ConnectorId } from "./types";

const CONNECTOR_SCHEMAS: Record<string, z.ZodTypeAny> = {
  // ── HubSpot ───────────────────────────────────────────────
  "hubspot/create-deal": z.object({
    dealName: z.string().min(2).max(255),
    pipelineId: z.string().optional(),
    amountUsd: z.number().nonnegative().optional(),
    contactId: z.string().optional(),
    closeDate: z.string().datetime().optional(),
  }),
  "hubspot/update-contact": z.object({
    contactId: z.string().min(1),
    properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  }),

  // ── Salesforce ────────────────────────────────────────────
  "salesforce/create-opportunity": z.object({
    name: z.string().min(2).max(120),
    accountId: z.string().min(1),
    stage: z.string().min(1),
    closeDate: z.string().datetime(),
    amount: z.number().nonnegative().optional(),
  }),
  "salesforce/log-activity": z.object({
    relatedToId: z.string().min(1),
    type: z.enum(["Task", "Event"]),
    subject: z.string().min(2).max(255),
    description: z.string().max(32_000).optional(),
  }),

  // ── Jira ──────────────────────────────────────────────────
  "jira/create-issue": z.object({
    project: z.string().min(1),
    summary: z.string().min(2).max(255),
    issueType: z.string().default("Task"),
    description: z.string().max(32_000).optional(),
    labels: z.array(z.string()).optional(),
    epic: z.string().optional(),
  }),
  "jira/comment-issue": z.object({
    issueKey: z.string().regex(/^[A-Z][A-Z0-9]+-\d+$/),
    body: z.string().min(1).max(32_000),
  }),

  // ── ServiceNow ────────────────────────────────────────────
  "servicenow/create-incident": z.object({
    shortDescription: z.string().min(2).max(160),
    description: z.string().max(32_000).optional(),
    priority: z.number().int().min(1).max(5).optional(),
    assignmentGroup: z.string().optional(),
  }),
  "servicenow/escalate-incident": z.object({
    incidentId: z.string().min(1),
    priority: z.number().int().min(1).max(2),
    reassignTo: z.string().min(1),
    reason: z.string().min(5).max(2000),
  }),

  // ── Microsoft Graph ───────────────────────────────────────
  "ms-graph/create-event": z.object({
    subject: z.string().min(2).max(255),
    start: z.object({ dateTime: z.string().datetime(), timeZone: z.string() }),
    end: z.object({ dateTime: z.string().datetime(), timeZone: z.string() }),
    attendees: z.array(z.object({ email: z.string().email(), name: z.string().optional() })),
    body: z.string().max(32_000).optional(),
  }),
  "ms-graph/send-mail": z.object({
    to: z.array(z.string().email()).min(1),
    subject: z.string().min(2).max(255),
    body: z.string().min(1).max(64_000),
    cc: z.array(z.string().email()).optional(),
    importance: z.enum(["low", "normal", "high"]).optional(),
  }),

  // ── Google Workspace ──────────────────────────────────────
  "google-workspace/create-event": z.object({
    summary: z.string().min(2).max(255),
    description: z.string().max(32_000).optional(),
    start: z.object({ dateTime: z.string().datetime(), timeZone: z.string() }),
    end: z.object({ dateTime: z.string().datetime(), timeZone: z.string() }),
    attendees: z.array(z.object({ email: z.string().email() })).optional(),
  }),

  // ── Internal ──────────────────────────────────────────────
  "internal/post-signal": z.object({
    kind: z.enum([
      "artifact-updated",
      "decision-proposed",
      "decision-decided",
      "milestone-hit",
      "risk-raised",
      "agent-action",
      "knowledge-promoted",
      "metric-shift",
    ]),
    severity: z.enum(["info", "notable", "important", "urgent"]),
    title: z.string().min(2).max(255),
    detail: z.string().max(2000),
    engagementId: z.string().optional(),
  }),
};

export interface ValidationResult {
  ok: boolean;
  errors?: string[];
}

export function validateOutboundPayload(
  connectorId: ConnectorId,
  capabilityId: string,
  payload: unknown,
): ValidationResult {
  const key = `${connectorId}/${capabilityId}`;
  const schema = CONNECTOR_SCHEMAS[key];
  if (!schema) {
    // No schema registered — accept (forward-compatible for new capabilities).
    return { ok: true };
  }
  const result = schema.safeParse(payload);
  if (result.success) return { ok: true };
  return {
    ok: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
}

export function listRegisteredSchemas(): string[] {
  return Object.keys(CONNECTOR_SCHEMAS);
}
