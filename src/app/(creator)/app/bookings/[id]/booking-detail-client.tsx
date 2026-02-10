"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  User,
  Send,
  Check,
  X,
  Loader2,
  MessageSquare,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatRelativeTime } from "@/lib/utils";
import { sendQuote, declineBooking, confirmBooking, completeBooking } from "@/lib/actions/bookings";
import type { Tables } from "@/types/database";

// ============================================================================
// TYPES
// ============================================================================

export type BookingWithDetails = Tables<"bookings"> & {
  creator: Tables<"creators">;
  quotes: Tables<"booking_quotes">[];
  payments: Tables<"booking_payments">[];
};

type BookingType = "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";

// ============================================================================
// CONFIG
// ============================================================================

const BOOKING_TYPE_CONFIG: Record<BookingType, { label: string; className: string }> = {
  LIVE_PERFORMANCE: { label: "Live Performance", className: "bg-primary/10 text-primary" },
  MC_HOSTING: { label: "MC / Hosting", className: "bg-blue-500/10 text-blue-500" },
  BRAND_CONTENT: { label: "Brand Content", className: "bg-pink-500/10 text-pink-500" },
  CUSTOM: { label: "Custom", className: "bg-muted text-muted-foreground" },
};

const BOOKING_STATUS_MAP: Record<string, string> = {
  REQUESTED: "pending",
  QUOTED: "quoted",
  DEPOSIT_PAID: "deposit_paid",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DECLINED: "rejected",
};

