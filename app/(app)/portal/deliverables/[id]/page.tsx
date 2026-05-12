import { notFound } from "next/navigation";

import { loadPortalContext } from "@/lib/portal/server";
import { decayConfidence } from "@/lib/portal/knowledge";

import { ArtifactDetailView } from "./view";

export const dynamic = "force-dynamic";

interface ArtifactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtifactDetailPage({ params }: ArtifactDetailPageProps) {
  const { id } = await params;
  const { snapshot, membership } = await loadPortalContext();
  const artifact = snapshot.artifacts.find((a) => a.id === id);
  if (!artifact) {
    notFound();
  }

  const engagement = snapshot.engagements.find((e) => e.id === artifact.engagementId);
  const linkedDecisions = snapshot.decisions.filter((d) => artifact.linkedDecisionIds.includes(d.id));
  const linkedEvidence = snapshot.evidence.filter((e) => artifact.linkedEvidenceIds.includes(e.id));
  const linkedKnowledge = snapshot.knowledge.filter((k) =>
    k.summary.toLowerCase().includes(artifact.name.toLowerCase().split(" ")[0] ?? ""),
  );
  const decayedKnowledge = linkedKnowledge.map((k) => ({
    item: k,
    decayed: decayConfidence({
      lastValidatedAt: k.lastValidatedAt,
      memoryTier: k.memoryTier,
      confidence: k.confidence,
    }),
  }));

  return (
    <ArtifactDetailView
      artifact={artifact}
      engagement={engagement}
      decisions={linkedDecisions}
      evidence={linkedEvidence}
      knowledge={decayedKnowledge}
      membership={membership}
    />
  );
}
