import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Info,
  RefreshCw,
  Printer,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { formatETB } from "@/lib/utils";
import { getBookingById } from "@/lib/queries/bookings";

interface ReceiptPageProps {
  params: Promise<{ bookingId: string; receiptId: string }>;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    PAID: {
      icon: CheckCircle2,
      label: "Paid",
      className: "bg-green-500/20 text-green-500",
    },
    PENDING: {
      icon: Clock,
      label: "Pending",
      className: "bg-yellow-500/20 text-yellow-500",
    },
    FAILED: {
      icon: XCircle,
      label: "Failed",
      className: "bg-red-500/20 text-red-500",
    },
    REFUNDED: {
      icon: RefreshCw,
      label: "Refunded",
      className: "bg-gray-500/20 text-gray-400",
    },
  };

  const { icon: Icon, label, className } = config[status] || config.PENDING;

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${className}`}>
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

// Detail row component
function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { bookingId, receiptId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  // Find the payment with this receipt ID
  const payment = booking.payments.find((p) => p.receipt_id === receiptId);
  if (!payment) {
    notFound();
  }

  // Find the associated quote
  const quote = booking.quotes.find((q) => q.id === payment.quote_id);
  const creator = booking.creator;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " at " + new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isPaid = payment.status === "PAID";
  const isPending = payment.status === "PENDING";
  const isFailed = payment.status === "FAILED";
  const isRefunded = payment.status === "REFUNDED";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-5 py-8 md:py-12">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-extrabold text-primary">FanNu</h1>
          <p className="text-sm text-muted-foreground">
            Paid to FanNu on behalf of {creator.display_name}
          </p>
          <h2 className="text-lg font-bold text-foreground">
            Booking Deposit Receipt
          </h2>
          <StatusBadge status={payment.status} />
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Receipt Details */}
        <div className="space-y-4">
          <DetailRow label="Reference" value={payment.receipt_id} mono />
          <DetailRow
            label="Date"
            value={payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
          />
          <DetailRow label="Item" value={`Booking with ${creator.display_name}`} />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-xl font-bold text-foreground">
              {formatETB(payment.amount)}
            </span>
          </div>
          {payment.psp_ref && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">PSP Reference</span>
              <span className="text-muted-foreground font-mono">{payment.psp_ref}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Booking Info */}
        <div className="space-y-3">
          <h3 className="font-bold text-foreground">Booking Details</h3>
          <DetailRow label="Booking ref" value={booking.reference_code} mono />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={isPaid ? "PAID" : payment.status} />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Status-specific content */}
        {isPaid && (
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Next steps</h3>
            <p className="text-sm text-muted-foreground">
              Your booking is confirmed. You can now contact {creator.display_name} directly to discuss details.
            </p>
            <a
              href={`https://wa.me/${creator.phone?.replace(/[^0-9]/g, "")}?text=Hi ${creator.display_name}, I just paid the deposit for my booking (ref: ${booking.reference_code}). Looking forward to working with you!`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Message on WhatsApp
              </Button>
            </a>
            {quote && (
              <div className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
                <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Remaining balance of {formatETB(quote.total_amount - quote.deposit_amount)} will be collected separately
                </p>
              </div>
            )}
          </div>
        )}

        {isPending && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">
              <Clock className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-500">Payment Pending</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your payment is being processed. This usually takes a few seconds. Refresh this page to check the status.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </div>
        )}

        {isFailed && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-500">Payment Failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your payment could not be processed. Please try again or contact support.
                </p>
              </div>
            </div>
            <Link href={`/booking/${bookingId}/checkout`} className="block">
              <Button className="w-full" size="lg">
                Try Again
              </Button>
            </Link>
          </div>
        )}

        {isRefunded && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-muted p-4">
              <RefreshCw className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Payment Refunded</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This payment has been refunded. The funds should return to your account within 5-10 business days.
                </p>
              </div>
            </div>
            <Link href={`/c/${creator.slug}`} className="block">
              <Button variant="outline" className="w-full">
                Contact {creator.display_name}
              </Button>
            </Link>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border my-6" />

        {/* Footer */}
        <div className="text-center space-y-4">
          <a
            href="https://wa.me/251911000000?text=Hi, I need help with my booking payment"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Questions? Contact support
          </a>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Printer className="mr-2 h-4 w-4" />
            Save / Print Receipt
          </Button>
        </div>
      </div>

      <PoweredByFooter />
    </div>
  );
}
