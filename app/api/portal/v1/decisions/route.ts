import type { NextRequest } from "next/server";

import { errorResponse, jsonResponse, withApiAuth } from "@/lib/portal/api/auth";
import { getPortalRepository } from "@/lib/portal/repositories";
import { emitWebhook } from "@/lib/portal/webhooks";

export async function GET(request: NextRequest) {
  return withApiAuth(request, async () => {
    const repo = getPortalRepository();
    const workspace = await repo.getDefaultWorkspace();
    const decisions = await repo.listDecisions(workspace.id);
    return { workspaceId: workspace.id, decisions };
  });
}

interface DecisionOutcomeBody {
  decisionId?: string;
  outcome?: "approved" | "deferred" | "rejected";
  actor?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  const auth = await import("@/lib/portal/api/auth").then((m) => m.authenticateApiRequest(request));
  if (!auth.ok) return errorResponse(auth.reason, auth.status);
  let body: DecisionOutcomeBody;
  try {
    body = (await request.json()) as DecisionOutcomeBody;
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }
  if (!body.decisionId || !body.outcome) {
    return errorResponse("decisionId and outcome are required.", 400);
  }
  if (body.outcome !== "approved" && body.outcome !== "deferred" && body.outcome !== "rejected") {
    return errorResponse("outcome must be approved | deferred | rejected.", 400);
  }
  const repo = getPortalRepository();
  const workspace = await repo.getDefaultWorkspace();
  try {
    const updated = await repo.recordDecisionOutcome({
      decisionId: body.decisionId,
      workspaceId: workspace.id,
      actor: body.actor ?? "api-client",
      actorKind: "human",
      outcome: body.outcome,
      notes: body.notes,
    });
    emitWebhook({
      kind: "decision-outcome",
      workspaceId: workspace.id,
      payload: { decisionId: updated.id, outcome: updated.status },
    });
    return jsonResponse({ decision: updated });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Decision update failed.", 400);
  }
}
