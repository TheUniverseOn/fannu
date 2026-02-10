"use client";

import { useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatETB } from "@/lib/utils";

interface EndDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  drop: {
    id: string;
    title: string;
    quantitySold: number;
    quantityLimit: number | null;
    totalRevenue: number;
  };
}

export function EndDropModal({ isOpen, onClose, onConfirm, drop }: EndDropModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm();
      onClose();
    });
  };

  if (!isOpen) return null;

  const slotsRemaining = drop.quantityLimit ? drop.quantityLimit - drop.quantitySold : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[370px] mx-4 rounded-3xl bg-background shadow-2xl">
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-destructive">End Drop</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-card hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
          </div>

          {/* Warning Text */}
          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to end this drop? This action cannot be undone.
            All unsold tickets will be cancelled and bookers will be notified.
          </p>

          {/* Drop Summary */}
          <div className="rounded-xl bg-card p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Drop</span>
              <span className="font-medium text-foreground truncate max-w-[180px]">
                {drop.title}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sold</span>
              <span className="font-medium text-foreground">
                {drop.quantitySold} {drop.quantityLimit ? `/ ${drop.quantityLimit}` : ""}
              </span>
            </div>
            {slotsRemaining !== null && slotsRemaining > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Will be cancelled</span>
                <span className="font-medium text-destructive">
                  {slotsRemaining} slots
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total revenue</span>
              <span className="font-medium text-success">
                {formatETB(drop.totalRevenue)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Ending..." : "End Drop"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
