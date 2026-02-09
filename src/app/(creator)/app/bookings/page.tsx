"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Inbox,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
const STATUS_TABS: { key: BookingStatus | "ALL"; label: string; icon?: React.ElementType }[] = [
  { key: "ALL", label: "All" },
  { key: "REQUESTED", label: "New", icon: AlertCircle },
  { key: "QUOTED", label: "Quoted" },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

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
const MOCK_BOOKINGS: Booking[] = [
  {
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
    notes: "Looking for a 2-hour live performance set for Valentine's Day celebration.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
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
    notes: "Corporate annual dinner event.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
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
    notes: "Brand collaboration for social media campaign.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
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
    notes: "Wedding reception performance.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
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
    notes: "Private birthday party.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
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
  {
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
  {
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
];

// Components
function StatsCard({
  label,
  value,
  icon: Icon,
  color = "default",
  subtext,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: "default" | "warning" | "success" | "primary";
  subtext?: string;
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      color === "warning" && "border-warning/20 bg-warning/5",
      color === "success" && "border-green-500/20 bg-green-500/5",
      color === "primary" && "border-primary/20 bg-primary/5",
      color === "default" && "border-border bg-card"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          color === "warning" && "bg-warning/10 text-warning",
          color === "success" && "bg-green-500/10 text-green-500",
          color === "primary" && "bg-primary/10 text-primary",
          color === "default" && "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const typeConfig = BOOKING_TYPE_CONFIG[booking.bookingType];
  const statusKey = BOOKING_STATUS_MAP[booking.status];
  const isUrgent = booking.status === "REQUESTED";

  const formatBudget = (min: number, max: number) => {
    const format = (n: number) => n >= 1000 ? `${(n/1000).toFixed(0)}K` : n.toString();
    return `ETB ${format(min)} - ${format(max)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Link
      href={`/app/bookings/${booking.id}`}
      className={cn(
        "group block rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg",
        isUrgent ? "border-warning/30 bg-warning/5" : "border-border"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
          isUrgent ? "bg-gradient-to-br from-warning to-orange-500" : "bg-gradient-to-br from-primary to-pink-500"
        )}>
          {booking.bookerName.split(" ").map(n => n[0]).join("")}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {booking.bookerName}
                </h3>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  typeConfig.className
                )}>
                  {typeConfig.label}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-foreground">
                {formatBudget(booking.budgetMin, booking.budgetMax)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={statusKey} type="booking" />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(booking.createdAt)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(booking.eventDate)} · {booking.eventStartTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {booking.venue || booking.location}
            </span>
          </div>

          {/* Notes preview */}
          {booking.notes && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
              {booking.notes}
            </p>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Reference code */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {booking.referenceCode}
        </span>
        {isUrgent && (
          <span className="flex items-center gap-1 text-xs font-medium text-warning">
            <Clock className="h-3 w-3" />
            Awaiting response
          </span>
        )}
      </div>
    </Link>
  );
}

// Empty state messages
const EMPTY_MESSAGES: Record<BookingStatus | "ALL", { title: string; description: string }> = {
  ALL: { title: "No bookings yet", description: "When you receive booking requests, they will appear here." },
  REQUESTED: { title: "No new requests", description: "New booking requests will appear here when fans reach out." },
  QUOTED: { title: "No pending quotes", description: "Bookings you've quoted will appear here." },
  CONFIRMED: { title: "No confirmed bookings", description: "Confirmed upcoming events will be listed here." },
  DEPOSIT_PAID: { title: "No deposits received", description: "Bookings with paid deposits will appear here." },
  COMPLETED: { title: "No completed bookings", description: "Your booking history will appear here." },
  CANCELLED: { title: "No cancelled bookings", description: "Cancelled booking requests will be listed here." },
  DECLINED: { title: "No declined bookings", description: "Declined booking requests will be listed here." },
};

export default function BookingsInboxPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const stats = useMemo(() => {
    const pending = MOCK_BOOKINGS.filter(b => b.status === "REQUESTED").length;
    const confirmed = MOCK_BOOKINGS.filter(b => b.status === "CONFIRMED" || b.status === "DEPOSIT_PAID").length;
    const totalValue = MOCK_BOOKINGS
      .filter(b => b.status === "CONFIRMED" || b.status === "DEPOSIT_PAID")
      .reduce((sum, b) => sum + b.budgetMax, 0);
    const completed = MOCK_BOOKINGS.filter(b => b.status === "COMPLETED").length;
    return { pending, confirmed, totalValue, completed };
  }, []);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...MOCK_BOOKINGS];

    // Status filter
    if (activeTab !== "ALL") {
      if (activeTab === "CONFIRMED") {
        filtered = filtered.filter(b => b.status === "CONFIRMED" || b.status === "DEPOSIT_PAID");
      } else {
        filtered = filtered.filter(b => b.status === activeTab);
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.bookerName.toLowerCase().includes(query) ||
        b.referenceCode.toLowerCase().includes(query) ||
        b.location.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return filtered;
  }, [activeTab, searchQuery]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: MOCK_BOOKINGS.length };
    MOCK_BOOKINGS.forEach(booking => {
      if (booking.status === "DEPOSIT_PAID") {
        counts.CONFIRMED = (counts.CONFIRMED || 0) + 1;
      } else {
        counts[booking.status] = (counts[booking.status] || 0) + 1;
      }
    });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Bookings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage incoming booking requests and appointments.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/app/settings">
            Booking Settings
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Pending Requests"
          value={stats.pending}
          icon={AlertCircle}
          color={stats.pending > 0 ? "warning" : "default"}
          subtext={stats.pending > 0 ? "Action needed" : undefined}
        />
        <StatsCard
          label="Confirmed"
          value={stats.confirmed}
          icon={CheckCircle2}
          color="success"
        />
        <StatsCard
          label="Pipeline Value"
          value={`ETB ${(stats.totalValue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="primary"
        />
        <StatsCard
          label="Completed"
          value={stats.completed}
          icon={Calendar}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, reference, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = statusCounts[tab.key] || 0;
          const showBadge = tab.key === "REQUESTED" && count > 0;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {tab.label}
              {showBadge ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-primary text-xs font-bold px-1">
                  {count}
                </span>
              ) : count > 0 && (
                <span className={cn(
                  "text-xs",
                  isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={activeTab === "ALL" ? Inbox : Calendar}
          title={searchQuery ? "No results found" : EMPTY_MESSAGES[activeTab].title}
          description={searchQuery ? `No bookings match "${searchQuery}"` : EMPTY_MESSAGES[activeTab].description}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredBookings.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filteredBookings.length} of {MOCK_BOOKINGS.length} bookings
        </p>
      )}
    </div>
  );
}
