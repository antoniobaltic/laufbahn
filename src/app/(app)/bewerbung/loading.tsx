import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-11 w-32 rounded-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-32 w-full rounded-[24px]" />
        <Skeleton className="h-32 w-full rounded-[24px]" />
        <Skeleton className="h-32 w-full rounded-[24px]" />
      </div>

      <div className="surface-panel rounded-[32px] p-4 sm:p-5">
        <Skeleton className="mb-4 h-4 w-72 max-w-full" />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <Skeleton className="h-72 w-full rounded-[28px]" />
          <Skeleton className="h-72 w-full rounded-[28px]" />
          <Skeleton className="h-72 w-full rounded-[28px]" />
        </div>
      </div>
    </div>
  );
}
