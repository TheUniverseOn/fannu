"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  User,
  FileText,
  Send,
  Check,
  X,
  Loader2,
  MessageSquare,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatRelativeTime } from "@/lib/utils";

// Types
type BookingType = "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
type BookingStatus =
  | "REQUESTED"
  | "QUOTED"
  | "DEPOSIT_PAID"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "DECLINED";

interface Booking {
  id: string;
  referenceCode: string;
  bookerName: string;
  bookerPhone?: string;
  bookerEmail?: string;
  bookingType: BookingType;
  status: BookingStatus;
  eventDate: Date;
  eventStartTime: string;
  eventEndTime: string;
  location: string;
  venue?: string;
  budgetMin: number;
  budgetMax: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Config
const BOOKING_TYPE_CONFIG: Record<BookingType, { label: string; className: string }> = {
  LIVE_PERFORMANCE: { label: "Live Performance", className: "bg-primary/10 text-primary" },
  MC_HOSTING: { label: "MC / Hosting", className: "bg-blue-500/10 text-blue-500" },
  BRAND_CONTENT: { label: "Brand Content", className: "bg-pink-500/10 text-pink-500" },
  CUSTOM: { label: "Custom", className: "bg-muted text-muted-foreground" },
};

const BOOKING_STATUS_MAP: Record<BookingStatus, string> = {
  REQUESTED: "pending",
  QUOTED: "quoted",
  DEPOSIT_PAID: "deposit_paid",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DECLINED: "rejected",
};

// Mock data
const MOCK_BOOKINGS: Record<string, Booking> = {
  "bk-001": {
    id: "bk-001",
    referenceCode: "BK-A3F2",
    bookerName: "Abebe Kebede",
    bookerPhone: "+251911234567",
    bookerEmail: "abebe@example.com",
    bookingType: "LIVE_PERFORMANCE",
    status: "REQUESTED",
    eventDate: new Date("2026-02-14"),
    eventStartTime: "7pm",
    eventEndTime: "11pm",
    location: "Addis Ababa",
    venue: "Millennium Hall",
    budgetMin: 15000,
    budgetMax: 50000,
    notes: "Looking for a 2-hour live performance set for Valentine's Day celebration. This is a corporate event with approximately 500 guests. We need full band setup including sound equipment. Please include your technical requirements in the quote.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  "bk-002": {
    id: "bk-002",
    referenceCode: "BK-X7K9",
    bookerName: "Sara Tadesse",
    bookerPhone: "+251922345678",
    bookerEmail: "sara.t@gmail.com",
    bookingType: "MC_HOSTING",
    status: "QUOTED",
    eventDate: new Date("2026-02-20"),
    eventStartTime: "6pm",
    eventEndTime: "10pm",
    location: "Addis Ababa",
    venue: "Sheraton Hotel",
    budgetMin: 25000,
    budgetMax: 40000,
    notes: "Corporate annual dinner event. Need an engaging MC who can handle both formal and entertainment segments.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  "bk-003": {
    id: "bk-003",
    referenceCode: "BK-M2P5",
    bookerName: "Dawit Haile",
    bookerPhone: "+251933456789",
    bookingType: "BRAND_CONTENT",
    status: "CONFIRMED",
    eventDate: new Date("2026-02-25"),
    eventStartTime: "10am",
    eventEndTime: "4pm",
    location: "Addis Ababa",
    venue: "Studio Location TBD",
    budgetMin: 30000,
    budgetMax: 75000,
    notes: "Brand collaboration for social media campaign. Looking for 3-5 Instagram posts and 2 TikTok videos.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  "bk-004": {
    id: "bk-004",
    referenceCode: "BK-J8N3",
    bookerName: "Meron Alemu",
    bookerEmail: "meron.alemu@company.et",
    bookingType: "LIVE_PERFORMANCE",
    status: "DEPOSIT_PAID",
    eventDate: new Date("2026-03-01"),
    eventStartTime: "8pm",
    eventEndTime: "12am",
    location: "Hawassa",
    venue: "Lewi Resort",
    budgetMin: 50000,
    budgetMax: 100000,
    notes: "Wedding reception performance. Looking for a 3-hour set with mix of traditional and modern music.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  "bk-005": {
    id: "bk-005",
    referenceCode: "BK-Q4R1",
    bookerName: "Yonas Girma",
    bookerPhone: "+251944567890",
    bookingType: "CUSTOM",
    status: "REQUESTED",
    eventDate: new Date("2026-02-18"),
    eventStartTime: "3pm",
    eventEndTime: "5pm",
    location: "Bahir Dar",
    budgetMin: 10000,
    budgetMax: 25000,
    notes: "Private birthday party for my daughter. Looking for a short acoustic set.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  "bk-006": {
    id: "bk-006",
    referenceCode: "BK-L6T8",
    bookerName: "Helen Tesfaye",
    bookerPhone: "+251955678901",
    bookerEmail: "helen.t@outlook.com",
    bookingType: "MC_HOSTING",
    status: "COMPLETED",
    eventDate: new Date("2026-01-28"),
    eventStartTime: "5pm",
    eventEndTime: "9pm",
    location: "Addis Ababa",
    venue: "Hyatt Regency",
    budgetMin: 20000,
    budgetMax: 35000,
    notes: "NGO fundraising gala dinner.",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  "bk-007": {
    id: "bk-007",
    referenceCode: "BK-W9V2",
    bookerName: "Kidist Bekele",
    bookingType: "BRAND_CONTENT",
    status: "CANCELLED",
    eventDate: new Date("2026-02-10"),
    eventStartTime: "9am",
    eventEndTime: "1pm",
    location: "Addis Ababa",
    budgetMin: 15000,
    budgetMax: 30000,
    notes: "Product launch video content.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  "bk-008": {
    id: "bk-008",
    referenceCode: "BK-F5H7",
    bookerName: "Solomon Desta",
    bookerPhone: "+251966789012",
    bookingType: "LIVE_PERFORMANCE",
    status: "QUOTED",
    eventDate: new Date("2026-03-08"),
    eventStartTime: "9pm",
    eventEndTime: "2am",
    location: "Dire Dawa",
    venue: "Ras Hotel",
    budgetMin: 40000,
    budgetMax: 80000,
    notes: "Club night performance.",
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
};

// Components
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

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const booking = MOCK_BOOKINGS[bookingId];

  // Quote form state
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [depositPercent, setDepositPercent] = useState("30");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Booking not found</h2>
        <p className="text-muted-foreground mt-1">This booking doesn't exist or has been deleted.</p>
        <Button className="mt-4" onClick={() => router.push("/app/bookings")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Button>
      </div>
    );
  }

  const typeConfig = BOOKING_TYPE_CONFIG[booking.bookingType];
  const statusKey = BOOKING_STATUS_MAP[booking.status];
  const isActionable = booking.status === "REQUESTED" || booking.status === "QUOTED";

  const formatBudget = (min: number, max: number) => {
    const format = (n: number) => `ETB ${n.toLocaleString()}`;
    return `${format(min)} - ${format(max)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSendQuote = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setShowQuoteForm(false);
    router.push("/app/bookings");
  };

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this booking request?")) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    router.push("/app/bookings");
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    router.push("/app/bookings");
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
              <h1 className="text-2xl font-bold text-foreground">{booking.bookerName}</h1>
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
                {booking.referenceCode}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(booking.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {isActionable && (
          <div className="flex items-center gap-2">
            {booking.status === "REQUESTED" && (
              <>
                <Button variant="outline" onClick={handleDecline} disabled={submitting}>
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
              <Button onClick={handleConfirm} disabled={submitting}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Confirmed
              </Button>
            )}
          </div>
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
              <Label htmlFor="quoteMessage">Message (Optional)</Label>
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
            <Button onClick={handleSendQuote} disabled={submitting || !quoteAmount}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" />Send Quote</>
              )}
            </Button>
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
                value={formatDate(booking.eventDate)}
              />
              <InfoRow
                icon={Clock}
                label="Time"
                value={`${booking.eventStartTime} - ${booking.eventEndTime}`}
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={booking.venue ? `${booking.venue}, ${booking.location}` : booking.location}
              />
              <InfoRow
                icon={DollarSign}
                label="Budget Range"
                value={formatBudget(booking.budgetMin, booking.budgetMax)}
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
                    <span className="font-medium">{booking.bookerName}</span> submitted booking request
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(booking.createdAt)}</p>
                </div>
              </div>
              {booking.status !== "REQUESTED" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">You</span> sent a quote
                    </p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(booking.updatedAt)}</p>
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
                value={booking.bookerName}
              />
              {booking.bookerPhone && (
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={booking.bookerPhone}
                  href={`tel:${booking.bookerPhone}`}
                />
              )}
              {booking.bookerEmail && (
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={booking.bookerEmail}
                  href={`mailto:${booking.bookerEmail}`}
                />
              )}
            </div>
          </InfoCard>

          {/* Quick Actions */}
          <InfoCard title="Quick Actions">
            <div className="space-y-2">
              {booking.bookerPhone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`https://wa.me/${booking.bookerPhone.replace(/\+/g, "")}`} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message on WhatsApp
                  </a>
                </Button>
              )}
              {booking.bookerPhone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${booking.bookerPhone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Client
                  </a>
                </Button>
              )}
              {booking.bookerEmail && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${booking.bookerEmail}?subject=Re: Booking ${booking.referenceCode}`}>
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
                  {formatBudget(booking.budgetMin, booking.budgetMax)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">
                  {booking.eventStartTime} - {booking.eventEndTime}
                </span>
              </div>
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
