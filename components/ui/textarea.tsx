import * as React from "react";
import { cn } from "@/lib/cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full min-h-[80px] px-3 py-2 rounded-[--radius-md]",
      "bg-[--elevated] border border-[--border-default]",
      "text-sm text-[--text-primary] placeholder:text-[--text-muted]",
      "resize-y transition-colors duration-[--duration-fast]",
      "hover:border-[--border-strong]",
      "focus:outline-none focus:border-[--border-active] focus:bg-[--elevated-2]",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
