import { loadPortalContext } from "@/lib/portal/server";
import { listConnectors } from "@/lib/portal/outbound-actions/connectors";
import { listOutboundActions } from "@/lib/portal/outbound-actions/store";

import { OutboundActionsView } from "./view";

export const dynamic = "force-dynamic";

export default async function OutboundActionsPage() {
  const { snapshot, membership } = await loadPortalContext();
  const connectors = listConnectors();
  const actions = listOutboundActions(snapshot.workspace.id);
  return (
    <OutboundActionsView
      membership={membership}
      connectors={connectors}
      actions={actions}
      engagements={snapshot.engagements}
    />
  );
}
