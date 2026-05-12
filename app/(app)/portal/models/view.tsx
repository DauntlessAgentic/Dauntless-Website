"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Bot, GitBranch, RotateCcw, Sparkles } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { Progress } from "@/components/ui/progress";

import type { MembershipContext } from "@/lib/auth/session";
import type { Artifact } from "@/lib/portal/types";
import type { ModelVariant } from "@/lib/portal/models/types";
import {
  proposeFineTune,
  rollbackVariant,
  routeToVariant,
} from "@/lib/portal/models/actions";

interface ModelsViewProps {
  membership: MembershipContext;
  variants: ModelVariant[];
  artifacts: Artifact[];
}

const STATUS_TONE: Record<ModelVariant["status"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  training: "info",
  evaluating: "info",
  ready: "success",
  active: "accent",
  "rolled-back": "warning",
  failed: "danger",
};

export function ModelsView({ membership, variants, artifacts }: ModelsViewProps) {
  const canManage = membership.role === "owner" || membership.role === "executive";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [residency, setResidency] = useState<"ca" | "us" | "eu">("ca");

  const handlePropose = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (selected.length === 0) {
      setError("Pick at least one source artifact.");
      return;
    }
    startTransition(async () => {
      try {
        await proposeFineTune({
          baseModel: "claude-sonnet-4-6",
          label,
          description,
          sourceArtifactIds: selected,
          dataResidency: residency,
        });
        setLabel("");
        setDescription("");
        setSelected([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Propose failed.");
      }
    });
  };

  const active = variants.find((v) => v.isRouted);

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Per-workspace models"
        title="Baseline + fine-tunes in this workspace"
        description={`${variants.length} variant${variants.length === 1 ? "" : "s"} registered · routing on ${active?.label ?? "—"}.`}
        badge="Phase 13.0"
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="models-registry"
          eyebrow="REGISTRY"
          title="Model variants"
          subtitle="A fine-tuned variant must outperform baseline by ≥2 points before routing. Drift above 0.4 auto-rolls back."
          bodyClassName="overflow-hidden"
        >
          <ScrollArea className="h-full max-h-[500px]">
            <ul className="flex flex-col divide-y divide-[--border-subtle]">
              {variants.map((v) => (
                <li key={v.id} className="flex flex-col gap-1.5 px-3 py-3">
                  <div className="flex items-center gap-2">
                    {v.kind === "baseline" ? (
                      <Bot className="h-3.5 w-3.5 text-[--text-muted] shrink-0" />
                    ) : (
                      <GitBranch className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                    )}
                    <p className="flex-1 text-xs font-semibold text-[--text-primary] truncate">{v.label}</p>
                    <ContentTag variant={STATUS_TONE[v.status]} dot>
                      {v.status}
                    </ContentTag>
                    {v.isRouted && <ContentTag variant="accent">routed</ContentTag>}
                    <ContentTag variant="info">residency {v.dataResidency.toUpperCase()}</ContentTag>
                  </div>
                  <p className="text-xs text-[--text-secondary] leading-snug">{v.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
                      <p className="uppercase tracking-widest text-[--text-muted]">Eval</p>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.round(v.evalScore * 100)} color="success" />
                        <span className="font-mono tabular-nums text-[--text-primary]">{Math.round(v.evalScore * 100)}</span>
                      </div>
                    </div>
                    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
                      <p className="uppercase tracking-widest text-[--text-muted]">vs. baseline</p>
                      <p className={`font-mono tabular-nums ${v.evalScore > v.baselineEvalScore ? "text-[--success]" : v.evalScore < v.baselineEvalScore ? "text-[--danger]" : "text-[--text-muted]"}`}>
                        {((v.evalScore - v.baselineEvalScore) * 100 >= 0 ? "+" : "") + ((v.evalScore - v.baselineEvalScore) * 100).toFixed(1)}
                      </p>
                    </div>
                    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
                      <p className="uppercase tracking-widest text-[--text-muted]">Drift</p>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.round(v.driftScore * 100)} color={v.driftScore > 0.4 ? "warning" : "accent"} />
                        <span className="font-mono tabular-nums text-[--text-primary]">{Math.round(v.driftScore * 100)}</span>
                      </div>
                    </div>
                    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
                      <p className="uppercase tracking-widest text-[--text-muted]">Source</p>
                      <p className="font-mono tabular-nums text-[--text-primary]">{v.sourceArtifactIds.length} artifacts</p>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="primary"
                        className="gap-1.5"
                        disabled={isPending || v.isRouted || (v.status !== "ready" && v.status !== "active")}
                        onClick={() =>
                          startTransition(async () => {
                            try {
                              await routeToVariant({ variantId: v.id });
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Route failed.");
                            }
                          })
                        }
                      >
                        <Sparkles className="h-3 w-3" /> Route here
                      </Button>
                      {v.kind === "fine-tuned" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5"
                          disabled={isPending || v.status === "rolled-back"}
                          onClick={() =>
                            startTransition(async () => {
                              try {
                                await rollbackVariant({ variantId: v.id });
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Rollback failed.");
                              }
                            })
                          }
                        >
                          <RotateCcw className="h-3 w-3" /> Roll back
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </DashboardCard>

        <DashboardCard
          id="models-propose"
          eyebrow="PROPOSE"
          title={canManage ? "Propose a fine-tune" : "Propose a fine-tune (read-only)"}
          subtitle={
            canManage
              ? "Phase 13.0 simulates the training run synchronously with a deterministic eval lift. Phase 13.1 wires a real fine-tune job + per-workspace data residency boundary."
              : `Your role (${membership.role}) cannot propose fine-tunes.`
          }
        >
          <form onSubmit={handlePropose} className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Label</span>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} disabled={!canManage || isPending} className="h-8 text-xs" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="uppercase tracking-widest text-[--text-muted]">Residency</span>
              <select
                value={residency}
                onChange={(e) => setResidency(e.target.value as "ca" | "us" | "eu")}
                disabled={!canManage || isPending}
                className="h-8 text-xs bg-[--elevated] border border-[--border-subtle] rounded-[--radius-md] px-1.5"
              >
                <option value="ca">Canada</option>
                <option value="us">United States</option>
                <option value="eu">European Union</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="uppercase tracking-widest text-[--text-muted]">Description</span>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={!canManage || isPending} className="min-h-[60px] text-xs" />
            </label>
            <fieldset className="flex flex-col gap-1 md:col-span-2">
              <legend className="uppercase tracking-widest text-[--text-muted]">Source artifacts</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {artifacts.filter((a) => a.canonical || a.reviewState === "approved").map((a) => {
                  const isSelected = selected.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={`flex items-center gap-2 rounded-[--radius-md] border px-2 py-1.5 cursor-pointer ${
                        isSelected ? "bg-[--accent-dim] border-[--border-active]" : "bg-[--elevated] border-[--border-subtle]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-[--accent-vivid]"
                        checked={isSelected}
                        onChange={() =>
                          setSelected((prev) =>
                            isSelected ? prev.filter((id) => id !== a.id) : [...prev, a.id],
                          )
                        }
                        disabled={!canManage || isPending}
                      />
                      <span className="text-xs text-[--text-primary] truncate">{a.name}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div className="md:col-span-2 flex items-center gap-2">
              <Button type="submit" size="sm" variant="primary" disabled={!canManage || isPending || !label.trim()}>
                {isPending ? "Training…" : "Propose fine-tune"}
              </Button>
              {error && <p className="text-xs text-[--danger]">{error}</p>}
            </div>
          </form>
        </DashboardCard>
      </div>
    </div>
  );
}
