import { notFound } from "next/navigation";

import { computeCrossEngagementSuggestions } from "@/lib/portal/cross-engagement";
import { matchPatternsForEngagement } from "@/lib/portal/innovation/patterns";
import { loadPortalContext } from "@/lib/portal/server";

import { EngagementDetailView } from "./view";

export const dynamic = "force-dynamic";

interface EngagementDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EngagementDetailPage({ params }: EngagementDetailPageProps) {
  const { id } = await params;
  const { snapshot, membership } = await loadPortalContext();
  const engagement = snapshot.engagements.find((e) => e.id === id);
  if (!engagement) notFound();

  const artifacts = snapshot.artifacts.filter((a) => a.engagementId === id);
  const decisions = snapshot.decisions.filter((d) => d.engagementId === id);
  const tasks = snapshot.tasks.filter((t) => t.engagementId === id);
  const signals = snapshot.signals.filter((s) => s.engagementId === id);
  const scheduleItems = (snapshot.schedule ?? []).filter((s) => s.engagementId === id);
  const allSuggestions = computeCrossEngagementSuggestions(snapshot.engagements, snapshot.artifacts);
  const suggestions = allSuggestions[id] ?? [];
  const patternMatches = matchPatternsForEngagement(engagement.successCriteria, engagement.kind);

  return (
    <EngagementDetailView
      engagement={engagement}
      artifacts={artifacts}
      decisions={decisions}
      tasks={tasks}
      signals={signals}
      scheduleItems={scheduleItems}
      suggestions={suggestions}
      patternMatches={patternMatches}
      membership={membership}
    />
  );
}
