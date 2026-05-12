import { notFound } from "next/navigation";

import { loadPortalContext } from "@/lib/portal/server";
import { DecisionDetailView } from "./view";

export const dynamic = "force-dynamic";

interface DecisionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionDetailPage({ params }: DecisionDetailPageProps) {
  const { id } = await params;
  const { snapshot, membership } = await loadPortalContext();
  const decision = snapshot.decisions.find((d) => d.id === id);
  if (!decision) notFound();

  const engagement = snapshot.engagements.find((e) => e.id === decision.engagementId);
  const evidence = snapshot.evidence.filter((e) => decision.evidenceIds.includes(e.id));
  const artifacts = snapshot.artifacts.filter((a) => decision.artifactIds.includes(a.id));
  const auditEntries = snapshot.auditLog
    .filter((a) => a.refId === decision.id)
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <DecisionDetailView
      decision={decision}
      engagement={engagement}
      evidence={evidence}
      artifacts={artifacts}
      auditEntries={auditEntries}
      membership={membership}
    />
  );
}
