import { Skeleton } from "@/components/shared/loading-skeleton";

export default function DropPageLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero skeleton */}
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="px-4 pt-8 pb-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Details skeleton */}
      <div className="px-4 py-6 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* CTA skeleton */}
      <div className="px-4 py-6">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* VIP Form skeleton */}
      <div className="px-4 py-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}
