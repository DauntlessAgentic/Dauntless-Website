import { generateImpactReport } from "@/lib/portal/telemetry/impact-report";
import { loadPortalContext } from "@/lib/portal/server";

import { ImpactReportView } from "./view";

export const dynamic = "force-dynamic";

export default async function ImpactReportPage() {
  const { snapshot, membership } = await loadPortalContext();
  const report = await generateImpactReport(snapshot.workspace.id);
  return (
    <ImpactReportView
      report={report}
      membership={membership}
    />
  );
}
