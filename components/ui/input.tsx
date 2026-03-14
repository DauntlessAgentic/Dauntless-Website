import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--text-muted] pointer-events-none">
            {icon}
          </span>
          <input
            ref={ref}
            className={cn(
              "h-8 w-full pl-8 pr-3 rounded-[--radius-md]",
              "bg-[--elevated] border border-[--border-default]",
              "text-sm text-[--text-primary] placeholder:text-[--text-muted]",
              "transition-colors duration-[--duration-fast]",
              "hover:border-[--border-strong]",
              "focus:outline-none focus:border-[--border-active] focus:bg-[--elevated-2]",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
        </div>
      );
    }
    return (
      <input
        ref={ref}
        className={cn(
          "h-8 w-full px-3 rounded-[--radius-md]",
          "bg-[--elevated] border border-[--border-default]",
          "text-sm text-[--text-primary] placeholder:text-[--text-muted]",
          "transition-colors duration-[--duration-fast]",
          "hover:border-[--border-strong]",
          "focus:outline-none focus:border-[--border-active] focus:bg-[--elevated-2]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
