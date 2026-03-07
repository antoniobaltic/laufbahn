import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "orange" | "blue" | "green" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-light-gray/85 text-dark-600 border border-border/80",
  orange: "bg-orange-50 text-orange-600 border border-orange-200/70",
  blue: "bg-blue-50 text-blue-600 border border-blue-200/70",
  green: "bg-green-50 text-green-600 border border-green-200/70",
  muted: "bg-dark-50 text-muted-foreground border border-border/70",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-heading font-medium tracking-[0.01em]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeProps };
