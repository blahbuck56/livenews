export function CardSkeleton() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 animate-pulse">
      <div className="h-3 bg-[#E5E7EB] rounded w-24 mb-3" />
      <div className="h-4 bg-[#E5E7EB] rounded w-full mb-2" />
      <div className="h-4 bg-[#E5E7EB] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[#E5E7EB] rounded w-full mb-1" />
      <div className="h-3 bg-[#E5E7EB] rounded w-2/3" />
    </div>
  );
}

export function FeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 animate-pulse">
      <div className="h-4 bg-[#E5E7EB] rounded w-40 mb-4" />
      <div className="h-48 bg-[#F3F4F6] rounded" />
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-4 animate-pulse">
      <div className="h-3 bg-[#E5E7EB] rounded w-24 mb-3" />
      <div className="h-8 bg-[#E5E7EB] rounded w-20" />
    </div>
  );
}
