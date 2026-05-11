import { partitionSchedule } from "@/lib/portal/schedule-partition";
import { loadPortalContext } from "@/lib/portal/server";
import { ScheduleView } from "./view";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const { snapshot, membership } = await loadPortalContext();
  const { upcoming, past } = partitionSchedule(snapshot.schedule ?? [], new Date());
  return (
    <ScheduleView
      upcoming={upcoming}
      past={past}
      engagements={snapshot.engagements}
      artifacts={snapshot.artifacts}
      decisions={snapshot.decisions}
      membership={membership}
    />
  );
}
