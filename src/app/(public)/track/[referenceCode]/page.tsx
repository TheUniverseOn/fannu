import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { formatETB, cn } from "@/lib/utils";
import { getBookingByReferenceCode } from "@/lib/queries/bookings";

interface TrackPageProps {
  params: Promise<{ referenceCode: string }>;
}

// Booking type labels
const BOOKING_TYPE_LABELS: Record<string, string> = {
  LIVE_PERFORMANCE: "Live Performance",
  MC_HOSTING: "MC / Hosting",
  BRAND_CONTENT: "Brand Content",
  CUSTOM: "Custom",
};

// Status badge configuration
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  REQUESTED: { label: "Request Sent", className: "bg-blue-500/20 text-blue-400" },
  QUOTED: { label: "Quote Received", className: "bg-primary/20 text-primary" },
  DEPOSIT_PAID: { label: "Deposit Paid", className: "bg-green-500/20 text-green-400" },
  CONFIRMED: { label: "Confirmed", className: "bg-green-500/20 text-green-400" },
  COMPLETED: { label: "Completed", className: "bg-green-500/20 text-green-400" },
  DECLINED: { label: "Declined", className: "bg-red-500/20 text-red-400" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-500/20 text-gray-400" },
};

// Timeline step configuration
type TimelineStep = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  current: boolean;
  date?: string;
};

function getTimelineSteps(
  booking: Awaited<ReturnType<typeof getBookingByReferenceCode>>
): TimelineStep[] {
  if (!booking) return [];

  const status = booking.status;
  const activeQuote = booking.quotes.find((q) => q.status === "ACTIVE" || q.status === "ACCEPTED");
  const payment = booking.payments.find((p) => p.status === "PAID");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " · " + new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Determine which steps are completed
  const isQuoted = ["QUOTED", "DEPOSIT_PAID", "CONFIRMED", "COMPLETED"].includes(status);
  const isDepositPaid = ["DEPOSIT_PAID", "CONFIRMED", "COMPLETED"].includes(status);
  const isConfirmed = ["CONFIRMED", "COMPLETED"].includes(status);
  const isCompleted = status === "COMPLETED";
  const isDeclined = status === "DECLINED";
  const isCancelled = status === "CANCELLED";

  if (isDeclined) {
    return [
      {
        id: "requested",
        title: "Request submitted",
        completed: true,
        current: false,
        date: formatDate(booking.created_at),
      },
      {
        id: "declined",
        title: "Booking declined",
        description: booking.decline_reason || "The creator declined this booking request",
        completed: true,
        current: true,
      },
    ];
  }

  if (isCancelled) {
    return [
      {
        id: "requested",
        title: "Request submitted",
        completed: true,
        current: false,
        date: formatDate(booking.created_at),
      },
      {
        id: "cancelled",
        title: "Booking cancelled",
        completed: true,
        current: true,
      },
    ];
  }

  const steps: TimelineStep[] = [
    {
      id: "requested",
      title: "Request submitted",
      completed: true,
      current: status === "REQUESTED",
      date: formatDate(booking.created_at),
    },
    {
      id: "quoted",
      title: isQuoted ? "Quote received" : "Awaiting quote",
      description: activeQuote
        ? `${formatETB(activeQuote.total_amount)} total · ${formatETB(activeQuote.deposit_amount)} deposit`
        : undefined,
      completed: isQuoted,
      current: status === "QUOTED",
      date: activeQuote ? formatDate(activeQuote.created_at) : undefined,
    },
    {
      id: "deposit",
      title: isDepositPaid ? "Deposit paid" : "Awaiting deposit payment",
      description: payment ? `${formatETB(payment.amount)} paid` : undefined,
      completed: isDepositPaid,
      current: status === "DEPOSIT_PAID",
      date: payment?.paid_at ? formatDate(payment.paid_at) : undefined,
    },
    {
      id: "confirmed",
      title: isConfirmed ? "Booking confirmed" : "Booking confirmation",
      completed: isConfirmed,
      current: status === "CONFIRMED",
    },
    {
      id: "completed",
      title: isCompleted ? "Event completed" : "Event completion",
      completed: isCompleted,
      current: status === "COMPLETED",
    },
  ];

  return steps;
}

// Timeline Item Component
function TimelineItem({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  return (
    <div className="flex gap-3">
      {/* Dot and line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-3 w-3 rounded-md shrink-0",
            step.completed ? "bg-green-500" : "bg-muted"
          )}
        />
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[24px]",
              step.completed ? "bg-green-500/30" : "bg-muted"
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn("pb-4", isLast && "pb-0")}>
        <p
          className={cn(
            "text-sm font-semibold",
            step.completed ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {step.title}
        </p>
        {step.date && (
          <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>
        )}
        {step.description && (
          <p className="text-sm text-primary mt-1">{step.description}</p>
        )}
      </div>
    </div>
  );
}

// Detail Row Component
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { referenceCode } = await params;
  const booking = await getBookingByReferenceCode(referenceCode.toUpperCase());

  if (!booking) {
    notFound();
  }

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.REQUESTED;
  const timelineSteps = getTimelineSteps(booking);
  const activeQuote = booking.quotes.find((q) => q.status === "ACTIVE");
  const canPayDeposit = booking.status === "QUOTED" && activeQuote;

  const formatEventDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Link href={`/c/${booking.creator.slug}`} className="p-2 -ml-2">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Booking Status</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="max-w-lg mx-auto">
        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Status Section */}
        <div className="flex flex-col items-center gap-3 px-6 py-6">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
              statusConfig.className
            )}
          >
            {statusConfig.label}
          </span>
          <h2 className="text-2xl font-extrabold text-foreground">
            {booking.reference_code}
          </h2>
          <p className="text-sm text-muted-foreground">
            Booking with {booking.creator.display_name}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Timeline */}
        <div className="px-6 py-4">
          <h3 className="font-bold text-foreground mb-4">Timeline</h3>
          <div className="space-y-0">
            {timelineSteps.map((step, index) => (
              <TimelineItem
                key={step.id}
                step={step}
                isLast={index === timelineSteps.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Request Summary */}
        <div className="px-6 py-4 space-y-3">
          <h3 className="font-bold text-foreground">Request summary</h3>
          <DetailRow
            label="Type"
            value={BOOKING_TYPE_LABELS[booking.type] || booking.type}
          />
          <DetailRow label="Date" value={formatEventDate(booking.start_at)} />
          <DetailRow
            label="Location"
            value={
              booking.location_venue
                ? `${booking.location_venue}, ${booking.location_city}`
                : booking.location_city
            }
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Actions */}
        <div className="px-6 py-4 space-y-3">
          {canPayDeposit ? (
            <Link href={`/booking/${booking.id}`} className="block">
              <Button className="w-full" size="lg">
                View Quote & Pay Deposit
              </Button>
            </Link>
          ) : booking.status === "DEPOSIT_PAID" || booking.status === "CONFIRMED" ? (
            <a
              href={`https://wa.me/${booking.creator.phone?.replace(/[^0-9]/g, "")}?text=Hi ${booking.creator.display_name}, I'm following up on my booking (ref: ${booking.reference_code}).`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Message {booking.creator.display_name}
              </Button>
            </a>
          ) : null}

          <a
            href="https://wa.me/251911000000?text=Hi, I need help with my booking"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="outline" className="w-full" size="lg">
              Contact Support
            </Button>
          </a>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">Powered by FanNu</p>
        </div>
      </div>

      <PoweredByFooter />
    </div>
  );
}
