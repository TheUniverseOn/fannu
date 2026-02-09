"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  FileText,
  Paperclip,
  Send,
  CheckCircle2,
  XCircle,
  DollarSign,
  AlertCircle,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import type { Booking } from "./booking-inbox-row";
import { BOOKING_STATUS_MAP } from "./booking-inbox-row";

// Quote interface
export interface Quote {
  id: string;
  amount: number;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  sentAt: Date;
  expiresAt?: Date;
  respondedAt?: Date;
}

// Event log entry interface
export interface EventLogEntry {
  id: string;
  type:
    | "created"
    | "quote_sent"
    | "quote_accepted"
    | "quote_declined"
    | "deposit_paid"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "declined"
    | "message";
  description: string;
  timestamp: Date;
  actor?: string;
  metadata?: Record<string, unknown>;
}

// Extended booking with quotes and events
export interface BookingDetail extends Booking {
  quotes: Quote[];
  eventLog: EventLogEntry[];
}

// Booking type labels
const BOOKING_TYPE_LABELS: Record<string, string> = {
  LIVE_PERFORMANCE: "Live Performance",
  MC_HOSTING: "MC / Hosting",
  BRAND_CONTENT: "Brand Content",
  CUSTOM: "Custom Request",
};

// Quote status config
const QUOTE_STATUS_CONFIG: Record<Quote["status"], { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  },
  DECLINED: {
    label: "Declined",
    className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
};

// Event log icon mapping
const EVENT_LOG_ICONS: Record<EventLogEntry["type"], typeof Calendar> = {
  created: FileText,
  quote_sent: Send,
  quote_accepted: CheckCircle2,
  quote_declined: XCircle,
  deposit_paid: DollarSign,
  confirmed: CheckCircle2,
  completed: CheckCircle2,
  cancelled: XCircle,
  declined: XCircle,
  message: Mail,
};

const EVENT_LOG_COLORS: Record<EventLogEntry["type"], string> = {
  created: "text-blue-500",
  quote_sent: "text-purple-500",
  quote_accepted: "text-green-500",
  quote_declined: "text-red-500",
  deposit_paid: "text-green-500",
  confirmed: "text-green-500",
  completed: "text-green-500",
  cancelled: "text-red-500",
  declined: "text-red-500",
  message: "text-blue-500",
};

// ===== Section Components =====

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className }: SectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {title}
      </h2>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        {children}
      </div>
    </div>
  );
}

// ===== Header Section =====

interface BookingHeaderProps {
  booking: BookingDetail;
}

export function BookingHeader({ booking }: BookingHeaderProps) {
  const statusKey = BOOKING_STATUS_MAP[booking.status];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {booking.referenceCode}
          </span>
          <StatusBadge status={statusKey} type="booking" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {booking.bookerName}
        </h1>
      </div>
    </div>
  );
}

// ===== Booker Info Section =====

interface BookerInfoProps {
  booking: BookingDetail;
}

export function BookerInfo({ booking }: BookerInfoProps) {
  return (
    <Section title="Booker Information">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{booking.bookerName}</p>
          </div>
        </div>
        {booking.bookerPhone && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4" />
            <span>{booking.bookerPhone}</span>
          </div>
        )}
        {booking.bookerEmail && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <span>{booking.bookerEmail}</span>
          </div>
        )}
      </div>
    </Section>
  );
}

// ===== Event Details Section =====

interface EventDetailsProps {
  booking: BookingDetail;
}

