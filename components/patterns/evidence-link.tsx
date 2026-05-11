import React from "react";
import { FileText, Activity, BarChart3, Workflow, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import type { EvidenceKind } from "@/lib/portal/types";

const KIND_META: Record<EvidenceKind, { Icon: React.ComponentType<{ className?: string }>; label: string }> = {
  artifact:       { Icon: FileText,    label: "Artifact" },
  metric:         { Icon: BarChart3,   label: "Metric" },
  signal:         { Icon: Activity,    label: "Signal" },
  source:         { Icon: ExternalLink, label: "Source" },
  "workflow-log": { Icon: Workflow,    label: "Workflow" },
};

interface EvidenceLinkProps {
  kind: EvidenceKind;
  title: string;
  source?: string;
  className?: string;
}

export function EvidenceLink({ kind, title, source, className }: EvidenceLinkProps) {
  const { Icon, label } = KIND_META[kind];
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-[--radius-sm]",
        "bg-[--elevated] border border-[--border-subtle] px-1.5 py-0.5",
        "text-xs text-[--text-secondary] truncate",
        className,
      )}
      title={source ? `${label} · ${source}` : label}
    >
      <Icon className="h-3 w-3 text-[--text-muted] shrink-0" />
      <span className="text-[--text-muted] uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-[--text-secondary] truncate">{title}</span>
    </span>
  );
}
