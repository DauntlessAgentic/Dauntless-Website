"use client";
import React, { useState } from "react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { Check, ChevronRight, Upload, Cpu } from "lucide-react";

const steps = ["Details", "Configuration", "Review & Submit"];

function FormGroup({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-[--danger]")}>
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-[--text-muted]">{hint}</p>}
    </div>
  );
}

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [assignToAgent, setAssignToAgent] = useState(true);
  const [priority, setPriority] = useState("medium");

  const progress = ((step + 1) / steps.length) * 100;

  if (submitted) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[--success-dim] border border-[--success]">
          <Check className="h-6 w-6 text-[--success]" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-semibold text-[--text-primary]">Submitted successfully</h2>
          <p className="text-sm text-[--text-muted]">Item queued for processing · ID: ITEM-{Math.floor(Math.random() * 9000 + 1000)}</p>
        </div>
        <Button variant="accent" onClick={() => { setStep(0); setSubmitted(false); }}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Workflow"
        title="New Item Intake"
        description="Submit a new work item or task for processing"
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Stepper sidebar */}
        <div className="w-56 shrink-0 border-r border-[--border-subtle] bg-[--chrome-bg] p-4">
          <div className="space-y-1">
            {steps.map((s, i) => (
              <div key={s} className={cn(
                "flex items-center gap-2.5 py-2 px-2 rounded-[--radius-md] cursor-pointer transition-colors",
                i === step && "bg-[--elevated] text-[--text-primary]",
                i < step && "text-[--text-secondary]",
                i > step && "text-[--text-muted] cursor-not-allowed"
              )}>
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  i < step  ? "bg-[--success] text-white" :
                  i === step? "bg-[--accent] text-white border border-[--border-focus]" :
                              "bg-[--elevated-2] text-[--text-muted] border border-[--border-default]"
                )}>
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className="text-sm">{s}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-1.5">
            <div className="flex justify-between text-[10px] text-[--text-muted]">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} color="accent" />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <div className="max-w-xl space-y-6">
            {step === 0 && (
              <>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-[--text-primary]">Item Details</h2>
                  <p className="text-xs text-[--text-muted]">Provide the core information for this work item</p>
                </div>
                <div className="space-y-4">
                  <FormGroup label="Title" required>
                    <Input placeholder="Brief, descriptive title" />
                  </FormGroup>
                  <FormGroup label="Description" hint="What needs to be done and why">
                    <Textarea placeholder="Describe the work item in detail…" className="min-h-[100px]" />
                  </FormGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Priority">
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormGroup>
                    <FormGroup label="Category">
                      <Select defaultValue="analysis">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analysis">Analysis</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="triage">Triage</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormGroup>
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-[--text-primary]">Configuration</h2>
                  <p className="text-xs text-[--text-muted]">Set processing options and assignments</p>
                </div>
                <div className="space-y-4">
                  <FormGroup label="Assign to Agent" hint="Route this item to an AI agent for processing">
                    <div className="flex items-center gap-3">
                      <Switch checked={assignToAgent} onCheckedChange={setAssignToAgent} />
                      <span className="text-xs text-[--text-secondary]">
                        {assignToAgent ? "Agent will process this item" : "Manual processing"}
                      </span>
                    </div>
                  </FormGroup>

                  {assignToAgent && (
                    <FormGroup label="Agent Model" hint="Select the model for processing">
                      <Select defaultValue="claude-sonnet-4-6">
                        <SelectTrigger>
                          <Cpu className="h-3 w-3 mr-1.5 text-[--accent-vivid]" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude-opus-4-6">claude-opus-4-6 (highest capability)</SelectItem>
                          <SelectItem value="claude-sonnet-4-6">claude-sonnet-4-6 (balanced)</SelectItem>
                          <SelectItem value="claude-haiku-4-5">claude-haiku-4-5 (fastest)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormGroup>
                  )}

                  <FormGroup label="Assignee">
                    <Select defaultValue="none">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        <SelectItem value="a-nova">A. Nova</SelectItem>
                        <SelectItem value="b-flux">B. Flux</SelectItem>
                        <SelectItem value="c-vega">C. Vega</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormGroup>

                  <FormGroup label="Due date">
                    <Input type="date" />
                  </FormGroup>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-[--text-primary]">Review & Submit</h2>
                  <p className="text-xs text-[--text-muted]">Verify details before submission</p>
                </div>
                <div className="rounded-[--radius-lg] border border-[--border-default] bg-[--panel-bg] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[--border-subtle]">
                    <p className="text-xs font-semibold text-[--text-primary]">Item Summary</p>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    {[
                      { label: "Priority",   value: <Badge variant={priority === "high" || priority === "critical" ? "danger" : priority === "medium" ? "warning" : "default"}>{priority}</Badge> },
                      { label: "Agent",      value: assignToAgent ? <Badge variant="accent">claude-sonnet-4-6</Badge> : <span className="text-[--text-muted] text-xs">Manual</span> },
                      { label: "Category",   value: <span className="text-xs text-[--text-secondary]">Analysis</span> },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-[--text-muted]">{label}</span>
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost" size="sm"
                disabled={step === 0}
                onClick={() => setStep(s => s - 1)}
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button variant="primary" size="sm" onClick={() => setStep(s => s + 1)}>
                  Continue
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => setSubmitted(true)}>
                  Submit Item
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
