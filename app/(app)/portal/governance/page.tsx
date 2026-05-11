import { computeActivationStatus, getPortalRepository } from "@/lib/portal/repositories";
import { loadPortalContext } from "@/lib/portal/server";
import { GovernanceView } from "./view";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const { snapshot, membership } = await loadPortalContext();
  const activationStatus = computeActivationStatus(getPortalRepository());
  return (
    <GovernanceView
      snapshot={snapshot}
      membership={membership}
      activationStatus={activationStatus}
    />
  );
}
