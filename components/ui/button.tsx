import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5",
    "font-medium text-sm leading-none",
    "rounded-[--radius-md] border",
    "transition-all duration-[--duration-fast]",
    "disabled:opacity-40 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-bright] focus-visible:ring-offset-1 focus-visible:ring-offset-[--app-bg]",
    "cursor-pointer select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[--accent] text-white border-[--border-active]",
          "hover:bg-[--accent-bright] hover:border-[--border-focus]",
          "active:scale-[0.98]",
          "shadow-sm",
        ].join(" "),
        secondary: [
          "bg-[--elevated] text-[--text-primary] border-[--border-default]",
          "hover:bg-[--elevated-2] hover:border-[--border-strong]",
          "active:scale-[0.98]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[--text-secondary] border-transparent",
          "hover:bg-[--elevated] hover:text-[--text-primary] hover:border-[--border-subtle]",
          "active:scale-[0.98]",
        ].join(" "),
        destructive: [
          "bg-[--danger-dim] text-[--danger] border-[--danger]",
          "hover:bg-[--danger] hover:text-white",
          "active:scale-[0.98]",
        ].join(" "),
        outline: [
          "bg-transparent text-[--text-primary] border-[--border-default]",
          "hover:bg-[--elevated] hover:border-[--border-strong]",
          "active:scale-[0.98]",
        ].join(" "),
        accent: [
          "bg-[--accent-dim] text-[--accent-vivid] border-[--border-active]",
          "hover:bg-[--accent] hover:text-white",
          "active:scale-[0.98]",
        ].join(" "),
      },
      size: {
        xs: "h-6 px-2 text-xs gap-1",
        sm: "h-7 px-3 text-xs",
        md: "h-8 px-4 text-sm",
        lg: "h-10 px-5 text-sm",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
