"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DROP_TYPE_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { formatETB } from "@/lib/utils";

export interface DropCardData {
  id: string;
  slug: string;
  title: string;
  type: string;
  status: "draft" | "scheduled" | "live" | "ended" | "cancelled";
  price_cents?: number | null;
  cover_url?: string | null;
  quantity_limit?: number | null;
  quantity_sold?: number;
}

interface DropCardProps {
  drop: DropCardData;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  experience: "bg-fannu-purple/20 text-fannu-purple",
  merch: "bg-fannu-blue/20 text-fannu-blue",
  content: "bg-fannu-teal/20 text-fannu-teal",
  event: "bg-fannu-pink/20 text-fannu-pink",
  custom: "bg-fannu-gold/20 text-fannu-gold",
};

/**
 * Drop card component for displaying drop information
 * FanNu dark theme with gradient hover effects
 */
export function DropCard({ drop, className }: DropCardProps) {
  const defaultCover = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
  const typeLabel = DROP_TYPE_LABELS[drop.type] || drop.type;
  const typeColor = TYPE_COLORS[drop.type.toLowerCase()] || "bg-muted text-muted-foreground";

  return (
    <Link href={`/d/${drop.slug}`} className="block group">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300",
          "hover:shadow-glow-purple hover:border-primary/30 hover:-translate-y-1",
          className
        )}
      >
        {/* Cover Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-elevated">
          <Image
            src={drop.cover_url || defaultCover}
            alt={drop.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Status badge overlay */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={drop.status} type="drop" showDot />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Type Badge */}
          <span className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            typeColor
          )}>
            {typeLabel}
          </span>

          {/* Title */}
          <h3 className="font-display text-headline font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {drop.title}
          </h3>

          {/* Price and availability */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-display text-xl font-extrabold text-foreground">
              {!drop.price_cents || drop.price_cents === 0 ? "Free" : formatETB(drop.price_cents)}
            </span>
            {drop.quantity_limit && (
              <span className="text-subhead font-medium text-warning">
                {(drop.quantity_limit - (drop.quantity_sold || 0))} left
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Loading skeleton for DropCard
 */
export function DropCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Cover skeleton */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of drop cards
 */
export function DropCardGrid({
  drops,
  className,
}: {
  drops: DropCardData[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {drops.map((drop) => (
        <DropCard key={drop.id} drop={drop} />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for DropCardGrid
 */
export function DropCardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DropCardSkeleton key={i} />
      ))}
    </div>
  );
}
