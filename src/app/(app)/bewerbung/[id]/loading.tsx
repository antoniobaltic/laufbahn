import { Skeleton } from "@/components/ui/skeleton";

function OverviewPillSkeleton() {
  return <Skeleton className="h-[76px] rounded-[22px]" />;
}

export default function ApplicationDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.14fr)_360px]">
        <div className="surface-card rounded-[30px] p-5 sm:p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-[52px] w-[52px] rounded-[18px]" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-10 w-64 max-w-full" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-10 w-44 rounded-full" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <OverviewPillSkeleton />
              <OverviewPillSkeleton />
              <OverviewPillSkeleton />
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[28px] p-5">
          <Skeleton className="h-5 w-36" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-[18px]" />
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="space-y-6">
          <Skeleton className="h-[320px] rounded-[28px]" />
          <Skeleton className="h-[160px] rounded-[28px]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[390px] rounded-[28px]" />
          <Skeleton className="h-[220px] rounded-[28px]" />
          <Skeleton className="h-[180px] rounded-[28px]" />
          <Skeleton className="h-[220px] rounded-[28px]" />
          <Skeleton className="h-[220px] rounded-[28px]" />
        </div>
      </div>
    </div>
  );
}
