import { getWorkspaceFreezeStatus } from "@/lib/portal/outbound-actions/freeze-actions";

import { SomethingWentWrongView } from "./view";

export const dynamic = "force-dynamic";

export default async function SomethingWentWrongPage() {
  const status = await getWorkspaceFreezeStatus();
  return <SomethingWentWrongView initialStatus={status} />;
}
