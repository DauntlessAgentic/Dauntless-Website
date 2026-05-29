import { loadPortalContext } from "@/lib/portal/server";
import { listWebhookEvents } from "@/lib/portal/webhooks";

import { ApiExplorerView } from "./view";

export const dynamic = "force-dynamic";

export default async function ApiExplorerPage() {
  const { membership } = await loadPortalContext();
  const isConfigured = Boolean(process.env.PORTAL_API_KEY);
  const isProduction = process.env.NODE_ENV === "production";
  const isOpenApiDemo = isProduction && process.env.PORTAL_ALLOW_OPEN_API === "true";
  const recentWebhooks = listWebhookEvents({ limit: 20 });
  return (
    <ApiExplorerView
      membership={membership}
      isConfigured={isConfigured}
      isProduction={isProduction}
      isOpenApiDemo={isOpenApiDemo}
      recentWebhooks={recentWebhooks.map((w) => ({ ...w, at: w.at }))}
    />
  );
}
