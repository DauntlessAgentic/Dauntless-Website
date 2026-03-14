// ============================================================
// APP CHASSIS — Shared Types
// ============================================================

export type AgentState =
  | "idle"
  | "active"
  | "thinking"
  | "blocked"
  | "complete"
  | "updated";

export type CardType =
  | "kpi"
  | "chart-line"
  | "chart-bar"
  | "chart-area"
  | "chart-donut"
  | "radar"
  | "table"
  | "feed"
  | "summary"
  | "agent-chat"
  | "agent-task"
  | "agent-output"
  | "inspector"
  | "timeline"
  | "metric"
  | "sparkline"
  | "alert"
  | "custom";

export interface CardConfig {
  id: string;
  type: CardType;
  title: string;
  subtitle?: string;
  agentId?: string;
  agentState?: AgentState;
  metadata?: Record<string, unknown>;
  gridProps: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

export interface AgentConfig {
  id: string;
  name: string;
  role: "commander" | "worker" | "critic" | "analyst" | "assistant";
  state: AgentState;
  model?: string;
  lastUpdated?: Date;
  taskCount?: number;
}

export interface MetricValue {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  status?: "default" | "success" | "warning" | "danger" | "info";
}

export interface FeedItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type?: "info" | "success" | "warning" | "danger" | "update";
  source?: string;
  agentId?: string;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export type WorkspaceLayout = Array<{
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}>;

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}
