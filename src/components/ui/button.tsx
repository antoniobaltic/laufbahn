"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-orange text-white shadow-card hover:bg-orange-500 hover:shadow-card-hover active:bg-orange-600",
  secondary:
    "border border-border bg-white/88 text-dark shadow-card hover:border-dark-200 hover:bg-white hover:shadow-card-hover active:bg-dark-50",
  ghost:
    "bg-transparent text-dark-500 hover:bg-white/75 hover:text-dark active:bg-dark-50",
  danger:
    "border border-orange-200 bg-orange-50/70 text-orange-600 hover:bg-orange-100 active:bg-orange-200/70",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs gap-1.5",
  md: "px-4.5 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-heading font-medium tracking-[-0.01em]",
          "transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
          "active:translate-y-[1px] cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
