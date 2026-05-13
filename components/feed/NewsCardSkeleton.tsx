import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function NewsCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card">
      <div className="flex gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Meta row */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          {/* Title */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          {/* Summary */}
          <Skeleton className="hidden h-3 w-full sm:block" />
          <Skeleton className="hidden h-3 w-2/3 sm:block" />
          {/* Source */}
          <Skeleton className="h-3 w-24" />
        </div>
        {/* Thumbnail placeholder */}
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-md sm:h-24 sm:w-24 md:h-28 md:w-28" />
      </div>
    </Card>
  );
}

/** Renders N skeleton cards for the initial loading state. */
export function NewsFeedSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
