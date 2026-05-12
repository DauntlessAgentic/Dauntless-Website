import type { NextRequest } from "next/server";

import { withApiAuth } from "@/lib/portal/api/auth";
import { searchWorkspace } from "@/lib/portal/knowledge";
import { getPortalRepository } from "@/lib/portal/repositories";

export async function GET(request: NextRequest) {
  return withApiAuth(request, async () => {
    const repo = getPortalRepository();
    const workspace = await repo.getDefaultWorkspace();
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim();
    if (query) {
      const limitParam = url.searchParams.get("limit");
      const results = await searchWorkspace({
        workspaceId: workspace.id,
        query,
        limit: limitParam ? Math.max(1, Math.min(50, Number.parseInt(limitParam, 10) || 20)) : 20,
      });
      return { workspaceId: workspace.id, query, results };
    }
    const knowledge = await repo.listKnowledge(workspace.id);
    return { workspaceId: workspace.id, knowledge };
  });
}
