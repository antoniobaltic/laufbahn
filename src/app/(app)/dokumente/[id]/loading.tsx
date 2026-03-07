export default function DocumentDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-32 rounded-full bg-dark-50 skeleton-sheen" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <div className="h-52 rounded-[30px] bg-dark-50 skeleton-sheen" />
        <div className="h-52 rounded-[30px] bg-dark-50 skeleton-sheen" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <div className="h-[58rem] rounded-[30px] bg-dark-50 skeleton-sheen" />
        <div className="space-y-6">
          <div className="h-80 rounded-[28px] bg-dark-50 skeleton-sheen" />
          <div className="h-72 rounded-[28px] bg-dark-50 skeleton-sheen" />
          <div className="h-72 rounded-[28px] bg-dark-50 skeleton-sheen" />
        </div>
      </div>
    </div>
  );
}
