"use client";
import React, { useState } from "react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/cn";

const sections = [
  { id: "general",      label: "General" },
  { id: "appearance",   label: "Appearance" },
  { id: "agents",       label: "Agents" },
  { id: "api",          label: "API & Keys" },
  { id: "notifications",label: "Notifications" },
  { id: "team",         label: "Team" },
  { id: "danger",       label: "Danger Zone" },
];

function SettingsRow({
  label, description, children,
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="space-y-0.5 flex-1 min-w-0">
        <p className="text-sm text-[--text-primary]">{label}</p>
        {description && <p className="text-xs text-[--text-muted]">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[--text-muted] mb-3">{title}</h3>
      <div className="rounded-[--radius-lg] border border-[--border-subtle] bg-[--panel-bg] overflow-hidden divide-y divide-[--border-subtle] px-4">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [notifications, setNotifications] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [agentLogs, setAgentLogs] = useState(true);
  const [autoLayout, setAutoLayout] = useState(true);
  const [model, setModel] = useState("claude-sonnet-4-6");

  return (
    <div className="flex h-full">
      {/* Settings sidebar */}
      <div className="w-48 shrink-0 border-r border-[--border-subtle] bg-[--chrome-bg] p-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-[--text-muted] px-2 mb-2 mt-1">Settings</p>
        <nav className="flex flex-col gap-0.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "text-left px-2 py-1.5 rounded-[--radius-md] text-sm transition-colors",
                activeSection === section.id
                  ? "bg-[--elevated] text-[--text-primary] font-medium"
                  : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--elevated]",
                section.id === "danger" && "text-[--danger] hover:text-[--danger] hover:bg-[--danger-dim]"
              )}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings content */}
      <ScrollArea className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-8">
          {activeSection === "general" && (
            <>
              <div>
                <h2 className="text-base font-semibold text-[--text-primary]">General</h2>
                <p className="text-xs text-[--text-muted] mt-0.5">Application-wide preferences</p>
              </div>
              <Section title="Workspace">
                <SettingsRow label="Compact mode" description="Reduce spacing in workspace cards">
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </SettingsRow>
                <SettingsRow label="Auto-save layouts" description="Persist card positions automatically">
                  <Switch checked={autoLayout} onCheckedChange={setAutoLayout} />
                </SettingsRow>
                <SettingsRow label="Default workspace" description="Opening route after login">
                  <Select defaultValue="/dashboard">
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="/dashboard">Dashboard</SelectItem>
                      <SelectItem value="/workspace">Workspace</SelectItem>
                      <SelectItem value="/agents">Agents</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>
              </Section>

              <Section title="Identity">
                <SettingsRow label="Display name">
                  <Input defaultValue="Operator" className="w-48" />
                </SettingsRow>
                <SettingsRow label="Team workspace">
                  <Input defaultValue="Alpha Team" className="w-48" />
                </SettingsRow>
              </Section>
            </>
          )}

          {activeSection === "agents" && (
            <>
              <div>
                <h2 className="text-base font-semibold text-[--text-primary]">Agent Configuration</h2>
                <p className="text-xs text-[--text-muted] mt-0.5">Control agent behavior and defaults</p>
              </div>
              <Section title="Default Model">
                <SettingsRow label="Primary model" description="Used by default for new agent cards">
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-opus-4-6">claude-opus-4-6</SelectItem>
                      <SelectItem value="claude-sonnet-4-6">claude-sonnet-4-6</SelectItem>
                      <SelectItem value="claude-haiku-4-5">claude-haiku-4-5</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>
                <SettingsRow label="Enable agent logs" description="Persist agent reasoning traces">
                  <Switch checked={agentLogs} onCheckedChange={setAgentLogs} />
                </SettingsRow>
              </Section>

              <Section title="Agent Cards">
                <SettingsRow label="Max concurrent agents" description="Per workspace session">
                  <Select defaultValue="4">
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,4,8,16].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </SettingsRow>
              </Section>
            </>
          )}

          {activeSection === "api" && (
            <>
              <div>
                <h2 className="text-base font-semibold text-[--text-primary]">API & Keys</h2>
                <p className="text-xs text-[--text-muted] mt-0.5">Manage API access and credentials</p>
              </div>
              <Section title="API Keys">
                {[
                  { label: "Anthropic API Key", value: "sk-ant-••••••••••••••••••••••••", status: "active" },
                  { label: "Data Pipeline Key",  value: "dp-••••••••••••••••••••••••",   status: "active" },
                  { label: "Webhook Secret",     value: "whsec-••••••••••••••",           status: "active" },
                ].map(({ label, value, status }) => (
                  <SettingsRow key={label} label={label}>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] text-[--text-muted] font-mono">{value}</code>
                      <Badge variant="success" className="text-[9px]">{status}</Badge>
                      <Button variant="ghost" size="xs">Rotate</Button>
                    </div>
                  </SettingsRow>
                ))}
              </Section>
            </>
          )}

          {activeSection === "notifications" && (
            <>
              <div>
                <h2 className="text-base font-semibold text-[--text-primary]">Notifications</h2>
              </div>
              <Section title="In-App">
                <SettingsRow label="Enable notifications" description="Show system and agent notifications">
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </SettingsRow>
                <SettingsRow label="Agent state changes" description="Notify on active/complete/blocked">
                  <Switch defaultChecked />
                </SettingsRow>
                <SettingsRow label="Pipeline alerts" description="Errors and threshold breaches">
                  <Switch defaultChecked />
                </SettingsRow>
              </Section>
            </>
          )}

          {activeSection === "danger" && (
            <>
              <div>
                <h2 className="text-base font-semibold text-[--danger]">Danger Zone</h2>
                <p className="text-xs text-[--text-muted] mt-0.5">Irreversible actions — proceed carefully</p>
              </div>
              <div className="rounded-[--radius-lg] border border-[--danger] bg-[--danger-dim] p-4 space-y-4">
                {[
                  { label: "Reset all layouts", description: "Remove all saved workspace card positions", action: "Reset Layouts" },
                  { label: "Clear agent history", description: "Delete all conversation history", action: "Clear History" },
                  { label: "Delete workspace", description: "Permanently delete this workspace and all data", action: "Delete Workspace" },
                ].map(({ label, description, action }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[--text-primary]">{label}</p>
                      <p className="text-xs text-[--text-muted]">{description}</p>
                    </div>
                    <Button variant="destructive" size="sm">{action}</Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
