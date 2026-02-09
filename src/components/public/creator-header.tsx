"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/shared/loading-skeleton";

interface CreatorHeaderProps {
  coverUrl?: string | null;
  avatarUrl?: string | null;
  displayName: string;
  bio?: string | null;
  className?: string;
}

/**
 * Creator profile header with cover image, avatar, name, and bio
 * FanNu dark theme with gradient avatar border
 */
export function CreatorHeader({
  coverUrl,
  avatarUrl,
  displayName,
  bio,
  className,
}: CreatorHeaderProps) {
  const defaultCover = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop";
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=160&background=7C3AED&color=fff`;

  return (
    <div className={cn("relative", className)}>
      {/* Cover Image */}
      <div className="relative h-44 w-full overflow-hidden sm:h-52 md:h-60">
        <Image
          src={coverUrl || defaultCover}
          alt={`${displayName} cover`}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay - darker for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-background" />
      </div>

      {/* Avatar and Profile Info */}
      <div className="relative px-6">
        {/* Avatar - overlapping the cover with gradient border */}
        <div className="-mt-16 mb-4 flex justify-center sm:-mt-20 sm:justify-start">
          <div className="relative h-32 w-32 rounded-full bg-gradient-primary p-1 shadow-glow-purple sm:h-36 sm:w-36">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-card">
              <Image
                src={avatarUrl || defaultAvatar}
                alt={displayName}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Name and Bio */}
        <div className="text-center sm:text-left">
          <h1 className="font-display text-[26px] font-bold text-foreground sm:text-[32px]">
            {displayName}
          </h1>
          {bio && (
            <p className="mt-3 text-body text-muted-foreground leading-relaxed max-w-xl">
              {bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for CreatorHeader
 */
export function CreatorHeaderSkeleton() {
  return (
    <div className="relative">
      {/* Cover skeleton */}
      <Skeleton className="h-44 w-full sm:h-52 md:h-60 rounded-none" />

      {/* Avatar and info skeleton */}
      <div className="relative px-6">
        <div className="-mt-16 mb-4 flex justify-center sm:-mt-20 sm:justify-start">
          <Skeleton className="h-32 w-32 rounded-full sm:h-36 sm:w-36" />
        </div>
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-3/4 max-w-sm" />
        </div>
      </div>
    </div>
  );
}
