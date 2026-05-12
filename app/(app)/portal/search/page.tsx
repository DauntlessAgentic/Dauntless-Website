import { loadPortalContext } from "@/lib/portal/server";
import { searchWorkspace } from "@/lib/portal/knowledge";

import { SearchView } from "./view";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    entity?: string | string[];
    shelf?: string;
    freshness?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { snapshot, membership } = await loadPortalContext();
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const entityFilter = ([] as string[]).concat(params.entity ?? []);
  const shelfFilter = params.shelf as "desk" | "bookshelf" | "cabinet" | undefined;
  const freshnessFilter = params.freshness as "fresh" | "aging" | "stale" | undefined;

  const results = query
    ? await searchWorkspace({
        workspaceId: snapshot.workspace.id,
        query,
        entities: entityFilter.length
          ? (entityFilter.filter(Boolean) as Array<
              "artifact" | "decision" | "knowledge" | "signal" | "conversation"
            >)
          : undefined,
        shelf: shelfFilter,
        minFreshness: freshnessFilter,
        limit: 30,
      })
    : [];

  return (
    <SearchView
      snapshot={snapshot}
      membership={membership}
      query={query}
      activeEntities={entityFilter}
      activeShelf={shelfFilter}
      activeFreshness={freshnessFilter}
      results={results.map((r) => ({
        ...r,
        provenance: { ...r.provenance, lastTouchedAt: r.provenance.lastTouchedAt },
      }))}
    />
  );
}
