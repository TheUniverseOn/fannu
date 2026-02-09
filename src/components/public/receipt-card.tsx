"use client";

import { useState } from "react";
import { cn, formatETB, formatDateTime } from "@/lib/utils";
import { SUPPORT_WHATSAPP } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { PaymentStatus, Creator, Drop, Booking, BookingQuote, BookingStatus } from "@/types";

// Re-export BookingStatus for potential future use
export type { BookingStatus };
import {
  Check,
  Copy,
  Clock,
  AlertCircle,
  RotateCcw,
  MessageCircle,
  Printer,
  ExternalLink,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export type ReceiptType = "drop_purchase" | "booking_deposit";

interface BaseReceiptData {
  receiptId: string;
  referenceId: string;
  pspReference?: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  paidAt?: string;
  creator: Pick<Creator, "display_name" | "phone">;
}

interface DropPurchaseReceiptData extends BaseReceiptData {
  type: "drop_purchase";
  drop: Pick<Drop, "title">;
  quantity: number;
}

interface BookingDepositReceiptData extends BaseReceiptData {
  type: "booking_deposit";
  booking: Pick<Booking, "reference_code" | "status">;
  quote: Pick<BookingQuote, "total_amount" | "deposit_amount" | "deposit_refundable">;
}

export type ReceiptData = DropPurchaseReceiptData | BookingDepositReceiptData;

interface ReceiptCardProps {
  data: ReceiptData;
  className?: string;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group"
      title={`Copy ${label}`}
    >
      <span>{text}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

function PaymentStatusChip({ status }: { status: PaymentStatus }) {
  const config: Record<PaymentStatus, { bg: string; text: string; icon: React.ReactNode; message?: string }> = {
    PENDING: {
      bg: "bg-warning/20 border-warning/30",
      text: "text-warning",
      icon: <Clock className="h-4 w-4" />,
      message: "Payment is being processed. Refresh to check.",
    },
    PAID: {
      bg: "bg-success/20 border-success/30",
      text: "text-success",
      icon: <Check className="h-4 w-4" />,
    },
    FAILED: {
      bg: "bg-error/20 border-error/30",
      text: "text-error",
      icon: <AlertCircle className="h-4 w-4" />,
      message: "Payment failed. Please try again.",
    },
    REFUNDED: {
      bg: "bg-muted border-border",
      text: "text-muted-foreground",
      icon: <RotateCcw className="h-4 w-4" />,
    },
  };

  const { bg, text, icon, message } = config[status];
  const label = status === "PAID" ? "PAID" : status;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm",
          bg,
          text
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
      {message && (
        <p className={cn("text-sm", text)}>{message}</p>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  muted = false,
  strikethrough = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
  strikethrough?: boolean;
}) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-dashed border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-foreground text-right max-w-[60%]",
          muted && "text-muted-foreground text-xs",
          strikethrough && "line-through text-muted-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ReceiptCard({ data, className }: ReceiptCardProps) {
  const isRefunded = data.paymentStatus === "REFUNDED";
  const isPending = data.paymentStatus === "PENDING";
  const isFailed = data.paymentStatus === "FAILED";

  // Generate WhatsApp URLs
  const creatorPhone = data.creator.phone.replace(/[^0-9]/g, "");
  const creatorWhatsAppUrl = `https://wa.me/${creatorPhone}`;
  const supportWhatsAppUrl = `https://wa.me/${SUPPORT_WHATSAPP.replace(/[^0-9]/g, "")}`;

  // Format date
  const displayDate = data.paidAt
    ? formatDateTime(data.paidAt)
    : formatDateTime(data.createdAt);

  // Receipt type label
  const receiptTypeLabel =
    data.type === "drop_purchase" ? "Purchase Receipt" : "Booking Deposit Receipt";

  // Item description
  const itemDescription =
    data.type === "drop_purchase"
      ? data.drop.title
      : `Booking with ${data.creator.display_name}`;

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle retry (for failed payments)
  const handleRetry = () => {
    // In a real implementation, this would redirect to payment
    window.location.reload();
  };

  // Handle refresh (for pending payments)
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden print:shadow-none print:border print:border-border",
        className
      )}
    >
      {/* Header */}
      <div className="bg-elevated px-6 py-5 text-center border-b border-border print:bg-card">
        {/* Logo/Brand */}
        <div className="mb-3">
          <span className="font-display text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FanNu
          </span>
        </div>

        {/* Payment Attribution */}
        <p className="text-sm text-muted-foreground">
          Paid to FanNu on behalf of{" "}
          <span className="font-medium text-foreground">
            {data.creator.display_name}
          </span>
        </p>

        {/* Receipt Type */}
        <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">
          {receiptTypeLabel}
        </p>
      </div>

      {/* Status */}
      <div className="px-6 py-5 text-center border-b border-dashed border-border">
        <PaymentStatusChip status={data.paymentStatus} />

        {/* Pending: Refresh button */}
        {isPending && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-3 print:hidden"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}

        {/* Failed: Retry button */}
        {isFailed && (
          <Button
            variant="default"
            size="sm"
            onClick={handleRetry}
            className="mt-3 print:hidden"
          >
            Try Again
          </Button>
        )}
      </div>

      {/* Details */}
      <div className="px-6 py-4">
        <DetailRow
          label="Reference ID"
          value={<CopyButton text={data.referenceId} label="reference ID" />}
        />

        <DetailRow label="Date" value={displayDate} />

        <DetailRow label="Item" value={itemDescription} />

        {/* Drop-specific: Quantity */}
        {data.type === "drop_purchase" && data.quantity > 1 && (
          <DetailRow label="Quantity" value={data.quantity} />
        )}

        {/* Amount */}
        <DetailRow
          label="Amount"
          value={formatETB(data.amount)}
          strikethrough={isRefunded}
        />

        {/* Refunded indicator */}
        {isRefunded && (
          <DetailRow
            label="Refunded"
            value={formatETB(data.amount)}
            muted
          />
        )}

        {/* PSP Reference (small, muted) */}
        {data.pspReference && (
          <DetailRow
            label="Transaction ID"
            value={data.pspReference}
            muted
          />
        )}
      </div>

      {/* Booking-specific section */}
      {data.type === "booking_deposit" && (
        <div className="px-6 py-4 bg-elevated border-t border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Booking Details
          </h3>

          <div className="space-y-3">
            {/* Booking Reference */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Booking Reference</span>
              <span className="text-sm font-mono font-semibold">
                {data.booking.reference_code}
              </span>
            </div>

            {/* Booking Status */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Booking Status</span>
              <StatusBadge status={data.booking.status.toLowerCase()} type="booking" />
            </div>

            {/* Remaining Balance */}
            {!isRefunded && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remaining Balance</span>
                <span className="text-sm font-medium">
                  {formatETB(data.quote.total_amount - data.quote.deposit_amount)}
                </span>
              </div>
            )}

            {/* Deposit Refundable Note */}
            {data.quote.deposit_refundable && (
              <p className="text-xs text-muted-foreground mt-2">
                * Deposit is refundable per cancellation terms
              </p>
            )}
          </div>

          {/* Creator Contact */}
          {data.paymentStatus === "PAID" && (
            <div className="mt-4 pt-4 border-t border-dashed border-border">
              <a
                href={creatorWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-success hover:bg-success/90 text-white rounded-full font-medium text-sm transition-colors print:hidden"
              >
                <MessageCircle className="h-4 w-4" />
                Message {data.creator.display_name} on WhatsApp
              </a>

              <p className="mt-3 text-xs text-center text-muted-foreground">
                Your booking is confirmed. You can now contact {data.creator.display_name} directly.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-elevated border-t border-border print:bg-card">
        {/* Actions */}
        <div className="flex gap-3 justify-center print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1 max-w-[140px]"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          <a
            href={supportWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 max-w-[140px]"
          >
            <Button variant="ghost" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Support
            </Button>
          </a>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block text-center text-xs text-muted-foreground mt-4">
          <p>Thank you for your purchase!</p>
          <p className="mt-1">For support, contact us at fannu.io</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

export function ReceiptCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden animate-pulse",
        className
      )}
    >
      {/* Header skeleton */}
      <div className="bg-elevated px-6 py-5 text-center border-b border-border">
        <div className="h-7 w-20 bg-muted rounded mx-auto mb-3" />
        <div className="h-4 w-48 bg-muted rounded mx-auto mb-2" />
        <div className="h-3 w-32 bg-muted rounded mx-auto" />
      </div>

      {/* Status skeleton */}
      <div className="px-6 py-5 text-center border-b border-dashed border-border">
        <div className="h-8 w-24 bg-muted rounded-full mx-auto" />
      </div>

      {/* Details skeleton */}
      <div className="px-6 py-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="px-6 py-4 bg-elevated border-t border-border">
        <div className="flex gap-3 justify-center">
          <div className="h-9 w-28 bg-muted rounded-full" />
          <div className="h-9 w-28 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NOT FOUND STATE
// ============================================================================

export function ReceiptNotFound({ className }: { className?: string }) {
  const supportWhatsAppUrl = `https://wa.me/${SUPPORT_WHATSAPP.replace(/[^0-9]/g, "")}`;

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden p-8 text-center",
        className
      )}
    >
      <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
      </div>

      <h2 className="font-display text-xl font-bold text-foreground mb-2">
        Receipt Not Found
      </h2>

      <p className="text-sm text-muted-foreground mb-6">
        We could not find a receipt with this ID. It may have been deleted or the link is incorrect.
      </p>

      <a
        href={supportWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <MessageCircle className="h-4 w-4" />
        Contact Support
      </a>
    </div>
  );
}
