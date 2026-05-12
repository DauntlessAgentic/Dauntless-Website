import { loadPortalContext } from "@/lib/portal/server";
import { CommandCenterView } from "./command-center-view";

export const dynamic = "force-dynamic";

export default async function PortalCommandCenterPage() {
  const { snapshot, membership } = await loadPortalContext();
  return <CommandCenterView snapshot={snapshot} membership={membership} />;
}
