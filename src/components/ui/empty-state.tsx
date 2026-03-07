import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-14 text-center sm:px-6 sm:py-16",
        className
      )}
    >
      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-border/80 bg-white text-mid-gray shadow-card">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-heading font-semibold text-dark">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground font-body leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export { EmptyState };
