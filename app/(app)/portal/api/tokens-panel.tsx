"use client";

import React, { useState, useTransition } from "react";
import { Key, Plus, Shield, Trash2, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentTag } from "@/components/ui/content-tag";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

import type { MembershipRole } from "@/lib/portal/types";

export interface ApiTokenRow {
  id: string;
  label: string;
  preview: string;
  scopeRole: MembershipRole;
  issuedBy: string;
  issuedAtISO: string;
  lastUsedAtISO: string | null;
}

export interface TokensPanelProps {
  tokens: ApiTokenRow[];
  canManage: boolean;
  /** Server actions; wired from the page-level loader. */
  issueAction: (input: {
    label: string;
    scopeRole: MembershipRole;
  }) => Promise<{ ok: boolean; plaintext?: string; tokenId?: string; reason?: string }>;
  revokeAction: (input: { tokenId: string }) => Promise<{ ok: boolean; reason?: string }>;
}

const SCOPE_TONE: Record<MembershipRole, React.ComponentProps<typeof ContentTag>["variant"]> = {
  owner: "accent",
  executive: "success",
  lead: "info",
  viewer: "default",
  auditor: "warning",
};

export function TokensPanel({ tokens, canManage, issueAction, revokeAction }: TokensPanelProps) {
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [scopeRole, setScopeRole] = useState<MembershipRole>("viewer");
  const [issuedPlaintext, setIssuedPlaintext] = useState<string | null>(null);
  const [issuedLabel, setIssuedLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleIssue = () => {
    setError(null);
    setIssuedPlaintext(null);
    setIssuedLabel(null);
    startTransition(async () => {
      const result = await issueAction({ label, scopeRole });
      if (!result.ok) {
        setError(result.reason ?? "Failed to issue token.");
        return;
      }
      setIssuedPlaintext(result.plaintext ?? null);
      setIssuedLabel(label);
      setLabel("");
    });
  };

  const handleRevoke = (tokenId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await revokeAction({ tokenId });
      if (!result.ok) setError(result.reason ?? "Failed to revoke token.");
    });
  };

  const handleCopy = async () => {
    if (!issuedPlaintext) return;
    try {
      await navigator.clipboard.writeText(issuedPlaintext);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-3 py-2.5">
      {issuedPlaintext && (
        <div
          className="rounded-[--radius-md] border border-[--border-active] bg-[--accent-dim] px-3 py-2 space-y-1.5"
          role="status"
        >
          <p className="text-xs font-semibold text-[--text-primary]">
            New token issued{issuedLabel ? `: ${issuedLabel}` : ""}
          </p>
          <p className="text-xs text-[--text-secondary] leading-snug">
            This is the only time the plaintext is shown. Copy it now — after closing this panel, only the preview survives.
          </p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-xs text-[--accent-vivid] bg-[--elevated-2] border border-[--border-active] rounded-[--radius-sm] px-2 py-1 flex-1 truncate">
              {issuedPlaintext}
            </code>
            <Button variant="accent" size="xs" onClick={handleCopy} className="gap-1 shrink-0">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}

      {canManage && (
        <div className="rounded-[--radius-md] border border-[--border-subtle] bg-[--elevated] p-3 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Issue a new token</p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_auto] gap-2">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='Label — e.g. "Ops dashboard read-only"'
              className="h-8 text-xs"
              maxLength={80}
              disabled={pending}
            />
            <Select value={scopeRole} onValueChange={(v) => setScopeRole(v as MembershipRole)} disabled={pending}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">viewer</SelectItem>
                <SelectItem value="auditor">auditor</SelectItem>
                <SelectItem value="lead">lead</SelectItem>
                <SelectItem value="executive">executive</SelectItem>
                <SelectItem value="owner">owner</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="primary"
              size="sm"
              onClick={handleIssue}
              disabled={pending || !label.trim()}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Issue
            </Button>
          </div>
          {error && (
            <p className="text-xs text-[--danger]">{error}</p>
          )}
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted] mb-1.5">
          Active tokens · {tokens.length}
        </p>
        {tokens.length === 0 ? (
          <p className="text-xs text-[--text-muted] px-1 py-2">
            No tokens issued yet. {canManage ? "Issue one above to start gating API access without the legacy PORTAL_API_KEY." : ""}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[--border-subtle]">
            {tokens.map((token) => (
              <li key={token.id} className="flex items-start gap-2 px-1 py-2">
                <Key className="h-3.5 w-3.5 text-[--text-muted] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-semibold text-[--text-primary] truncate">{token.label}</p>
                    <ContentTag variant={SCOPE_TONE[token.scopeRole]}>{token.scopeRole}</ContentTag>
                  </div>
                  <p className="text-xs text-[--text-muted] font-mono">
                    {token.preview}…  ·  issued by {token.issuedBy}  ·  {new Date(token.issuedAtISO).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-[--text-muted]">
                    {token.lastUsedAtISO
                      ? `Last used ${new Date(token.lastUsedAtISO).toLocaleString()}`
                      : "Never used"}
                  </p>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleRevoke(token.id)}
                    disabled={pending}
                    className="gap-1 shrink-0 text-[--text-muted] hover:text-[--danger]"
                    aria-label={`Revoke token ${token.label}`}
                  >
                    <Trash2 className="h-3 w-3" />
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!canManage && (
        <p className="text-xs text-[--text-muted] leading-snug">
          <Shield className="inline h-3 w-3 mr-1 text-[--text-muted]" />
          Read-only — issuing or revoking tokens requires an owner or executive role.
        </p>
      )}
    </div>
  );
}
