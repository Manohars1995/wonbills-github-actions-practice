const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200/80 rounded-lg ${className}`} />
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-3 w-full h-full">

      {/* ===================== TOP SUMMARY CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            className="flex h-24 items-center gap-4 p-5 rounded-2xl border-2 border-gray-200 shadow-xs"
          >
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* ===================== CHARTS ROW ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[300px]">

        {/* Requested vs Received */}
        <div className="p-3 rounded-2xl border-2 border-gray-200 shadow-xs flex flex-col gap-4">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="flex-1 w-full rounded-xl" />
        </div>

        {/* Status Distribution */}
        <div className="p-3 rounded-2xl border-2 border-gray-200 shadow-xs flex flex-col gap-4">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="flex-1 w-full rounded-full" />
        </div>
      </div>

      {/* ===================== BOTTOM CHARTS ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-[350px]">

        {/* Items by Category */}
        <div className="p-3 rounded-2xl border-2 border-gray-200 shadow-xs flex flex-col gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="flex-1 w-full rounded-full" />
        </div>

        {/* Items Added vs Modified */}
        <div className="p-3 rounded-2xl border-2 border-gray-200 shadow-xs flex flex-col gap-4">
          <Skeleton className="h-5 w-60" />
          <Skeleton className="flex-1 w-full rounded-xl" />
        </div>
      </div>

    </div>
  );
};

export default DashboardSkeleton;
