import type { NextRequest } from "next/server";

import { withApiAuth } from "@/lib/portal/api/auth";
import { buildThisWeekDigest } from "@/lib/portal/digests/this-week";
import { renderWeeklyDigest } from "@/lib/portal/digests/weekly-render";
import { tick as runInnovationEngineTick } from "@/lib/portal/innovation/engine";
import { getPortalRepository } from "@/lib/portal/repositories";
import type { MembershipRole } from "@/lib/portal/types";

const ALLOWED_ROLES = new Set<MembershipRole>(["owner", "executive", "lead", "viewer", "auditor"]);

/**
 * GET /api/portal/v1/digest?role=executive&windowDays=7&format=html|text|json
 *
 * Returns the personalised "what changed this week" payload that
 * powers the Command Center card. External mailers can poll this to
 * dispatch the weekly email/PDF digest (advisory action #20).
 */
export async function GET(request: NextRequest) {
  return withApiAuth(request, async () => {
    const url = new URL(request.url);
    const roleParam = url.searchParams.get("role") ?? "executive";
    const role = (ALLOWED_ROLES.has(roleParam as MembershipRole) ? roleParam : "executive") as MembershipRole;
    const windowDays = Math.max(1, Math.min(30, Number(url.searchParams.get("windowDays") ?? 7)));
    const format = (url.searchParams.get("format") ?? "json").toLowerCase();
    const repo = getPortalRepository();
    const workspace = await repo.getDefaultWorkspace();
    await runInnovationEngineTick(workspace.id);
    const digest = await buildThisWeekDigest({ workspaceId: workspace.id, role, windowDays });
    if (format === "html" || format === "text") {
      const rendered = renderWeeklyDigest(workspace.name, digest);
      return {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        subject: rendered.subject,
        ...(format === "html" ? { html: rendered.html } : { text: rendered.text }),
        digest,
      };
    }
    return { workspaceId: workspace.id, workspaceName: workspace.name, digest };
  });
}
