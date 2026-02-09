"use client";

import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
  danger = false,
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card",
        danger && "border-error/30",
        className
      )}
    >
      <div
        className={cn(
          "border-b border-border px-6 py-4",
          danger && "border-error/30"
        )}
      >
        <h3
          className={cn(
            "font-display text-lg font-bold text-foreground",
            danger && "text-error"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
