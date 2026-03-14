import * as React from "react";
import { cn } from "@/lib/cn";
import { Tooltip } from "./tooltip";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  size?: "xs" | "sm" | "md";
  variant?: "ghost" | "outline" | "accent";
}

export function IconButton({
  icon,
  label,
  size = "sm",
  variant = "ghost",
  className,
  ...props
}: IconButtonProps) {
  const sizeClasses = { xs: "h-5 w-5", sm: "h-7 w-7", md: "h-8 w-8" };
  const variantClasses = {
    ghost: "text-[--text-muted] hover:text-[--text-primary] hover:bg-[--elevated] border-transparent",
    outline: "text-[--text-secondary] hover:text-[--text-primary] bg-[--elevated] border-[--border-default] hover:border-[--border-strong]",
    accent: "text-[--accent-vivid] hover:text-white bg-[--accent-dim] hover:bg-[--accent] border-[--border-active]",
  };

  const btn = (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[--radius-md] border",
        "transition-all duration-[--duration-fast] cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-bright]",
        "disabled:opacity-40 disabled:pointer-events-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );

  if (label) {
    return <Tooltip content={label}>{btn}</Tooltip>;
  }
  return btn;
}
