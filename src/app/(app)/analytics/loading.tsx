function LoadingCard() {
  return <div className="skeleton-sheen h-32 rounded-[26px]" aria-hidden="true" />;
}

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton-sheen h-44 rounded-[34px]" aria-hidden="true" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="skeleton-sheen h-[26rem] rounded-[30px]" aria-hidden="true" />
        <div className="skeleton-sheen h-[26rem] rounded-[30px]" aria-hidden="true" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
        <div className="skeleton-sheen h-[28rem] rounded-[30px]" aria-hidden="true" />
        <div className="grid gap-6">
          <div className="skeleton-sheen h-[16rem] rounded-[30px]" aria-hidden="true" />
          <div className="skeleton-sheen h-[16rem] rounded-[30px]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
