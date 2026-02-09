"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  AlertTriangle,
  RefreshCw,
  Clock,
  Calendar,
  MapPin,
  Phone,
  User,
  X,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatETB, formatDate, formatDateTime } from "@/lib/utils";

// Types
export type BookingType = "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
export type BookingStatus =
  | "REQUESTED"
  | "QUOTED"
  | "DEPOSIT_PAID"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "DECLINED"
  | "DISPUTED"
  | "REFUND_PENDING";

export type DepositStatus = "PENDING" | "PAID" | "REFUNDED" | "PARTIAL";

export interface EventLog {
  id: string;
  action: string;
  actor: string;
  actorType: "admin" | "creator" | "booker" | "system";
  timestamp: Date;
  details?: string;
}

export interface AdminBooking {
  id: string;
  referenceCode: string;
  creatorId: string;
  creatorName: string;
  creatorSlug: string;
  bookerName: string;
  bookerPhone: string;
  bookerEmail?: string;
  bookingType: BookingType;
  status: BookingStatus;
  eventDate: Date;
  eventLocation: string;
  eventVenue?: string;
  quoteAmount: number; // in cents
  depositAmount: number; // in cents
  depositStatus: DepositStatus;
  createdAt: Date;
  updatedAt: Date;
  disputeReason?: string;
  refundReason?: string;
  adminNotes?: string;
  eventLogs: EventLog[];
}

// Config
const BOOKING_TYPE_CONFIG: Record<BookingType, { label: string; className: string }> = {
  LIVE_PERFORMANCE: {
    label: "Live Performance",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  },
  MC_HOSTING: {
    label: "MC / Hosting",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  },
  BRAND_CONTENT: {
    label: "Brand Content",
    className: "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
  },
  CUSTOM: {
    label: "Custom",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
};

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  REQUESTED: {
    label: "Requested",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  QUOTED: {
    label: "Quoted",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  },
  DEPOSIT_PAID: {
    label: "Deposit Paid",
    className: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  },
  DECLINED: {
    label: "Declined",
    className: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  },
  DISPUTED: {
    label: "Disputed",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  },
  REFUND_PENDING: {
    label: "Refund Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
};

const DEPOSIT_STATUS_CONFIG: Record<DepositStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  PAID: {
    label: "Paid",
    className: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
  PARTIAL: {
    label: "Partial",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  },
};

const ALL_STATUSES: BookingStatus[] = [
  "REQUESTED",
  "QUOTED",
  "DEPOSIT_PAID",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "DECLINED",
  "DISPUTED",
  "REFUND_PENDING",
];

// Helper functions
function maskPhoneNumber(phone: string): string {
  if (phone.length < 6) return phone;
  const start = phone.slice(0, 4);
  const end = phone.slice(-2);
  return `${start}****${end}`;
}

function formatActorType(type: string): string {
  const labels: Record<string, string> = {
    admin: "Admin",
    creator: "Creator",
    booker: "Booker",
    system: "System",
  };
  return labels[type] || type;
}

// StatusBadge component
function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

// BookingDetailModal component
interface BookingDetailModalProps {
  booking: AdminBooking;
  isOpen: boolean;
  onClose: () => void;
  onResolveDispute: (bookingId: string) => void;
  onIssueRefund: (bookingId: string) => void;
  onProcessRefund: (bookingId: string) => void;
  onOverrideStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onSaveNotes: (bookingId: string, notes: string) => void;
}

function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  onResolveDispute,
  onIssueRefund,
  onProcessRefund,
  onOverrideStatus,
  onSaveNotes,
}: BookingDetailModalProps) {
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || "");
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "">("");

  if (!isOpen) return null;

  const typeConfig = BOOKING_TYPE_CONFIG[booking.bookingType];
  const statusConfig = STATUS_CONFIG[booking.status];
  const depositConfig = DEPOSIT_STATUS_CONFIG[booking.depositStatus];

  const handleSaveNotes = () => {
    onSaveNotes(booking.id, adminNotes);
  };

  const handleOverrideStatus = () => {
    if (selectedStatus) {
      onOverrideStatus(booking.id, selectedStatus);
      setSelectedStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl mx-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {booking.referenceCode}
            </span>
            <StatusBadge {...statusConfig} />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dispute/Refund Warning */}
          {(booking.status === "DISPUTED" || booking.status === "REFUND_PENDING") && (
            <div
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg",
                booking.status === "DISPUTED"
                  ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5 mt-0.5",
                  booking.status === "DISPUTED"
                    ? "text-orange-500"
                    : "text-yellow-500"
                )}
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {booking.status === "DISPUTED" ? "Dispute Details" : "Refund Pending"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {booking.disputeReason || booking.refundReason || "No additional details provided."}
                </p>
              </div>
            </div>
          )}

          {/* Booking Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Creator Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4" />
                Creator
              </h3>
              <div className="pl-6 space-y-2 text-sm">
                <p className="text-gray-900 dark:text-white font-medium">
                  {booking.creatorName}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  @{booking.creatorSlug}
                </p>
              </div>
            </div>

            {/* Booker Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4" />
                Booker
              </h3>
              <div className="pl-6 space-y-2 text-sm">
                <p className="text-gray-900 dark:text-white font-medium">
                  {booking.bookerName}
                </p>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {booking.bookerPhone}
                </p>
                {booking.bookerEmail && (
                  <p className="text-gray-500 dark:text-gray-400">
                    {booking.bookerEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Details
              </h3>
              <div className="pl-6 space-y-2 text-sm">
                <p className="text-gray-900 dark:text-white">
                  {formatDate(booking.eventDate)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {booking.eventLocation}
                  {booking.eventVenue && ` - ${booking.eventVenue}`}
                </p>
                <StatusBadge {...typeConfig} />
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payment
              </h3>
              <div className="pl-6 space-y-2 text-sm">
                <p className="text-gray-900 dark:text-white">
                  Quote: {formatETB(booking.quoteAmount)}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Deposit: {formatETB(booking.depositAmount)}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <StatusBadge {...depositConfig} />
                </div>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Event Log
            </h3>
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {booking.eventLogs.map((log, index) => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-start gap-3 p-3 text-sm",
                      index !== booking.eventLogs.length - 1 &&
                        "border-b border-gray-200 dark:border-gray-800"
                    )}
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">
                        {log.action}
                      </p>
                      {log.details && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatDateTime(log.timestamp)}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs">
                        {log.actor} ({formatActorType(log.actorType)})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Admin Notes
            </h3>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this booking..."
              rows={3}
            />
            <Button onClick={handleSaveNotes} size="sm">
              Save Notes
            </Button>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Admin Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {booking.status === "DISPUTED" && (
                <>
                  <Button
                    onClick={() => onResolveDispute(booking.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Resolve Dispute
                  </Button>
                  <Button
                    onClick={() => onIssueRefund(booking.id)}
                    variant="destructive"
                  >
                    Issue Refund
                  </Button>
                </>
              )}
              {booking.status === "REFUND_PENDING" && (
                <Button
                  onClick={() => onProcessRefund(booking.id)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Process Refund
                </Button>
              )}
              {(booking.status === "CANCELLED" && booking.depositStatus === "PAID") && (
                <Button
                  onClick={() => onProcessRefund(booking.id)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Process Refund
                </Button>
              )}

              {/* Override Status */}
              <div className="flex items-center gap-2">
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as BookingStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Override Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.filter((s) => s !== booking.status).map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_CONFIG[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleOverrideStatus}
                  disabled={!selectedStatus}
                  variant="outline"
                >
                  Override
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main BookingTable component
interface BookingTableProps {
  bookings: AdminBooking[];
  onResolveDispute: (bookingId: string) => void;
  onIssueRefund: (bookingId: string) => void;
  onProcessRefund: (bookingId: string) => void;
  onOverrideStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onSaveNotes: (bookingId: string, notes: string) => void;
}

