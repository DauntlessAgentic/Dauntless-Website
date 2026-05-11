// ============================================================
// Schedule partitioning helper (Phase 5.1)
//
// Pulled out of the server page to keep the React Compiler happy
// (`Date.now()` is impure; the compiler refuses to memoize render
// bodies that call it). Server pages call this helper as a free
// function — not part of any render path.
// ============================================================

import type { ScheduleItem } from "@/lib/portal/types";

export function partitionSchedule(
  schedule: ScheduleItem[],
  now: Date,
): { upcoming: ScheduleItem[]; past: ScheduleItem[] } {
  const horizon = now.getTime() - 60 * 60 * 1000;
  const upcoming = schedule
    .filter((s) => s.startsAt.getTime() > horizon && s.status !== "cancelled" && s.status !== "completed")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const past = schedule
    .filter((s) => !upcoming.includes(s))
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  return { upcoming, past };
}
