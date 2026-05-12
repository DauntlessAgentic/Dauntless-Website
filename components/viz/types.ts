// Shared chart types — narrow shape of the payload recharts passes to a custom
// Tooltip content component. We keep this local instead of pulling the full
// recharts generic types in every chart file.

export interface ChartTooltipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  color?: string;
  stroke?: string;
  fill?: string;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string | number;
}
