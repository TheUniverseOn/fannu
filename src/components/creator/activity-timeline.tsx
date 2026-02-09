"use client";

import Link from "next/link";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  type: "vip_join" | "purchase" | "booking_request" | "booking_status" | "drop_status";
  icon: LucideIcon;
  text: string;
  timestamp: Date;
  href: string;
  iconColor?: string;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  className?: string;
}

const iconColorMap: Record<string, string> = {
  "vip_join": "bg-fannu-purple/20 text-fannu-purple",
  "purchase": "bg-success/20 text-success",
  "booking_request": "bg-fannu-blue/20 text-fannu-blue",
  "booking_status": "bg-warning/20 text-warning",
  "drop_status": "bg-fannu-pink/20 text-fannu-pink",
};

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  if (items.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-accent">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-foreground">
          Nothing here yet
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Create your first drop to get started!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const colorClass = item.iconColor || iconColorMap[item.type] || iconColorMap.vip_join;

        return (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-muted/50"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105",
                colorClass
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">
                {item.text}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(item.timestamp)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
