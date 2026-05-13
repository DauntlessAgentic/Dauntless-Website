import type { Metadata } from "next";
import { computeNextBestActions } from "@/lib/portal/next-best-actions";
import { loadPortalContext } from "@/lib/portal/server";
import { CommandCenterView } from "./command-center-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Intelligence Portal",
  description:
    "Living deliverables, Decision Register, contextual agents, knowledge architecture, and outcome telemetry. The Dauntless Agentic cockpit.",
  openGraph: {
    title: "Client Intelligence Portal · Dauntless Agentic",
    description:
      "The post-marketing cockpit where engagements compound into a living, governed intelligence asset.",
    type: "website",
    siteName: "Dauntless Agentic",
  },
  twitter: {
    card: "summary_large_image",
    title: "Client Intelligence Portal · Dauntless Agentic",
    description:
      "Living deliverables · Decision Surface · Evidence Vault · Contextual Agents · Knowledge Architecture.",
  },
};

export default async function PortalCommandCenterPage() {
  const { snapshot, membership } = await loadPortalContext();
  // Phase 5.1: replace the static seeded NBA list with a live-computed one.
  const computedActions = computeNextBestActions({
    decisions: snapshot.decisions,
    engagements: snapshot.engagements,
    artifacts: snapshot.artifacts,
    knowledge: snapshot.knowledge,
    schedule: snapshot.schedule ?? [],
  });
  const enrichedSnapshot = { ...snapshot, nextBestActions: computedActions };
  return <CommandCenterView snapshot={enrichedSnapshot} membership={membership} />;
}
