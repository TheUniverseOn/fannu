"use client";

import Link from "next/link";
import { MapPin, Calendar, Clock } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

// Booking types
export type BookingType = "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
export type BookingStatus =
  | "REQUESTED"
  | "QUOTED"
  | "DEPOSIT_PAID"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "DECLINED";

export interface Booking {
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
  attachments?: { name: string; url: string }[];
  createdAt: Date;
  updatedAt: Date;
}

// Booking type labels and colors (FanNu design system)
const BOOKING_TYPE_CONFIG: Record<BookingType, { label: string; className: string }> = {
  LIVE_PERFORMANCE: {
    label: "Live Performance",
    className: "bg-fannu-purple/20 text-fannu-purple",
  },
  MC_HOSTING: {
    label: "MC / Hosting",
    className: "bg-fannu-blue/20 text-fannu-blue",
  },
  BRAND_CONTENT: {
    label: "Brand Content",
    className: "bg-fannu-pink/20 text-fannu-pink",
  },
  CUSTOM: {
    label: "Custom",
    className: "bg-muted text-muted-foreground",
  },
};

// Booking status to StatusBadge mapping
export const BOOKING_STATUS_MAP: Record<BookingStatus, string> = {
  REQUESTED: "pending",
  QUOTED: "quoted",
  DEPOSIT_PAID: "deposit_paid",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DECLINED: "rejected",
};

interface BookingInboxRowProps {
  booking: Booking;
  className?: string;
}

function formatEventDateTime(date: Date, startTime: string, endTime: string): string {
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formattedDate} · ${startTime}-${endTime}`;
}

function formatBudgetRange(min: number, max: number): string {
  const formatAmount = (amount: number) =>
    amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return `ETB ${formatAmount(min)} - ${formatAmount(max)}`;
}

export function BookingInboxRow({ booking, className }: BookingInboxRowProps) {
  const typeConfig = BOOKING_TYPE_CONFIG[booking.bookingType];
  const statusKey = BOOKING_STATUS_MAP[booking.status];

  return (
    <Link
      href={`/app/bookings/${booking.id}`}
      className={cn(
        "block rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-glow-purple hover:border-primary/30 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        {/* Left side - Main info */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Top row: Booker name and badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display font-semibold text-foreground truncate">
              {booking.bookerName}
            </h3>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                typeConfig.className
              )}
            >
              {typeConfig.label}
            </span>
            <StatusBadge status={statusKey} type="booking" showDot />
          </div>

          {/* Event details */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatEventDateTime(
                booking.eventDate,
                booking.eventStartTime,
                booking.eventEndTime
              )}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {booking.location}
            </span>
          </div>

          {/* Budget range */}
          <p className="text-sm font-bold text-foreground">
            {formatBudgetRange(booking.budgetMin, booking.budgetMax)}
          </p>
        </div>

        {/* Right side - Reference code and time */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1.5 text-right">
          <span className="font-mono text-xs text-muted-foreground bg-elevated px-2.5 py-1 rounded-lg">
            {booking.referenceCode}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(booking.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Skeleton row for loading state
export function BookingInboxRowSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-32 bg-elevated rounded" />
            <div className="h-5 w-24 bg-elevated rounded-full" />
            <div className="h-5 w-20 bg-elevated rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-44 bg-elevated rounded" />
            <div className="h-4 w-24 bg-elevated rounded" />
          </div>
          <div className="h-4 w-36 bg-elevated rounded" />
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-2">
          <div className="h-6 w-20 bg-elevated rounded-lg" />
          <div className="h-4 w-16 bg-elevated rounded" />
        </div>
      </div>
    </div>
  );
}
