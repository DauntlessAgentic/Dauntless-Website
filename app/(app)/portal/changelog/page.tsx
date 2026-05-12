import { collectChangelog } from "@/lib/portal/changelog";
import { loadPortalContext } from "@/lib/portal/server";

import { ChangelogView } from "./view";

export const dynamic = "force-dynamic";

interface ChangelogPageProps {
  searchParams: Promise<{ source?: string }>;
}

export default async function ChangelogPage({ searchParams }: ChangelogPageProps) {
  const { snapshot, membership } = await loadPortalContext();
  const params = await searchParams;
  const entries = collectChangelog(
    {
      workspaceId: snapshot.workspace.id,
      auditLog: snapshot.auditLog,
      signals: snapshot.signals,
    },
    { limit: 200 },
  );
  return (
    <ChangelogView
      entries={entries}
      activeSource={params.source}
      membership={membership}
    />
  );
}
