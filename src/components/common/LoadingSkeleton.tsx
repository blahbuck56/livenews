export function ShimmerBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-[4px] ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShimmerBlock className="h-3 w-20" />
        <ShimmerBlock className="h-3 w-12" />
      </div>
      <ShimmerBlock className="h-[18px] w-full mb-2" />
      <ShimmerBlock className="h-[18px] w-3/4 mb-3" />
      <ShimmerBlock className="h-3 w-full mb-1" />
      <ShimmerBlock className="h-3 w-2/3" />
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
    <div className="card p-4">
      <ShimmerBlock className="h-3 w-36 mb-4" />
      <ShimmerBlock className="h-52 w-full" />
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="card p-4">
      <ShimmerBlock className="h-3 w-24 mb-3" />
      <ShimmerBlock className="h-9 w-20 mb-2" />
      <ShimmerBlock className="h-2 w-16" />
    </div>
  );
}

export function TweetSkeleton() {
  return <ShimmerBlock className="h-[300px] w-full rounded-[6px]" />;
}
