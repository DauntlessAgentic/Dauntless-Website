"use client";
import React from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { ArtifactMarkdown } from "@/components/patterns/artifact-markdown";

interface SignedExport {
  filename: string;
  markdown: string;
  manifest: {
    version: string;
    workspaceId: string;
    bundleKind: string;
    memberId: string;
    memberLabel: string;
    generatedAt: string;
    bodySha256: string;
    signature: string;
    algorithm: string;
    keyId: string;
  };
}

interface Props {
  signed: SignedExport;
}

export function SignedPreviewView({ signed }: Props) {
  const download = () => {
    const blob = new Blob([signed.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = signed.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Official record · preview"
        title="Signed Impact Report — web preview"
        description="Verify the watermark and signature here before downloading. The file you download is the markdown shown below, including the signature footer."
        badge="Tamper-evident"
        badgeVariant="success"
        actions={
          <Link
            href="/portal/outcomes/impact-report"
            className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3 w-3" /> Back to Impact Report
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        {/* Signature card — what auditors verify */}
        <DashboardCard
          id="signature-manifest"
          eyebrow="SIGNATURE"
          title="Watermark + manifest"
          subtitle="What an auditor checks against. The signature below is HMAC-SHA256 over the document body."
          badge={signed.manifest.algorithm}
          badgeVariant="info"
        >
          <div className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <ManifestRow label="Exported by" value={signed.manifest.memberLabel} />
            <ManifestRow label="Generated at" value={new Date(signed.manifest.generatedAt).toLocaleString()} />
            <ManifestRow label="Workspace" value={signed.manifest.workspaceId} mono />
            <ManifestRow label="Bundle kind" value={signed.manifest.bundleKind} />
            <ManifestRow label="Key id" value={signed.manifest.keyId} mono />
            <ManifestRow label="Body SHA-256" value={signed.manifest.bodySha256} mono truncate />
            <ManifestRow label="Signature" value={signed.manifest.signature} mono truncate full />
          </div>
          <div className="px-3 pb-3">
            <Button variant="primary" size="sm" className="gap-1.5" onClick={download}>
              <Download className="h-3.5 w-3.5" />
              Download signed bundle ({signed.filename})
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard
          id="signed-body"
          eyebrow="REPORT BODY"
          title="What's inside the bundle"
          subtitle="Renders the same markdown that ships in the downloaded file. Includes the watermark line and the signature footer."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[60vh]">
            <div className="px-3 py-3">
              <ArtifactMarkdown body={signed.markdown} evidenceById={new Map()} />
            </div>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="verify-instructions"
          eyebrow="VERIFY ELSEWHERE"
          title="How a procurement officer would verify this"
          subtitle="The signature is HMAC-SHA256, computed with a per-workspace key derived from a master secret."
        >
          <div className="px-3 py-3 text-xs text-[--text-secondary] leading-snug space-y-2">
            <p>
              <span className="font-semibold text-[--text-primary]">Recompute the SHA-256</span> of
              the body (everything before the <code className="font-mono">DAUNTLESS-EVIDENCE-SIGNATURE-V1</code> marker).
              It should match the <code className="font-mono">body_sha256</code> in the manifest.
            </p>
            <p>
              <span className="font-semibold text-[--text-primary]">Recompute the HMAC-SHA256</span> of
              the body using the per-workspace key (derivable only with the master secret). The hex string
              must match the <code className="font-mono">signature</code> field.
            </p>
            <p>
              A standalone CLI for this verification ships with the SDK in a follow-up. Until then, anyone
              with the master signing key can verify in Node:
            </p>
            <pre className="bg-[--elevated-2] rounded-[--radius-md] px-3 py-2 text-xs font-mono overflow-x-auto">
{`import { verifyBundle } from "@dauntlessagentic/portal-sdk/verify";
import fs from "node:fs";

const md = fs.readFileSync("${signed.filename}", "utf8");
console.log(verifyBundle(md));`}
            </pre>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

function ManifestRow({
  label,
  value,
  mono = false,
  truncate = false,
  full = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs uppercase tracking-widest text-[--text-muted]">{label}</span>
      <span
        className={`${mono ? "font-mono" : ""} ${truncate ? "truncate" : ""} text-[--text-primary]`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
