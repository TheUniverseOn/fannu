"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { formatETB, formatDate } from "@/lib/utils";
import { Calendar, Users, ShoppingCart, Coins } from "lucide-react";

export type DropStatus = "draft" | "scheduled" | "live" | "ended" | "cancelled";
export type DropType = "EVENT" | "MERCH" | "CONTENT" | "CUSTOM";

export interface CreatorDropCardData {
  id: string;
  slug: string;
  title: string;
  type: DropType;
  status: DropStatus;
  price_cents: number;
  cover_url?: string | null;
  quantity_limit?: number | null;
  quantity_sold?: number;
  vip_count?: number;
  total_revenue_cents?: number;
  created_at: string;
}

interface CreatorDropCardProps {
  drop: CreatorDropCardData;
  className?: string;
}

const TYPE_LABELS: Record<DropType, string> = {
  EVENT: "Event",
  MERCH: "Merch",
  CONTENT: "Content",
  CUSTOM: "Custom",
};

const TYPE_COLORS: Record<DropType, string> = {
  EVENT: "bg-fannu-pink/20 text-fannu-pink",
  MERCH: "bg-fannu-blue/20 text-fannu-blue",
  CONTENT: "bg-fannu-teal/20 text-fannu-teal",
  CUSTOM: "bg-fannu-gold/20 text-fannu-gold",
};

/**
 * Creator Drop card component for displaying drop information with stats
 * Shows cover thumbnail, title, type badge, status, price, and performance stats
 */
export function CreatorDropCard({ drop, className }: CreatorDropCardProps) {
  const defaultCover = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
  const typeLabel = TYPE_LABELS[drop.type] || drop.type;
  const typeColor = TYPE_COLORS[drop.type] || TYPE_COLORS.CUSTOM;

  const vipCount = drop.vip_count || 0;
  const purchaseCount = drop.quantity_sold || 0;
  const totalRevenue = drop.total_revenue_cents || 0;

  return (
    <Link href={`/app/drops/${drop.id}`} className="block group">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300",
          "hover:shadow-glow-purple hover:border-primary/30 hover:-translate-y-0.5",
          className
        )}
      >
        <div className="flex gap-4 p-4">
          {/* Cover Thumbnail */}
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-elevated">
            <Image
              src={drop.cover_url || defaultCover}
              alt={drop.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges Row */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  typeColor
                )}
              >
                {typeLabel}
              </span>
              <StatusBadge status={drop.status} type="drop" showDot />
            </div>

            {/* Title */}
            <h3 className="font-display font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {drop.title}
            </h3>

            {/* Price */}
            <p className="mt-1 text-sm font-bold text-foreground">
              {drop.price_cents > 0 ? formatETB(drop.price_cents) : "Free"}
            </p>

            {/* Stats */}
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {vipCount} VIPs
              </span>
              <span className="flex items-center gap-1">
                <ShoppingCart className="h-3.5 w-3.5" />
                {purchaseCount} purchases
              </span>
              {totalRevenue > 0 && (
                <span className="flex items-center gap-1 text-success">
                  <Coins className="h-3.5 w-3.5" />
                  {formatETB(totalRevenue)}
                </span>
              )}
            </div>

            {/* Date */}
            <div className="mt-2 flex items-center gap-1 text-xs text-muted">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(drop.created_at)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Loading skeleton for CreatorDropCard
 */
export function CreatorDropCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex gap-4 p-4">
        {/* Cover skeleton */}
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-xl" />

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-1 h-4 w-20" />
          <Skeleton className="mt-2 h-4 w-full max-w-xs" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of creator drop cards
 */
export function CreatorDropCardGrid({
  drops,
  className,
}: {
  drops: CreatorDropCardData[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {drops.map((drop) => (
        <CreatorDropCard key={drop.id} drop={drop} />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for CreatorDropCardGrid
 */
export function CreatorDropCardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CreatorDropCardSkeleton key={i} />
      ))}
    </div>
  );
}
