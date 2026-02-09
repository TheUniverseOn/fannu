"use client";

import { Skeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";

interface AudienceTableSkeletonProps {
  rows?: number;
  className?: string;
}

export function AudienceTableSkeleton({
  rows = 5,
  className,
}: AudienceTableSkeletonProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b text-left text-sm font-medium text-muted-foreground">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Phone</th>
            <th className="pb-3 pr-4">Channel</th>
            <th className="pb-3 pr-4">Source</th>
            <th className="pb-3 pr-4">Joined</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="text-sm">
              <td className="py-4 pr-4">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="py-4 pr-4">
                <Skeleton className="h-4 w-28" />
              </td>
              <td className="py-4 pr-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </td>
              <td className="py-4 pr-4">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="py-4 pr-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="py-4">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
