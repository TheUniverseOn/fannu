"use client";

import { STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

type StatusType = "booking" | "drop" | "payment";

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
  showDot?: boolean;
}

const variantStyles: Record<string, string> = {
  // FanNu dark theme status badges
  default: "bg-info/20 text-info",
  secondary: "bg-muted text-muted-foreground",
  destructive: "bg-error/20 text-error",
  outline: "bg-card text-muted-foreground border border-border",
  success: "bg-success/20 text-success",
  warning: "bg-warning/20 text-warning",
  // Color variants
  blue: "bg-fannu-blue/20 text-fannu-blue",
  purple: "bg-fannu-purple/20 text-fannu-purple",
  yellow: "bg-warning/20 text-warning",
  green: "bg-success/20 text-success",
  gray: "bg-muted text-muted-foreground",
  red: "bg-error/20 text-error",
  orange: "bg-warning/20 text-warning",
  pink: "bg-fannu-pink/20 text-fannu-pink",
  teal: "bg-fannu-teal/20 text-fannu-teal",
  gold: "bg-fannu-gold/20 text-fannu-gold",
};

const dotColors: Record<string, string> = {
  default: "bg-info",
  secondary: "bg-muted-foreground",
  destructive: "bg-error",
  outline: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  blue: "bg-fannu-blue",
  purple: "bg-fannu-purple",
  yellow: "bg-warning",
  green: "bg-success",
  gray: "bg-muted-foreground",
  red: "bg-error",
  orange: "bg-warning",
  pink: "bg-fannu-pink",
  teal: "bg-fannu-teal",
  gold: "bg-fannu-gold",
};

export function StatusBadge({ status, type = "booking", className, showDot = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[type]?.[status];
  const label = config?.label ?? status;
  const variant = config?.variant ?? "secondary";
  const variantStyle = variantStyles[variant] ?? variantStyles.secondary;
  const dotColor = dotColors[variant] ?? dotColors.secondary;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
        variantStyle,
        className
      )}
    >
      {showDot && (
        <span className={cn("h-2 w-2 rounded-full", dotColor)} />
      )}
      {label}
    </span>
  );
}
