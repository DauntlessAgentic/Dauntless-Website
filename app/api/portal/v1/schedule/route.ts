import type { NextRequest } from "next/server";

import { errorResponse, jsonResponse, withApiAuth } from "@/lib/portal/api/auth";
import { getPortalRepository } from "@/lib/portal/repositories";
import { emitWebhook } from "@/lib/portal/webhooks";
import type { ScheduleItemKind } from "@/lib/portal/types";

export async function GET(request: NextRequest) {
  return withApiAuth(request, async () => {
    const repo = getPortalRepository();
    const workspace = await repo.getDefaultWorkspace();
    const schedule = await repo.listScheduleItems(workspace.id);
    return { workspaceId: workspace.id, schedule };
  });
}

interface ProposeBody {
  engagementId?: string;
  kind?: ScheduleItemKind;
  title?: string;
  startsAt?: string;
  durationMins?: number;
  attendees?: string[];
  notes?: string;
  proposedBy?: string;
}

// Audit-2 §M2: write cost weighting on schedule proposals.
const SCHEDULE_WRITE_COST = 3;

export async function POST(request: NextRequest) {
  return withApiAuth(
    request,
    async () => {
      let body: ProposeBody;
      try {
        body = (await request.json()) as ProposeBody;
      } catch {
        return errorResponse("Invalid JSON body.", 400);
      }
      if (!body.title || !body.startsAt || !body.durationMins || !body.kind) {
        return errorResponse("title, kind, startsAt, durationMins are required.", 400);
      }
      const repo = getPortalRepository();
      const workspace = await repo.getDefaultWorkspace();
      try {
        const item = await repo.proposeScheduleItem({
          workspaceId: workspace.id,
          engagementId: body.engagementId,
          kind: body.kind,
          title: body.title,
          startsAt: new Date(body.startsAt),
          durationMins: body.durationMins,
          attendees: body.attendees ?? [],
          notes: body.notes,
          proposedBy: body.proposedBy ?? "api-client",
          proposedByKind: "human",
        });
        emitWebhook({
          kind: "schedule-item-proposed",
          workspaceId: workspace.id,
          payload: { scheduleItemId: item.id, title: item.title, startsAt: item.startsAt.toISOString() },
        });
        return jsonResponse({ scheduleItem: item });
      } catch (err) {
        return errorResponse(err instanceof Error ? err.message : "Schedule propose failed.", 400);
      }
    },
    { cost: SCHEDULE_WRITE_COST },
  );
}
