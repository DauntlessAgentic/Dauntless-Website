import { listModelVariants } from "@/lib/portal/models/store";
import { loadPortalContext } from "@/lib/portal/server";

import { ModelsView } from "./view";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const { snapshot, membership } = await loadPortalContext();
  const variants = listModelVariants(snapshot.workspace.id);
  return (
    <ModelsView
      membership={membership}
      variants={variants}
      artifacts={snapshot.artifacts}
    />
  );
}
