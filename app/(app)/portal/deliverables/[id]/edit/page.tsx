import { notFound } from "next/navigation";

import { loadPortalContext } from "@/lib/portal/server";
import { ArtifactEditorView } from "./view";

export const dynamic = "force-dynamic";

interface ArtifactEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtifactEditorPage({ params }: ArtifactEditorPageProps) {
  const { id } = await params;
  const { snapshot, membership } = await loadPortalContext();
  const artifact = snapshot.artifacts.find((a) => a.id === id);
  if (!artifact) notFound();

  const engagement = snapshot.engagements.find((e) => e.id === artifact.engagementId);
  const evidenceById = new Map(snapshot.evidence.map((e) => [e.id, e]));
  const linkedEvidence = artifact.linkedEvidenceIds
    .map((eid) => evidenceById.get(eid))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <ArtifactEditorView
      artifact={artifact}
      engagement={engagement}
      linkedEvidence={linkedEvidence}
      evidenceById={evidenceById}
      membership={membership}
    />
  );
}
