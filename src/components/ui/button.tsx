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
    "bg-[linear-gradient(180deg,#dd8769_0%,#d97757_58%,#c45f3e_100%)] text-white shadow-[0_14px_28px_rgba(217,119,87,0.28)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(217,119,87,0.34)] active:bg-orange-600",
  secondary:
    "border border-[rgba(228,210,191,0.82)] bg-white/90 text-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(20,20,19,0.05)] hover:-translate-y-0.5 hover:border-dark-200 hover:bg-white active:bg-dark-50",
  ghost:
    "bg-transparent text-dark-500 hover:bg-white/78 hover:text-dark active:bg-dark-50",
  danger:
    "border border-orange-200/80 bg-orange-50/82 text-orange-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)] hover:-translate-y-0.5 hover:bg-orange-100 active:bg-orange-200/70",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs gap-1.5",
  md: "px-4.5 py-2.5 text-sm gap-2",
  lg: "px-6 py-3.5 text-base gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-heading font-medium tracking-[-0.01em]",
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
