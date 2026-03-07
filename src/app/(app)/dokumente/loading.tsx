export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-3">
        <div className="h-3 w-24 rounded-full bg-dark-50 skeleton-sheen" />
        <div className="h-10 w-96 max-w-full rounded-full bg-dark-50 skeleton-sheen" />
        <div className="h-5 w-[34rem] max-w-full rounded-full bg-dark-50 skeleton-sheen" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 rounded-[28px] bg-dark-50 skeleton-sheen"
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-64 rounded-[28px] bg-dark-50 skeleton-sheen"
          />
        ))}
      </div>
    </div>
  );
}
