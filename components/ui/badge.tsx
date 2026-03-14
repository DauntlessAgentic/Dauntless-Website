import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[--radius-sm] px-1.5 py-0.5 text-xs font-medium border leading-none",
  {
    variants: {
      variant: {
        default:  "bg-[--elevated-2] text-[--text-secondary] border-[--border-default]",
        accent:   "bg-[--accent-dim] text-[--accent-vivid] border-[--border-active]",
        info:     "bg-[--info-dim] text-[--info] border-[color:rgba(34,211,238,0.3)]",
        success:  "bg-[--success-dim] text-[--success] border-[color:rgba(34,197,94,0.3)]",
        warning:  "bg-[--warning-dim] text-[--warning] border-[color:rgba(245,158,11,0.3)]",
        danger:   "bg-[--danger-dim] text-[--danger] border-[color:rgba(239,68,68,0.3)]",
        outline:  "bg-transparent text-[--text-muted] border-[--border-default]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