// ============================================================================
// COMPONENTS
// ============================================================================

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground truncate">{value}</p>
      </div>
      {href && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:bg-muted/50 rounded-lg -mx-2 px-2 transition-colors">
        {content}
      </a>
    );
  }
  return content;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BookingDetailClient({ booking }: { booking: BookingWithDetails }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Quote form state
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [depositPercent, setDepositPercent] = useState("30");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const typeConfig = BOOKING_TYPE_CONFIG[booking.type as BookingType] || BOOKING_TYPE_CONFIG.CUSTOM;
  const statusKey = BOOKING_STATUS_MAP[booking.status] || "pending";
  const isActionable = booking.status === "REQUESTED" || booking.status === "QUOTED";
  const activeQuote = booking.quotes.find((q) => q.status === "ACTIVE");

  const formatBudget = (min: number | null, max: number | null) => {
    const format = (n: number) => `ETB ${n.toLocaleString()}`;
    if (!min && !max) return "Not specified";
    if (!min) return `Up to ${format(max!)}`;
    if (!max) return `From ${format(min)}`;
    return `${format(min)} - ${format(max)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSendQuote = async () => {
    if (!quoteAmount) return;
    setSubmitting(true);

    const totalAmount = parseFloat(quoteAmount) * 100; // Convert to cents
    const depositPct = parseFloat(depositPercent);
    const depositAmount = Math.round(totalAmount * (depositPct / 100));

    startTransition(async () => {
      const result = await sendQuote(booking.id, {
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        deposit_percent: depositPct,
        deposit_refundable: true,
        terms_text: quoteMessage,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

      setSubmitting(false);
      if (!result.error) {
        setShowQuoteForm(false);
        router.refresh();
      }
    });
  };

  const handleDecline = async () => {
    setSubmitting(true);

    startTransition(async () => {
      const result = await declineBooking(booking.id, declineReason);
      setSubmitting(false);
      if (!result.error) {
        setShowDeclineForm(false);
        router.refresh();
      }
    });
  };

  const handleConfirm = async () => {
    setSubmitting(true);

    startTransition(async () => {
      await confirmBooking(booking.id);
      setSubmitting(false);
      router.refresh();
    });
  };

  const handleComplete = async () => {
    setSubmitting(true);

    startTransition(async () => {
      await completeBooking(booking.id);
      setSubmitting(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app/bookings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{booking.booker_name}</h1>
              <StatusBadge status={statusKey} type="booking" />
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                typeConfig.className
              )}>
                {typeConfig.label}
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {booking.reference_code}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(new Date(booking.created_at))}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isActionable && !showQuoteForm && !showDeclineForm && (
          <div className="flex items-center gap-2">
            {booking.status === "REQUESTED" && (
              <>
                <Button variant="outline" onClick={() => setShowDeclineForm(true)} disabled={submitting || isPending}>
                  <X className="mr-2 h-4 w-4" />
                  Decline
                </Button>
                <Button onClick={() => setShowQuoteForm(true)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Quote
                </Button>
              </>
            )}
            {booking.status === "QUOTED" && (
              <Button onClick={handleConfirm} disabled={submitting || isPending}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Confirmed
              </Button>
            )}
          </div>
        )}

        {booking.status === "DEPOSIT_PAID" && (
          <Button onClick={handleConfirm} disabled={submitting || isPending}>
            <Check className="mr-2 h-4 w-4" />
            Confirm Booking
          </Button>
        )}

        {booking.status === "CONFIRMED" && (
          <Button onClick={handleComplete} disabled={submitting || isPending}>
            <Check className="mr-2 h-4 w-4" />
            Mark as Completed
          </Button>
        )}
      </div>

      {/* Quote Form */}
      {showQuoteForm && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="font-semibold text-foreground mb-4">Send Quote</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quoteAmount">Quote Amount (ETB)</Label>
              <Input
                id="quoteAmount"
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="Enter your quote"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depositPercent">Deposit Percentage</Label>
              <Input
                id="depositPercent"
                type="number"
                min="0"
                max="100"
                value={depositPercent}
                onChange={(e) => setDepositPercent(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="quoteMessage">Terms & Conditions (Optional)</Label>
              <Textarea
                id="quoteMessage"
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                placeholder="Add any notes or terms for the client..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowQuoteForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendQuote} disabled={submitting || !quoteAmount || isPending}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Send Quote</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Decline Form */}
      {showDeclineForm && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <h3 className="font-semibold text-foreground mb-4">Decline Booking</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="declineReason">Reason (Optional)</Label>
              <Textarea
                id="declineReason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Let the booker know why you're declining..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeclineForm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDecline} disabled={submitting || isPending}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Declining...</>
              ) : (
                <><X className="mr-2 h-4 w-4" />Decline Booking</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Active Quote Info */}
      {activeQuote && booking.status === "QUOTED" && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Quote Sent</p>
              <p className="text-sm text-muted-foreground mt-1">
                You quoted ETB {(activeQuote.total_amount / 100).toLocaleString()} with a {activeQuote.deposit_percent}% deposit.
                Waiting for client response.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <InfoCard title="Event Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={Calendar}
                label="Event Date"
                value={formatDate(booking.start_at)}
              />
              <InfoRow
                icon={Clock}
                label="Time"
                value={booking.end_at
                  ? `${formatTime(booking.start_at)} - ${formatTime(booking.end_at)}`
                  : formatTime(booking.start_at)
                }
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={booking.location_venue
                  ? `${booking.location_venue}, ${booking.location_city}`
                  : booking.location_city
                }
              />
              <InfoRow
                icon={DollarSign}
                label="Budget Range"
                value={formatBudget(booking.budget_min, booking.budget_max)}
              />
            </div>
          </InfoCard>

          {/* Notes */}
          {booking.notes && (
            <InfoCard title="Notes from Client">
              <p className="text-muted-foreground whitespace-pre-wrap">{booking.notes}</p>
            </InfoCard>
          )}

          {/* Activity Timeline */}
          <InfoCard title="Activity">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{booking.booker_name}</span> submitted booking request
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(new Date(booking.created_at))}</p>
                </div>
              </div>
              {booking.quotes.map((quote) => (
                <div key={quote.id} className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">You</span> sent a quote for ETB {(quote.total_amount / 100).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(new Date(quote.created_at))}</p>
                  </div>
                </div>
              ))}
              {booking.status === "DECLINED" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <X className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">You</span> declined the booking
                    </p>
                    {booking.decline_reason && (
                      <p className="text-xs text-muted-foreground mt-1">{booking.decline_reason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </InfoCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Info */}
          <InfoCard title="Contact Information">
            <div className="space-y-1">
              <InfoRow
                icon={User}
                label="Name"
                value={booking.booker_name}
              />
              {booking.booker_phone && (
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={booking.booker_phone}
                  href={`tel:${booking.booker_phone}`}
                />
              )}
              {booking.booker_email && (
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={booking.booker_email}
                  href={`mailto:${booking.booker_email}`}
                />
              )}
            </div>
          </InfoCard>

          {/* Quick Actions */}
          <InfoCard title="Quick Actions">
            <div className="space-y-2">
              {booking.booker_phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`https://wa.me/${booking.booker_phone.replace(/\+/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message on WhatsApp
                  </a>
                </Button>
              )}
              {booking.booker_phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${booking.booker_phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Client
                  </a>
                </Button>
              )}
              {booking.booker_email && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${booking.booker_email}?subject=Re: Booking ${booking.reference_code}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </Button>
              )}
            </div>
          </InfoCard>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Budget Range</span>
                <span className="font-semibold text-foreground">
                  {formatBudget(booking.budget_min, booking.budget_max)}
                </span>
              </div>
              {booking.end_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">
                    {formatTime(booking.start_at)} - {formatTime(booking.end_at)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={statusKey} type="booking" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
