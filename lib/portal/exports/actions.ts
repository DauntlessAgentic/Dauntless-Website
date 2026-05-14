"use server";

// ============================================================
// Signed export server actions (Phase D)
//
// Each action loads the active membership, generates the bundle
// on the server, signs it with the per-workspace key, and emits
// an audit-log entry recording who exported what and when.
// ============================================================

import { generateImpactReport } from "@/lib/portal/telemetry/impact-report";
import { getPortalRepository } from "@/lib/portal/repositories";
import { loadPortalContext } from "@/lib/portal/server";
import type { AuditEntry } from "@/lib/portal/types";

import { signBundle, type SignatureManifest } from "./signing";

export interface SignedExport {
  filename: string;
  markdown: string;
  manifest: SignatureManifest;
}

function requireMember(membership: Awaited<ReturnType<typeof loadPortalContext>>["membership"]): {
  id: string;
  label: string;
} {
  if (
    (membership.status === "member" || membership.status === "dev-bypass") &&
    membership.membership
  ) {
    return {
      id: membership.membership.userId,
      label: `${membership.membership.userName} (${membership.membership.role})`,
    };
  }
  throw new Error("Signed exports require an active membership.");
}

export async function exportSignedImpactReport(): Promise<SignedExport> {
  const { snapshot, membership } = await loadPortalContext();
  const member = requireMember(membership);
  const report = await generateImpactReport(snapshot.workspace.id);
  const signed = signBundle({
    workspaceId: snapshot.workspace.id,
    body: report.markdown,
    memberId: member.id,
    memberLabel: member.label,
    bundleKind: "impact-report",
  });
  const repo = getPortalRepository();
  await repo.appendAuditEntry({
    workspaceId: snapshot.workspace.id,
    action: "agent-run",
    actor: member.label,
    actorKind: "human",
    refId: signed.manifest.bodySha256,
    detail: `${member.label} exported a signed Impact Report (sha256 ${signed.manifest.bodySha256.slice(0, 12)}…).`,
    riskTier: "low",
  });
  const stamp = signed.manifest.generatedAt.replace(/[:.]/g, "-");
  return {
    filename: `impact-report-${stamp}.signed.md`,
    markdown: signed.markdown,
    manifest: signed.manifest,
  };
}

export async function exportSignedAuditLog(): Promise<SignedExport> {
  const { snapshot, membership } = await loadPortalContext();
  const member = requireMember(membership);
  const repo = getPortalRepository();
  const entries = await repo.listAuditLog(snapshot.workspace.id, 500);
  const body = renderAuditLogMarkdown(snapshot.workspace.name, entries);
  const signed = signBundle({
    workspaceId: snapshot.workspace.id,
    body,
    memberId: member.id,
    memberLabel: member.label,
    bundleKind: "audit-log",
  });
  await repo.appendAuditEntry({
    workspaceId: snapshot.workspace.id,
    action: "agent-run",
    actor: member.label,
    actorKind: "human",
    refId: signed.manifest.bodySha256,
    detail: `${member.label} exported a signed audit-log bundle (${entries.length} entries, sha256 ${signed.manifest.bodySha256.slice(0, 12)}…).`,
    riskTier: "low",
  });
  const stamp = signed.manifest.generatedAt.replace(/[:.]/g, "-");
  return {
    filename: `audit-log-${stamp}.signed.md`,
    markdown: signed.markdown,
    manifest: signed.manifest,
  };
}

function renderAuditLogMarkdown(workspaceName: string, entries: AuditEntry[]): string {
  const header = `# Audit Log — ${workspaceName}\n\n_Most recent ${entries.length} entries._\n\n---\n\n`;
  const rows = entries
    .map((e) => {
      const at = e.at instanceof Date ? e.at.toISOString() : new Date(e.at).toISOString();
      const detail = e.detail ? e.detail.replace(/\n/g, " ").trim() : "";
      const ref = e.refId ? ` · ref \`${e.refId}\`` : "";
      const risk = e.riskTier ? ` · risk **${e.riskTier}**` : "";
      return `- \`${at}\` · **${e.action}** · ${e.actor} (${e.actorKind})${risk}${ref}\n  ${detail}`;
    })
    .join("\n");
  return `${header}${rows}\n`;
}
