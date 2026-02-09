"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Calendar, User, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, formatDate } from "@/lib/utils";

// Decline reason options
const DECLINE_REASONS = [
  { value: "not_available", label: "Not available on this date" },
  { value: "budget_too_low", label: "Budget too low" },
  { value: "not_my_type", label: "Not my type of event" },
  { value: "location_issue", label: "Too far / location issue" },
  { value: "other", label: "Other" },
] as const;

export type DeclineReason = (typeof DECLINE_REASONS)[number]["value"];

// Booking summary for display in modal
export interface BookingSummary {
  id: string;
  referenceCode: string;
  bookerName: string;
  bookingType: string;
  eventDate: Date | string;
}

// Props for the modal
export interface DeclineBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingSummary;
  onDecline?: (data: { reason: DeclineReason; message?: string }) => Promise<void>;
}

// State for the form
type ModalState = "default" | "declining" | "success" | "error";

// Booking type labels for display
const BOOKING_TYPE_LABELS: Record<string, string> = {
  LIVE_PERFORMANCE: "Live Performance",
  MC_HOSTING: "MC / Hosting",
  BRAND_CONTENT: "Brand Content",
  CUSTOM: "Custom Request",
};

export function DeclineBookingModal({
  open,
  onOpenChange,
  booking,
  onDecline,
}: DeclineBookingModalProps) {
  const router = useRouter();
  const [state, setState] = React.useState<ModalState>("default");
  const [reason, setReason] = React.useState<DeclineReason | "">("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setState("default");
      setReason("");
      setMessage("");
      setError(null);
    }
  }, [open]);

  // Format the event date for display
  const formattedDate =
    typeof booking.eventDate === "string"
      ? formatDate(booking.eventDate)
      : formatDate(booking.eventDate);

  // Get the booking type label
  const bookingTypeLabel =
    BOOKING_TYPE_LABELS[booking.bookingType] || booking.bookingType;

  // Handle form submission
  const handleDecline = async () => {
    if (!reason) {
      setError("Please select a reason for declining");
      return;
    }

    setError(null);
    setState("declining");

    try {
      if (onDecline) {
        await onDecline({
          reason: reason as DeclineReason,
          message: message.trim() || undefined,
        });
      }

      setState("success");

      // Close modal and redirect after a brief delay
      setTimeout(() => {
        onOpenChange(false);
        router.push("/app/bookings");
      }, 1500);
    } catch (err) {
      setState("error");
      setError(
        err instanceof Error
          ? err.message
          : "Failed to decline booking. Please try again."
      );
    }
  };

  const isDeclineDisabled = !reason || state === "declining";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-xl">Decline Booking Request</DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Booking Summary (read-only) */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              {booking.bookerName}
            </span>
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {booking.referenceCode}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FileText className="h-4 w-4 text-gray-400" />
            <span>{bookingTypeLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Decline Form */}
        <div className="space-y-4">
          {/* Reason Select */}
          <div className="space-y-2">
            <Label htmlFor="decline-reason" className="text-gray-900 dark:text-white">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as DeclineReason)}
              disabled={state === "declining"}
            >
              <SelectTrigger
                id="decline-reason"
                className={cn(
                  "w-full",
                  !reason && "text-gray-500"
                )}
              >
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DECLINE_REASONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Textarea */}
          <div className="space-y-2">
            <Label htmlFor="decline-message" className="text-gray-900 dark:text-white">
              Message to Booker{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="decline-message"
              placeholder="Add a personal message (optional)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={state === "declining"}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This message will be sent to the booker
            </p>
          </div>
        </div>

        {/* Warning Text */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            This action cannot be undone. The booker will be notified that you&apos;ve
            declined their request.
          </p>
        </div>

        {/* Error Message */}
        {error && state === "error" && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-3">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {state === "success" && (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              Booking declined successfully. Redirecting...
            </p>
          </div>
        )}

        {/* Actions */}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={state === "declining" || state === "success"}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDecline}
            disabled={isDeclineDisabled || state === "success"}
          >
            {state === "declining" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Declining...
              </>
            ) : (
              "Decline Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeclineBookingModal;
