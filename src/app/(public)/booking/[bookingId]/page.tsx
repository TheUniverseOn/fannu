"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { formatETB } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type BookingStatus =
  | "REQUESTED"
  | "QUOTED"
  | "DEPOSIT_PAID"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "DECLINED"
  | "DISPUTED";

type QuoteStatus = "ACTIVE" | "EXPIRED" | "SUPERSEDED" | "ACCEPTED";

interface BookingWithQuote {
  id: string;
  reference_code: string;
  status: BookingStatus;
  type: "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
  start_at: string;
  end_at?: string;
  location_city: string;
  location_venue?: string;
  notes: string;
  booker_name: string;
  booker_phone: string;
  creator: {
    id: string;
    slug: string;
    display_name: string;
    avatar_url: string | null;
    phone: string;
  };
  quote?: {
    id: string;
    status: QuoteStatus;
    total_amount: number;
    deposit_amount: number;
    deposit_percent: number;
    deposit_refundable: boolean;
    terms_text?: string;
    expires_at: string;
    created_at: string;
  };
  decline_reason?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_BOOKINGS: Record<string, BookingWithQuote> = {
  "bk-a3f7": {
    id: "bk-a3f7",
    reference_code: "BK-A3F7",
    status: "QUOTED",
    type: "LIVE_PERFORMANCE",
    start_at: "2025-03-15T20:00:00Z",
    end_at: "2025-03-15T23:00:00Z",
    location_city: "Addis Ababa",
    location_venue: "Millennium Hall",
    notes:
      "Corporate event for 500 attendees. Full band setup required. 3-hour performance with one 15-minute break.",
    booker_name: "Abebe Kebede",
    booker_phone: "+251911234567",
    creator: {
      id: "c1",
      slug: "teddy-afro",
      display_name: "Teddy Afro",
      avatar_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
      phone: "+251912345678",
    },
    quote: {
      id: "q1",
      status: "ACTIVE",
      total_amount: 50000000, // 500,000 ETB
      deposit_amount: 15000000, // 150,000 ETB
      deposit_percent: 30,
      deposit_refundable: true,
      terms_text:
        "Payment of remaining balance due 3 days before event. Sound system and stage to be provided by venue. Creator will arrive 1 hour before performance start.",
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  "bk-b8c2": {
    id: "bk-b8c2",
    reference_code: "BK-B8C2",
    status: "QUOTED",
    type: "MC_HOSTING",
    start_at: "2025-02-28T18:00:00Z",
    end_at: "2025-02-28T22:00:00Z",
    location_city: "Hawassa",
    location_venue: "Haile Resort",
    notes: "Wedding reception. Bilingual hosting in Amharic and English.",
    booker_name: "Meron Getachew",
    booker_phone: "+251922345678",
    creator: {
      id: "c2",
      slug: "aster-aweke",
      display_name: "Aster Aweke",
      avatar_url:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
      phone: "+251923456789",
    },
    quote: {
      id: "q2",
      status: "EXPIRED",
      total_amount: 10000000, // 100,000 ETB
      deposit_amount: 3000000, // 30,000 ETB
      deposit_percent: 30,
      deposit_refundable: false,
      terms_text: "Transportation to venue to be provided by booker.",
      expires_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  "bk-c5d9": {
    id: "bk-c5d9",
    reference_code: "BK-C5D9",
    status: "DECLINED",
    type: "BRAND_CONTENT",
    start_at: "2025-04-10T10:00:00Z",
    location_city: "Addis Ababa",
    notes: "Social media content creation for product launch.",
    booker_name: "Yohannes Tesfaye",
    booker_phone: "+251933456789",
    creator: {
      id: "c3",
      slug: "gigi",
      display_name: "Gigi",
      avatar_url:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
      phone: "+251934567890",
    },
    decline_reason:
      "Unfortunately, I am not available during that period due to international tour commitments. Please feel free to submit a new request for dates after May 2025.",
  },
  "bk-d1e4": {
    id: "bk-d1e4",
    reference_code: "BK-D1E4",
    status: "CANCELLED",
    type: "LIVE_PERFORMANCE",
    start_at: "2025-02-20T20:00:00Z",
    location_city: "Bahir Dar",
    location_venue: "Blue Nile Hotel",
    notes: "Birthday celebration performance.",
    booker_name: "Sara Bekele",
    booker_phone: "+251944567890",
    creator: {
      id: "c1",
      slug: "teddy-afro",
      display_name: "Teddy Afro",
      avatar_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
      phone: "+251912345678",
    },
  },
  "bk-e2f6": {
    id: "bk-e2f6",
    reference_code: "BK-E2F6",
    status: "DEPOSIT_PAID",
    type: "LIVE_PERFORMANCE",
    start_at: "2025-04-20T21:00:00Z",
    end_at: "2025-04-21T01:00:00Z",
    location_city: "Addis Ababa",
    location_venue: "Club Illusion",
    notes: "Album launch party performance.",
    booker_name: "Kidist Mekonnen",
    booker_phone: "+251988901234",
    creator: {
      id: "c5",
      slug: "rophnan",
      display_name: "Rophnan",
      avatar_url:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces",
      phone: "+251987654321",
    },
    quote: {
      id: "q5",
      status: "ACCEPTED",
      total_amount: 30000000, // 300,000 ETB
      deposit_amount: 9000000, // 90,000 ETB
      deposit_percent: 30,
      deposit_refundable: true,
      terms_text:
        "Full setup with DJ equipment provided. Remaining balance due on event day.",
      expires_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
};

// ============================================================================
// HELPERS
// ============================================================================

const BOOKING_TYPE_LABELS: Record<string, string> = {
  LIVE_PERFORMANCE: "Live Performance",
  MC_HOSTING: "MC / Hosting",
  BRAND_CONTENT: "Brand Content",
  CUSTOM: "Custom",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateRange(start: string, end?: string): string {
  const startDate = formatDate(start);
  const startTime = formatTime(start);

  if (!end) return `${startDate} at ${startTime}`;

  const endTime = formatTime(end);
  return `${startDate}, ${startTime} – ${endTime}`;
}

function getTimeUntilExpiry(expiresAt: string): {
  expired: boolean;
  text: string;
  urgent: boolean;
} {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) {
    return { expired: true, text: "Expired", urgent: false };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return {
      expired: false,
      text: `Expires in ${days} day${days > 1 ? "s" : ""}`,
      urgent: days <= 1,
    };
  }

  if (hours > 0) {
    return {
      expired: false,
      text: `Expires in ${hours} hour${hours > 1 ? "s" : ""}`,
      urgent: true,
    };
  }

  const minutes = Math.floor(diff / (1000 * 60));
  return {
    expired: false,
    text: `Expires in ${minutes} minute${minutes > 1 ? "s" : ""}`,
    urgent: true,
  };
}

// ============================================================================
// COMPONENTS
// ============================================================================

function BookingNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-card border border-border">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Booking Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          This booking doesn&apos;t exist or the link has expired. Please
          contact support if you believe this is an error.
        </p>
        <a
          href="https://wa.me/251911000000?text=Hi, I need help finding my booking"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block"
        >
          <Button variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </a>
      </div>
    </div>
  );
}

function CancellationPolicy({
  refundable,
}: {
  refundable: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        refundable
          ? "border-green-500/30 bg-green-500/10"
          : "border-red-500/30 bg-red-500/10"
      )}
    >
      <div className="flex items-start gap-3">
        {refundable ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
        )}
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              refundable ? "text-green-500" : "text-red-500"
            )}
          >
            {refundable ? "Deposit is refundable" : "Deposit is non-refundable"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {refundable
              ? "You can request a full deposit refund if you cancel more than 24 hours before the event. Non-refundable within 24 hours."
              : "Once paid, the deposit cannot be refunded regardless of cancellation."}
          </p>
        </div>
      </div>
    </div>
  );
}

function DeclineForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Why are you declining this quote?
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional: Let the creator know why you're declining..."
          rows={3}
          disabled={submitting}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => onSubmit(reason)}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Declining...
            </>
          ) : (
            "Confirm Decline"
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function QuotePage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params.bookingId as string).toLowerCase();
  const booking = MOCK_BOOKINGS[bookingId];

  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [decliningQuote, setDecliningQuote] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  if (!booking) {
    return <BookingNotFound />;
  }

  const { creator, quote } = booking;

  // Handle pay deposit
  const handlePayDeposit = async () => {
    setRedirectingToPayment(true);
    // Simulate redirect delay
    await new Promise((r) => setTimeout(r, 1500));
    // In real app, redirect to payment provider
    router.push(`/r/${bookingId}-receipt`);
  };

  // Handle decline
  const handleDecline = async () => {
    setDecliningQuote(true);
    await new Promise((r) => setTimeout(r, 1500));
    // In real app, call API to decline
    router.push(`/c/${creator.slug}`);
  };

  // Determine quote expiry status
  const expiryInfo = quote?.expires_at
    ? getTimeUntilExpiry(quote.expires_at)
    : null;
  const isExpired =
    quote?.status === "EXPIRED" || (expiryInfo?.expired ?? false);

  // Render different states
  if (booking.status === "DECLINED") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
          {/* Creator Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
              {creator.avatar_url && (
                <Image
                  src={creator.avatar_url}
                  alt={creator.display_name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {creator.display_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Ref: {booking.reference_code}
              </p>
            </div>
          </div>

          {/* Declined Message */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-foreground">
              Booking Declined
            </h1>
            <p className="mt-2 text-muted-foreground">
              The creator is unable to accept this booking.
            </p>
            {booking.decline_reason && (
              <div className="mt-4 rounded-lg bg-background/50 p-4 text-left">
                <p className="text-sm text-foreground">
                  {booking.decline_reason}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <Link href={`/c/${creator.slug}`} className="mt-6 block">
            <Button variant="outline" className="w-full" size="lg">
              Back to {creator.display_name}&apos;s Profile
            </Button>
          </Link>
        </div>
        <PoweredByFooter />
      </div>
    );
  }

  if (booking.status === "CANCELLED") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
          {/* Cancelled Message */}
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Booking Cancelled
            </h1>
            <p className="mt-2 text-muted-foreground">
              This booking has been cancelled.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Reference: {booking.reference_code}
            </p>
          </div>

          {/* CTA */}
          <Link href={`/c/${creator.slug}`} className="mt-6 block">
            <Button variant="outline" className="w-full" size="lg">
              Back to {creator.display_name}&apos;s Profile
            </Button>
          </Link>
        </div>
        <PoweredByFooter />
      </div>
    );
  }

  if (booking.status === "DEPOSIT_PAID" || booking.status === "CONFIRMED") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
          {/* Success State */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Booking Confirmed!
            </h1>
            <p className="mt-2 text-muted-foreground">
              Your deposit has been received. You can now contact{" "}
              {creator.display_name} directly.
            </p>
          </div>

          {/* Reference */}
          <div className="mb-6 rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground">Booking Reference</p>
            <p className="text-lg font-bold tracking-wider text-foreground">
              {booking.reference_code}
            </p>
          </div>

          {/* Event Details */}
          <div className="mb-6 rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {formatDateRange(booking.start_at, booking.end_at)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {booking.location_venue
                  ? `${booking.location_venue}, ${booking.location_city}`
                  : booking.location_city}
              </span>
            </div>
          </div>

          {/* Contact Creator */}
          <a
            href={`https://wa.me/${creator.phone.replace(/[^0-9]/g, "")}?text=Hi ${creator.display_name}, I'm ${booking.booker_name}. My booking reference is ${booking.reference_code}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full" size="lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Message {creator.display_name} on WhatsApp
            </Button>
          </a>

          {/* Remaining Balance */}
          {quote && (
            <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Remaining Balance
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatETB(quote.total_amount - quote.deposit_amount)} due
                    separately as agreed with {creator.display_name}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <PoweredByFooter />
      </div>
    );
  }

  // QUOTED status - show quote for review
  if (!quote) {
    return <BookingNotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
        {/* Section 1: Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
            {creator.avatar_url && (
              <Image
                src={creator.avatar_url}
                alt={creator.display_name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {creator.display_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Ref: {booking.reference_code}
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {BOOKING_TYPE_LABELS[booking.type]}
          </span>
        </div>

        {/* Section 2: Booking Summary */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Booking Details
          </h3>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {formatDateRange(booking.start_at, booking.end_at)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {booking.location_venue
                ? `${booking.location_venue}, ${booking.location_city}`
                : booking.location_city}
            </span>
          </div>
          {booking.notes && (
            <p className="text-sm text-muted-foreground border-t border-border pt-3">
              {booking.notes}
            </p>
          )}
        </div>

        {/* Section 3: Price Breakdown */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Quote from {creator.display_name}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span
                className={cn(
                  "text-lg font-bold",
                  isExpired ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {formatETB(quote.total_amount)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-foreground font-medium">
                Deposit ({quote.deposit_percent}%)
              </span>
              <span
                className={cn(
                  "text-lg font-bold",
                  isExpired ? "text-muted-foreground line-through" : "text-primary"
                )}
              >
                {formatETB(quote.deposit_amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining balance</span>
              <span className="text-muted-foreground">
                {formatETB(quote.total_amount - quote.deposit_amount)} — due
                separately
              </span>
            </div>
          </div>

          {/* Expiry Timer */}
          {expiryInfo && (
            <div
              className={cn(
                "mt-4 flex items-center gap-2 text-sm",
                expiryInfo.expired
                  ? "text-red-500"
                  : expiryInfo.urgent
                    ? "text-orange-500"
                    : "text-muted-foreground"
              )}
            >
              <Clock className="h-4 w-4" />
              <span>{expiryInfo.text}</span>
            </div>
          )}
        </div>

        {/* Section 4: Terms */}
        <div className="mb-6 space-y-4">
          {/* Cancellation Policy - PROMINENT */}
          <CancellationPolicy refundable={quote.deposit_refundable} />

          {/* Additional Terms */}
          {quote.terms_text && (
            <div className="rounded-xl border border-border bg-card">
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-foreground">
                  Additional Terms
                </span>
                {showTerms ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {showTerms && (
                <div className="border-t border-border p-4">
                  <p className="text-sm text-muted-foreground">
                    {quote.terms_text}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Merchant Note */}
          <p className="text-xs text-muted-foreground text-center">
            Payment processed by FanNu on behalf of {creator.display_name}
          </p>
        </div>

        {/* Section 5: Actions */}
        {isExpired ? (
          <div className="space-y-4">
            <Button variant="secondary" className="w-full" size="lg" disabled>
              This quote has expired
            </Button>
            <a
              href="https://wa.me/251911000000?text=Hi, I need to request a new quote for my booking"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full" size="lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact support for a new quote
              </Button>
            </a>
          </div>
        ) : showDeclineForm ? (
          <DeclineForm
            onSubmit={handleDecline}
            onCancel={() => setShowDeclineForm(false)}
            submitting={decliningQuote}
          />
        ) : (
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayDeposit}
              disabled={redirectingToPayment}
            >
              {redirectingToPayment ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting to payment...
                </>
              ) : (
                `Pay Deposit — ${formatETB(quote.deposit_amount)}`
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-red-500"
              size="lg"
              onClick={() => setShowDeclineForm(true)}
              disabled={redirectingToPayment}
            >
              Decline Quote
            </Button>
          </div>
        )}

        {/* Section 6: Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Having issues?{" "}
            <a
              href={`https://wa.me/251911000000?text=Hi, I need help with booking ${booking.reference_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>

      <PoweredByFooter />
    </div>
  );
}
