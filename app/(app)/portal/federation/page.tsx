import {
  listContributions,
  listFederations,
  listMemberships,
  searchFederation,
} from "@/lib/portal/federation";
import { loadPortalContext } from "@/lib/portal/server";

import { FederationView } from "./view";

interface FederationPageProps {
  searchParams: Promise<{ q?: string; fed?: string }>;
}

export const dynamic = "force-dynamic";

export default async function FederationPage({ searchParams }: FederationPageProps) {
  const { snapshot, membership } = await loadPortalContext();
  const params = await searchParams;
  const federations = listFederations();
  const memberships = listMemberships(snapshot.workspace.id);
  const contributions = listContributions(snapshot.workspace.id);
  const query = (params.q ?? "").trim();
  const results = query ? searchFederation(query, params.fed, 25) : [];
  return (
    <FederationView
      membership={membership}
      federations={federations}
      memberships={memberships}
      contributions={contributions}
      artifacts={snapshot.artifacts.filter((a) => a.canonical || a.reviewState === "approved")}
      query={query}
      activeFederationId={params.fed}
      results={results}
    />
  );
}
