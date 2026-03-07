import { Skeleton } from "@/components/ui/skeleton";

export default function BoardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-12 w-52 rounded-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-[24px]" />
        ))}
      </div>

      <div className="surface-panel rounded-[32px] p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="hidden h-4 w-28 sm:block" />
        </div>

        <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-w-[280px] w-[280px] shrink-0">
            <Skeleton className="mb-0 h-1.5 rounded-t-[24px]" />
            <div className="surface-card rounded-b-[24px] border border-border/80 p-3 space-y-3">
              <Skeleton className="h-12 w-full rounded-[18px]" />
              <Skeleton className="h-32 w-full rounded-[20px]" />
              <Skeleton className="h-28 w-full rounded-[20px]" />
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
