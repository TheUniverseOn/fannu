"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Calendar, MapPin, FileText, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleSwitch } from "@/components/creator/toggle-switch";
import { cn } from "@/lib/utils";

// Booking type labels
const BOOKING_TYPE_LABELS: Record<string, string> = {
  LIVE_PERFORMANCE: "Live Performance",
  MC_HOSTING: "MC / Hosting",
  BRAND_CONTENT: "Brand Content",
  CUSTOM: "Custom Request",
};

// Quote expiry options
const QUOTE_EXPIRY_OPTIONS = [
  { value: "24", label: "24 hours" },
  { value: "48", label: "48 hours" },
  { value: "72", label: "72 hours" },
  { value: "168", label: "7 days" },
];

// Booking summary props for the modal
export interface BookingSummary {
  id: string;
  referenceCode: string;
  bookerName: string;
  bookingType: string;
  eventDate: Date;
  location: string;
  venue?: string;
  budgetMin: number;
  budgetMax: number;
}

// Creator settings for default values
export interface CreatorSettings {
  default_deposit_percent?: number;
  default_deposit_refundable?: boolean;
  default_additional_terms?: string;
}

// Quote form data
export interface QuoteFormData {
  totalAmount: number;
  depositPercent: number;
  depositRefundable: boolean;
  expiryHours: number;
  additionalTerms: string;
}

interface SendQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingSummary;
  creatorSettings?: CreatorSettings;
  onSubmit: (data: QuoteFormData) => Promise<void>;
}

export function SendQuoteModal({
  open,
  onOpenChange,
  booking,
  creatorSettings,
  onSubmit,
}: SendQuoteModalProps) {
  // Form state
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [depositPercent, setDepositPercent] = useState<number>(
    creatorSettings?.default_deposit_percent ?? 30
  );
  const [depositRefundable, setDepositRefundable] = useState<boolean>(
    creatorSettings?.default_deposit_refundable ?? true
  );
  const [expiryHours, setExpiryHours] = useState<string>("48");
  const [additionalTerms, setAdditionalTerms] = useState<string>(
    creatorSettings?.default_additional_terms ?? ""
  );

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTotalAmount("");
      setDepositPercent(creatorSettings?.default_deposit_percent ?? 30);
      setDepositRefundable(creatorSettings?.default_deposit_refundable ?? true);
      setExpiryHours("48");
      setAdditionalTerms(creatorSettings?.default_additional_terms ?? "");
      setError(null);
    }
  }, [open, creatorSettings]);

  // Calculate deposit amount
  const depositAmount = useMemo(() => {
    const amount = parseFloat(totalAmount) || 0;
    return Math.round((amount * depositPercent) / 100);
  }, [totalAmount, depositPercent]);

  // Format amount for display
  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-US", { maximumFractionDigits: 0 });

  // Format date for display
  const formattedDate = useMemo(() => {
    return booking.eventDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [booking.eventDate]);

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepositPercent(parseInt(e.target.value, 10));
  };

  // Handle percent input change
  const handlePercentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 10 && newValue <= 100) {
      setDepositPercent(newValue);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(totalAmount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setIsSending(true);
      await onSubmit({
        totalAmount: amount,
        depositPercent,
        depositRefundable,
        expiryHours: parseInt(expiryHours, 10),
        additionalTerms,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send quote. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Quote to {booking.bookerName}</DialogTitle>
          <DialogDescription>
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {booking.referenceCode}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Summary (read-only) */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Booking Summary
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>{BOOKING_TYPE_LABELS[booking.bookingType] || booking.bookingType}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{booking.venue ? `${booking.venue}, ${booking.location}` : booking.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium">
                  Budget: ETB {formatAmount(booking.budgetMin)} - {formatAmount(booking.budgetMax)}
                </span>
              </div>
            </div>
          </div>

          {/* Quote Form */}
          <div className="space-y-5">
            {/* Total Amount */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount (ETB)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                  ETB
                </span>
                <Input
                  id="totalAmount"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  disabled={isSending}
                  className="pl-12"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter your full fee for this booking
              </p>
            </div>

            {/* Deposit Percentage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Deposit Percentage</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={10}
                    max={100}
                    value={depositPercent}
                    onChange={handlePercentInputChange}
                    disabled={isSending}
                    className="w-20 text-center"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={depositPercent}
                onChange={handleSliderChange}
                disabled={isSending}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>10%</span>
                <span>100%</span>
              </div>
              {/* Calculated deposit display */}
              <div
                className={cn(
                  "text-sm font-medium p-2 rounded-md bg-primary/10 text-primary dark:bg-primary/20",
                  !totalAmount && "opacity-50"
                )}
              >
                Deposit: ETB {formatAmount(depositAmount)} ({depositPercent}%)
              </div>
            </div>

            {/* Deposit Refundable Toggle */}
            <div className="space-y-2">
              <ToggleSwitch
                checked={depositRefundable}
                onCheckedChange={setDepositRefundable}
                label="Deposit Refundable"
                disabled={isSending}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 pl-0">
                {depositRefundable
                  ? "Refundable if cancelled 24+ hours before event"
                  : "Non-refundable once paid"}
              </p>
            </div>

            {/* Quote Expiry */}
            <div className="space-y-2">
              <Label htmlFor="expiryHours">Quote Expires In</Label>
              <Select
                value={expiryHours}
                onValueChange={setExpiryHours}
                disabled={isSending}
              >
                <SelectTrigger id="expiryHours">
                  <SelectValue placeholder="Select expiry time" />
                </SelectTrigger>
                <SelectContent>
                  {QUOTE_EXPIRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Terms */}
            <div className="space-y-2">
              <Label htmlFor="additionalTerms">Additional Terms</Label>
              <Textarea
                id="additionalTerms"
                placeholder="Any specific terms for this booking..."
                value={additionalTerms}
                onChange={(e) => setAdditionalTerms(e.target.value)}
                disabled={isSending}
                rows={3}
              />
            </div>
          </div>

          {/* Auto-generated Terms Preview */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Terms Preview
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>
                <span className="font-medium">Cancellation Policy:</span>{" "}
                {depositRefundable
                  ? "Deposit is refundable if the booking is cancelled at least 24 hours before the scheduled event. Cancellations within 24 hours of the event are non-refundable."
                  : "Deposit is non-refundable once payment is confirmed. This applies regardless of cancellation timing."}
              </p>
              {additionalTerms && (
                <p>
                  <span className="font-medium">Additional Terms:</span> {additionalTerms}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSending || !totalAmount}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Quote"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
