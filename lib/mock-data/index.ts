// ============================================================
// APP CHASSIS — Mock / Demo Data
// ============================================================

export const kpiData = [
  {
    id: "kpi-1", label: "Active Sessions", value: "2,847",
    trend: "up" as const, trendValue: "+12.4%", trendLabel: "vs last week",
    status: "success" as const,
  },
  {
    id: "kpi-2", label: "Tasks Completed", value: "1,204",
    trend: "up" as const, trendValue: "+8.1%", trendLabel: "vs last week",
    status: "default" as const,
  },
  {
    id: "kpi-3", label: "Avg. Response Time", value: "1.2s",
    trend: "down" as const, trendValue: "-0.3s", trendLabel: "vs last week",
    status: "success" as const,
  },
  {
    id: "kpi-4", label: "Error Rate", value: "0.08%",
    trend: "down" as const, trendValue: "-0.02%", trendLabel: "vs last week",
    status: "warning" as const,
  },
];

export const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  value: Math.floor(40 + Math.random() * 60 + Math.sin(i / 3) * 20),
  secondary: Math.floor(20 + Math.random() * 40 + Math.cos(i / 4) * 10),
}));

export const barData = [
  { name: "Alpha",   value: 84, secondary: 62 },
  { name: "Beta",    value: 67, secondary: 51 },
  { name: "Gamma",   value: 92, secondary: 78 },
  { name: "Delta",   value: 45, secondary: 38 },
  { name: "Epsilon", value: 73, secondary: 61 },
  { name: "Zeta",    value: 88, secondary: 70 },
  { name: "Eta",     value: 56, secondary: 44 },
];

export const donutData = [
  { name: "Resolved",    value: 62, color: "var(--success)" },
  { name: "In Progress", value: 24, color: "var(--accent-bright)" },
  { name: "Pending",     value: 9,  color: "var(--warning)" },
  { name: "Blocked",     value: 5,  color: "var(--danger)" },
];

export const radarData = [
  { subject: "Coverage",    A: 88, B: 65 },
  { subject: "Accuracy",    A: 92, B: 78 },
  { subject: "Speed",       A: 74, B: 83 },
  { subject: "Reliability", A: 95, B: 71 },
  { subject: "Depth",       A: 67, B: 88 },
  { subject: "Reach",       A: 81, B: 60 },
];

export const feedItems = [
  {
    id: "f1", type: "success" as const, title: "Agent Alpha completed analysis",
    description: "Scenario comparison report generated — 14 items flagged",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), source: "Alpha",
  },
  {
    id: "f2", type: "info" as const, title: "New data ingested",
    description: "3,421 records processed from upstream pipeline",
    timestamp: new Date(Date.now() - 8 * 60 * 1000), source: "Pipeline",
  },
  {
    id: "f3", type: "warning" as const, title: "Agent Beta rate limited",
    description: "Throttled at external API — resuming in 42s",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), source: "Beta",
  },
  {
    id: "f4", type: "success" as const, title: "Deployment verified",
    description: "All health checks passing across 6 regions",
    timestamp: new Date(Date.now() - 28 * 60 * 1000), source: "Ops",
  },
  {
    id: "f5", type: "info" as const, title: "Scheduled scan complete",
    description: "Coverage report updated — 94.2% baseline maintained",
    timestamp: new Date(Date.now() - 45 * 60 * 1000), source: "Scanner",
  },
  {
    id: "f6", type: "info" as const, title: "Model context refreshed",
    description: "Knowledge sync complete — 1,847 documents updated",
    timestamp: new Date(Date.now() - 62 * 60 * 1000), source: "Sync",
  },
];

export const tableData = Array.from({ length: 20 }, (_, i) => ({
  id: `item-${String(i + 1).padStart(3, "0")}`,
  name: [
    "Athena Query", "Prometheus Alert", "Neptune Scan", "Hermes Pipeline",
    "Apollo Report", "Artemis Monitor", "Helios Index", "Selene Audit",
  ][i % 8] + ` #${i + 1}`,
  status: (["active", "pending", "complete", "blocked"] as const)[Math.floor(Math.random() * 4)],
  priority: (["high", "medium", "low"] as const)[Math.floor(Math.random() * 3)],
  assignee: ["A. Nova", "B. Flux", "C. Vega", "D. Lyra"][i % 4],
  updated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  score: Math.floor(40 + Math.random() * 60),
}));

export const agentData = [
  {
    id: "agent-alpha", name: "Alpha", role: "commander" as const,
    state: "active" as const, model: "claude-opus-4-6",
    taskCount: 3, lastUpdated: new Date(Date.now() - 12000),
  },
  {
    id: "agent-beta", name: "Beta", role: "analyst" as const,
    state: "thinking" as const, model: "claude-sonnet-4-6",
    taskCount: 7, lastUpdated: new Date(Date.now() - 4000),
  },
  {
    id: "agent-gamma", name: "Gamma", role: "critic" as const,
    state: "idle" as const, model: "claude-haiku-4-5",
    taskCount: 0, lastUpdated: new Date(Date.now() - 180000),
  },
  {
    id: "agent-delta", name: "Delta", role: "worker" as const,
    state: "complete" as const, model: "claude-sonnet-4-6",
    taskCount: 12, lastUpdated: new Date(Date.now() - 95000),
  },
];

export const chatMessages = [
  {
    id: "m1", role: "user" as const, content: "Analyze the current session data and flag anomalies.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "m2", role: "assistant" as const, agentId: "agent-alpha",
    content: "Running analysis across 2,847 active sessions. I've identified 3 clusters showing unusual latency patterns in the EU-West region. Flagging for review.",
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
  },
  {
    id: "m3", role: "user" as const, content: "What's the severity distribution?",
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
  },
  {
    id: "m4", role: "assistant" as const, agentId: "agent-alpha",
    content: "Of the 14 flagged items: 2 high severity (immediate attention), 7 medium (monitor), 5 low (informational). The high-severity items relate to timeout spikes at 03:14 UTC.",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
];

export const summaryContent = {
  title: "Situation Overview",
  updated: new Date(Date.now() - 3 * 60 * 1000),
  content: `System operating within normal parameters. EU-West latency spike detected at 03:14 UTC — root cause investigation underway. Agent Alpha has flagged 14 items for review, 2 of which require immediate attention.

Pipeline throughput is 8.1% above baseline. Error rate at 0.08% — within acceptable threshold. All scheduled tasks completed on time.`,
  tags: ["Ops", "Q1", "Active"],
};
