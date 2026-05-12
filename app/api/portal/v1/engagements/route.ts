import type { NextRequest } from "next/server";

import { withApiAuth } from "@/lib/portal/api/auth";
import { getPortalRepository } from "@/lib/portal/repositories";

export async function GET(request: NextRequest) {
  return withApiAuth(request, async () => {
    const repo = getPortalRepository();
    const workspace = await repo.getDefaultWorkspace();
    const engagements = await repo.listEngagements(workspace.id);
    return { workspaceId: workspace.id, engagements };
  });
}
