import type { NextRequest } from "next/server";

import { withApiAuth } from "@/lib/portal/api/auth";
import { getPortalRepository } from "@/lib/portal/repositories";
import { computeDerivedMetrics } from "@/lib/portal/telemetry/metrics";

export async function GET(request: NextRequest) {
  return withApiAuth(request, async () => {
    const repo = getPortalRepository();
    const workspace = await repo.getDefaultWorkspace();
    const [stored, derived] = await Promise.all([
      repo.listMetrics(workspace.id),
      Promise.resolve(computeDerivedMetrics(workspace.id)),
    ]);
    return { workspaceId: workspace.id, stored, derived };
  });
}
