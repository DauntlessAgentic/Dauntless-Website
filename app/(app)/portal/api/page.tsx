import { canPerform } from "@/lib/auth/membership-gate";
import { listApiTokens } from "@/lib/portal/api/tokens";
import { issueApiTokenAction, revokeApiTokenAction } from "@/lib/portal/api/token-actions";
import { getPortalRepository } from "@/lib/portal/repositories";
import { loadPortalContext } from "@/lib/portal/server";
import { listWebhookEvents } from "@/lib/portal/webhooks";

import { ApiExplorerView } from "./view";

export const dynamic = "force-dynamic";

export default async function ApiExplorerPage() {
  const { membership } = await loadPortalContext();
  const isConfigured = Boolean(process.env.PORTAL_API_KEY);
  const recentWebhooks = listWebhookEvents({ limit: 20 });

  const repository = getPortalRepository();
  const workspace = await repository.getDefaultWorkspace();
  const tokens = listApiTokens({ workspaceId: workspace.id }).map((t) => ({
    id: t.id,
    label: t.label,
    preview: t.preview,
    scopeRole: t.scopeRole,
    issuedBy: t.issuedBy,
    issuedAtISO: t.issuedAt.toISOString(),
    lastUsedAtISO: t.lastUsedAt ? t.lastUsedAt.toISOString() : null,
  }));
  const canManageTokens = canPerform(membership.role, "manage-api-tokens");

  return (
    <ApiExplorerView
      membership={membership}
      isConfigured={isConfigured}
      recentWebhooks={recentWebhooks.map((w) => ({ ...w, at: w.at }))}
      tokens={tokens}
      canManageTokens={canManageTokens}
      issueAction={issueApiTokenAction}
      revokeAction={revokeApiTokenAction}
    />
  );
}
