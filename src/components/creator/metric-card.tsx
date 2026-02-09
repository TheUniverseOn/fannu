"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

/**
 * Metric Card - FanNu Dark Theme Design
 * Primary: Purple gradient background
 * Secondary: Dark card with border
 */
export function MetricCard({
  title,
  value,
  subtitle,
  variant = "secondary",
  className,
}: MetricCardProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={cn(
        "rounded-3xl p-6 space-y-4",
        isPrimary
          ? "bg-gradient-accent"
          : "bg-card border border-border",
        className
      )}
    >
      <div className="space-y-1">
        <p className={cn(
          "font-display text-[32px] font-extrabold",
          isPrimary ? "text-white" : "text-foreground"
        )}>
          {value}
        </p>
        <p className={cn(
          "text-body",
          isPrimary ? "text-white/80" : "text-muted-foreground"
        )}>
          {title}
        </p>
      </div>
      {subtitle && (
        <p className={cn(
          "text-subhead",
          isPrimary ? "text-white/60" : "text-muted-foreground"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Small metric card for inline use
 */
interface SmallMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accentColor?: "warning" | "success" | "error" | "info";
  className?: string;
}

export function SmallMetricCard({
  title,
  value,
  subtitle,
  accentColor,
  className,
}: SmallMetricCardProps) {
  const subtitleColors = {
    warning: "text-warning",
    success: "text-success",
    error: "text-error",
    info: "text-info",
  };

  return (
    <div
      className={cn(
        "rounded-3xl bg-card border border-border p-6 space-y-4",
        className
      )}
    >
      <div className="space-y-1">
        <p className="font-display text-[32px] font-extrabold text-foreground">
          {value}
        </p>
        <p className="text-body text-muted-foreground">
          {title}
        </p>
      </div>
      {subtitle && (
        <p className={cn(
          "text-subhead",
          accentColor ? subtitleColors[accentColor] : "text-muted-foreground"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
