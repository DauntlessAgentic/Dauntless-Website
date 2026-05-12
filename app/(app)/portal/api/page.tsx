import { loadPortalContext } from "@/lib/portal/server";
import { listWebhookEvents } from "@/lib/portal/webhooks";

import { ApiExplorerView } from "./view";

export const dynamic = "force-dynamic";

export default async function ApiExplorerPage() {
  const { membership } = await loadPortalContext();
  const isConfigured = Boolean(process.env.PORTAL_API_KEY);
  const recentWebhooks = listWebhookEvents({ limit: 20 });
  return (
    <ApiExplorerView
      membership={membership}
      isConfigured={isConfigured}
      recentWebhooks={recentWebhooks.map((w) => ({ ...w, at: w.at }))}
    />
  );
}
