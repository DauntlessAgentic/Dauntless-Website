"use server";

// ============================================================
// Server actions for Innovation Engine proposals.
// Surfaced on /portal/innovation (advisory action #6 + #14 root).
// ============================================================

import { acknowledgeProposal, snoozeProposal, type InnovationProposal } from "./engine";

export async function snoozeProposalAction(
  id: string,
  hours = 24,
): Promise<InnovationProposal | null> {
  return snoozeProposal(id, hours);
}

export async function acknowledgeProposalAction(
  id: string,
): Promise<InnovationProposal | null> {
  return acknowledgeProposal(id);
}
