"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-accent">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-6 font-display text-xl font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-3 max-w-sm text-body text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-8">
          {action.label}
        </Button>
      )}
    </div>
  );
}
