// ============================================================
// Webhook stub (Phase 9.0)
//
// Phase 9.0 records would-be-sent webhooks into an in-memory
// ledger so the /portal/api page can show them. Phase 9.1 hooks
// real HTTP delivery with at-least-once retry semantics.
// ============================================================

// Server-only by convention.

export type WebhookKind =
  | "decision-outcome"
  | "decision-proposed"
  | "artifact-published"
  | "artifact-promoted-canonical"
  | "schedule-item-proposed"
  | "agent-run-completed";

export interface WebhookEvent {
  id: string;
  kind: WebhookKind;
  workspaceId: string;
  at: Date;
  payload: Record<string, unknown>;
}

const events: WebhookEvent[] = [];
const MAX = 200;
let counter = 0;

export function emitWebhook(input: { kind: WebhookKind; workspaceId: string; payload: Record<string, unknown> }): WebhookEvent {
  counter += 1;
  const event: WebhookEvent = {
    id: `wh-${Date.now().toString(36)}-${counter.toString(36)}`,
    kind: input.kind,
    workspaceId: input.workspaceId,
    at: new Date(),
    payload: input.payload,
  };
  events.push(event);
  if (events.length > MAX) events.splice(0, events.length - MAX);
  return event;
}

export function listWebhookEvents(filter?: { kind?: WebhookKind; workspaceId?: string; limit?: number }): WebhookEvent[] {
  let rows = events.slice();
  if (filter?.kind) rows = rows.filter((e) => e.kind === filter.kind);
  if (filter?.workspaceId) rows = rows.filter((e) => e.workspaceId === filter.workspaceId);
  rows.sort((a, b) => b.at.getTime() - a.at.getTime());
  if (filter?.limit) rows = rows.slice(0, filter.limit);
  return rows;
}

/** Test-only. */
export function __resetWebhookEvents(): void {
  events.length = 0;
  counter = 0;
}