export function EventDetails({ booking }: EventDetailsProps) {
  const formattedDate = booking.eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Section title="Event Details">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {BOOKING_TYPE_LABELS[booking.bookingType] || booking.bookingType}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
            <p className="font-medium text-gray-900 dark:text-white">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {booking.eventStartTime} - {booking.eventEndTime}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
            <p className="font-medium text-gray-900 dark:text-white">{booking.location}</p>
          </div>
        </div>

        {booking.venue && (
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Venue</p>
              <p className="font-medium text-gray-900 dark:text-white">{booking.venue}</p>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// ===== Budget Section =====

interface BudgetSectionProps {
  booking: BookingDetail;
}

export function BudgetSection({ booking }: BudgetSectionProps) {
  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <Section title="Budget">
      <div className="flex items-center gap-3">
        <DollarSign className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Budget Range</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            ETB {formatAmount(booking.budgetMin)} - {formatAmount(booking.budgetMax)}
          </p>
        </div>
      </div>
    </Section>
  );
}

// ===== Request Notes Section =====

interface RequestNotesProps {
  booking: BookingDetail;
}

export function RequestNotes({ booking }: RequestNotesProps) {
  if (!booking.notes) {
    return (
      <Section title="Request Notes">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No additional notes provided.
        </p>
      </Section>
    );
  }

  return (
    <Section title="Request Notes">
      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{booking.notes}</p>
    </Section>
  );
}

// ===== Attachments Section =====

interface AttachmentsSectionProps {
  booking: BookingDetail;
}

export function AttachmentsSection({ booking }: AttachmentsSectionProps) {
  if (!booking.attachments || booking.attachments.length === 0) {
    return (
      <Section title="Attachments">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No attachments.</p>
      </Section>
    );
  }

  return (
    <Section title="Attachments">
      <ul className="space-y-2">
        {booking.attachments.map((attachment, index) => (
          <li key={index}>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Paperclip className="h-4 w-4" />
              {attachment.name}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ===== Quote History Section =====

interface QuoteHistoryProps {
  quotes: Quote[];
}

export function QuoteHistory({ quotes }: QuoteHistoryProps) {
  if (quotes.length === 0) {
    return (
      <Section title="Quote History">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No quotes sent yet.</p>
      </Section>
    );
  }

  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <Section title="Quote History">
      <div className="space-y-4">
        {quotes.map((quote) => {
          const statusConfig = QUOTE_STATUS_CONFIG[quote.status];
          return (
            <div
              key={quote.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    ETB {formatAmount(quote.amount)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      statusConfig.className
                    )}
                  >
                    {statusConfig.label}
                  </span>
                </div>
                {quote.message && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{quote.message}</p>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Sent {formatRelativeTime(quote.sentAt)}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ===== Event Log Section =====

interface EventLogSectionProps {
  events: EventLogEntry[];
}

export function EventLogSection({ events }: EventLogSectionProps) {
  if (events.length === 0) {
    return (
      <Section title="Event Log">
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No events recorded.</p>
      </Section>
    );
  }

  return (
    <Section title="Event Log">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-4">
          {events.map((event) => {
            const Icon = EVENT_LOG_ICONS[event.type] || AlertCircle;
            const iconColor = EVENT_LOG_COLORS[event.type] || "text-gray-500";

            return (
              <div key={event.id} className="relative flex items-start gap-4 pl-1">
                <div
                  className={cn(
                    "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
                    iconColor
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-gray-900 dark:text-white">{event.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatRelativeTime(event.timestamp)}
                    {event.actor && ` by ${event.actor}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

// ===== Action Buttons =====

interface BookingActionsProps {
  booking: BookingDetail;
  onSendQuote?: () => void;
  onResendQuote?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onMarkCompleted?: () => void;
}

export function BookingActions({
  booking,
  onSendQuote,
  onResendQuote,
  onDecline,
  onCancel,
  onMarkCompleted,
}: BookingActionsProps) {
  const renderActions = () => {
    switch (booking.status) {
      case "REQUESTED":
        return (
          <>
            <Button onClick={onSendQuote} className="flex-1 sm:flex-none">
              <Send className="h-4 w-4 mr-2" />
              Send Quote
            </Button>
            <Button variant="outline" onClick={onDecline} className="flex-1 sm:flex-none">
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </>
        );

      case "QUOTED":
        return (
          <>
            <Button variant="outline" onClick={onResendQuote} className="flex-1 sm:flex-none">
              <Send className="h-4 w-4 mr-2" />
              Resend Quote
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        );

      case "DEPOSIT_PAID":
      case "CONFIRMED":
        return (
          <>
            <Button onClick={onMarkCompleted} className="flex-1 sm:flex-none">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Completed
            </Button>
            <Button variant="destructive" onClick={onCancel} className="flex-1 sm:flex-none">
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Booking
            </Button>
          </>
        );

      case "COMPLETED":
      case "CANCELLED":
      case "DECLINED":
        return null;

      default:
        return null;
    }
  };

  const actions = renderActions();

  if (!actions) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
      {actions}
    </div>
  );
}

// ===== Loading Skeleton =====

export function BookingDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Section skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
