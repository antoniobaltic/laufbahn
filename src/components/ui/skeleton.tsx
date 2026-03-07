import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-sheen rounded-[18px]", className)}
      {...props}
    />
  );
}

export { Skeleton };