export function BookingTable({
  bookings,
  onResolveDispute,
  onIssueRefund,
  onProcessRefund,
  onOverrideStatus,
  onSaveNotes,
}: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [sortField, setSortField] = useState<"createdAt" | "eventDate">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aValue = a[sortField].getTime();
      const bValue = b[sortField].getTime();
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [bookings, sortField, sortDirection]);

  const toggleSort = (field: "createdAt" | "eventDate") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: "createdAt" | "eventDate" }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <>
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Creator
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Booker
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => toggleSort("eventDate")}
              >
                <span className="flex items-center gap-1">
                  Event Date
                  <SortIcon field="eventDate" />
                </span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Deposit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => toggleSort("createdAt")}
              >
                <span className="flex items-center gap-1">
                  Created
                  <SortIcon field="createdAt" />
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
            {sortedBookings.map((booking) => {
              const typeConfig = BOOKING_TYPE_CONFIG[booking.bookingType];
              const statusConfig = STATUS_CONFIG[booking.status];
              const depositConfig = DEPOSIT_STATUS_CONFIG[booking.depositStatus];

              return (
                <tr
                  key={booking.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
                    booking.status === "DISPUTED" && "bg-orange-50/50 dark:bg-orange-900/10",
                    booking.status === "REFUND_PENDING" && "bg-yellow-50/50 dark:bg-yellow-900/10"
                  )}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {booking.referenceCode}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {booking.creatorName}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {booking.bookerName}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                      {maskPhoneNumber(booking.bookerPhone)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge {...typeConfig} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatDate(booking.eventDate)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatETB(booking.quoteAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge {...depositConfig} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge {...statusConfig} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(booking.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:ml-2">View</span>
                      </Button>
                      {booking.status === "DISPUTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          onClick={() => onResolveDispute(booking.id)}
                        >
                          Resolve
                        </Button>
                      )}
                      {booking.status === "REFUND_PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          onClick={() => onProcessRefund(booking.id)}
                        >
                          Refund
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onResolveDispute={onResolveDispute}
          onIssueRefund={onIssueRefund}
          onProcessRefund={onProcessRefund}
          onOverrideStatus={onOverrideStatus}
          onSaveNotes={onSaveNotes}
        />
      )}
    </>
  );
}

// Export types for use in page
export type { BookingTableProps };
