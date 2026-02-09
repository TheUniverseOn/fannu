import { CreatorHeaderSkeleton } from "@/components/public/creator-header";
import { DropCardGridSkeleton } from "@/components/public/drop-card";

/**
 * Loading skeleton for Creator Profile page
 * Shows cover, avatar, buttons, drops, and VIP form placeholders
 */
export default function CreatorPageLoading() {
  return (
    <div className="min-h-screen pb-8">
      {/* Header skeleton */}
      <CreatorHeaderSkeleton />

      <div className="mt-8 px-4 sm:px-6 space-y-10">
        {/* Action buttons skeleton */}
        <section className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="h-11 w-full sm:w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-11 w-full sm:w-32 animate-pulse rounded-md bg-muted" />
        </section>

        {/* Drops section skeleton */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-5 w-5 animate-pulse rounded bg-muted" />
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          </div>
          <DropCardGridSkeleton count={3} />
        </section>

        {/* VIP form skeleton */}
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
          </div>
        </section>
      </div>
    </div>
  );
}
