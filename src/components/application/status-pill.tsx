import { cn } from "@/lib/utils/cn";
import { getStatusColors, getStatusLabel } from "@/lib/utils/applications";
import type { ApplicationStatus } from "@/lib/utils/constants";

interface StatusPillProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const colors = getStatusColors(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-heading font-medium",
        className
      )}
      style={colors}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: colors.color }}
      />
      {getStatusLabel(status)}
    </span>
  );
}
