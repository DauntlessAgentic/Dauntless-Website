import { computePortalCompliance, SECTOR_PACKS } from "@/lib/portal/compliance";
import { computeActivationStatus, getPortalRepository } from "@/lib/portal/repositories";
import { loadPortalContext } from "@/lib/portal/server";

import { ComplianceView } from "./view";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const { snapshot, membership } = await loadPortalContext();
  const activation = computeActivationStatus(getPortalRepository());
  const isApiKeyConfigured = Boolean(process.env.PORTAL_API_KEY);
  const isAuthConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  const posture = computePortalCompliance({
    decisions: snapshot.decisions,
    artifacts: snapshot.artifacts,
    knowledge: snapshot.knowledge,
    memberships: snapshot.memberships,
    auditLog: snapshot.auditLog,
    isHostedRepository: activation.isHosted,
    isApiKeyConfigured,
    isAuthConfigured,
  });

  return (
    <ComplianceView
      posture={posture}
      sectorPacks={SECTOR_PACKS}
      membership={membership}
    />
  );
}
