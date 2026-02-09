"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Drop, Creator } from "@/types";

interface DropHeroProps {
  drop: Drop;
  creator: Creator;
  className?: string;
}

/**
 * Get time until end for live drops
 */
function getEndsInText(endsAt: string): string {
  const now = new Date();
  const ends = new Date(endsAt);
  const diffMs = ends.getTime() - now.getTime();

  if (diffMs <= 0) return "Ending soon";

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `Ends in ${diffDay} day${diffDay > 1 ? "s" : ""}`;
  }
  if (diffHour > 0) {
    return `Ends in ${diffHour} hour${diffHour > 1 ? "s" : ""}`;
  }
  if (diffMin > 0) {
    return `Ends in ${diffMin} min`;
  }
  return "Ends in < 1 min";
}

/**
 * Format scheduled date
 */
function formatScheduledDate(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Drop Hero Section Component - FanNu Design
 */
export function DropHero({ drop, creator, className }: DropHeroProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Cover Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-fannu-purple/20 via-fannu-pink/10 to-fannu-blue/20">
        {drop.cover_image_url ? (
          <Image
            src={drop.cover_image_url}
            alt={drop.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-accent opacity-30">
            <div className="text-6xl">
              {drop.type === "EVENT" && "🎪"}
              {drop.type === "MERCH" && "👕"}
              {drop.type === "CONTENT" && "🎬"}
              {drop.type === "CUSTOM" && "✨"}
            </div>
          </div>
        )}
      </div>

      {/* Creator Row */}
      <div className="flex items-center gap-3 px-6 py-4">
        <Link href={`/c/${creator.slug}`} className="shrink-0">
          <div className="relative h-11 w-11 overflow-hidden rounded-full bg-gradient-primary">
            {creator.avatar_url ? (
              <Image
                src={creator.avatar_url}
                alt={creator.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {creator.display_name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </Link>
        <div className="flex flex-col">
          <Link
            href={`/c/${creator.slug}`}
            className="text-body font-semibold text-foreground hover:text-primary transition-colors"
          >
            {creator.display_name}
          </Link>
          <Link
            href={`/c/${creator.slug}`}
            className="text-subhead text-primary hover:underline"
          >
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Drop Header Section - Title, Description, Price, Schedule
 */
interface DropHeaderProps {
  drop: Drop;
}

export function DropHeader({ drop }: DropHeaderProps) {
  const isSoldOut = drop.total_slots !== null && drop.slots_remaining === 0;
  const hasSlots = drop.total_slots !== null;
  const slotsRemaining = drop.slots_remaining ?? 0;
  const isFree = drop.price === 0;

  return (
    <div className="space-y-3 px-6 py-4">
      {/* Title Row */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-display text-[22px] font-bold leading-tight text-foreground">
          {drop.title}
        </h1>
        {/* Status Badge */}
        <span
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
            drop.status === "LIVE" && "bg-success/20 text-success",
            drop.status === "SCHEDULED" && "bg-warning/20 text-warning",
            drop.status === "ENDED" && "bg-muted text-muted-foreground",
            isSoldOut && drop.status === "LIVE" && "bg-error/20 text-error"
          )}
        >
          {isSoldOut && drop.status === "LIVE" ? (
            <>
              <span className="h-2 w-2 rounded-full bg-error" />
              Sold Out
            </>
          ) : (
            <>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  drop.status === "LIVE" && "bg-success",
                  drop.status === "SCHEDULED" && "bg-warning",
                  drop.status === "ENDED" && "bg-muted-foreground"
                )}
              />
              {drop.status === "LIVE" && "Live"}
              {drop.status === "SCHEDULED" && "Scheduled"}
              {drop.status === "ENDED" && "Ended"}
            </>
          )}
        </span>
      </div>

      {/* Description */}
      {drop.description && (
        <p className="text-body text-muted-foreground leading-relaxed">
          {drop.description.length > 200
            ? `${drop.description.slice(0, 200)}...`
            : drop.description}
        </p>
      )}

      {/* Price & Slots Row */}
      <div className="flex items-center justify-between">
        <span className="font-display text-[28px] font-extrabold text-foreground">
          {isFree ? "Free" : `ETB ${(drop.price / 100).toLocaleString()}`}
        </span>
        {hasSlots && !isSoldOut && slotsRemaining > 0 && (
          <span className="text-callout font-semibold text-warning">
            {slotsRemaining} spot{slotsRemaining !== 1 ? "s" : ""} left
          </span>
        )}
      </div>

      {/* Schedule Info */}
      {drop.scheduled_at && (
        <div className="flex items-center gap-2 text-subhead text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatScheduledDate(drop.scheduled_at)}</span>
        </div>
      )}

      {drop.status === "LIVE" && drop.ends_at && (
        <div className="flex items-center gap-2 text-subhead text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span>{getEndsInText(drop.ends_at)}</span>
        </div>
      )}
    </div>
  );
}
