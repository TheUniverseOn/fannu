"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, AlertTriangle, RefreshCw, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookingTable,
  AdminBooking,
  BookingStatus,
} from "@/components/admin/booking-table";
import { formatETB } from "@/lib/utils";

// Mock data with various booking states
const MOCK_BOOKINGS: AdminBooking[] = [
  {
    id: "1",
    referenceCode: "BK-A3F7",
    creatorId: "c1",
    creatorName: "Teddy Afro",
    creatorSlug: "teddy-afro",
    bookerName: "Abebe Kebede",
    bookerPhone: "+251911234567",
    bookerEmail: "abebe@example.com",
    bookingType: "LIVE_PERFORMANCE",
    status: "DISPUTED",
    eventDate: new Date("2025-03-15"),
    eventLocation: "Addis Ababa",
    eventVenue: "Millennium Hall",
    quoteAmount: 50000000, // 500,000 ETB
    depositAmount: 15000000, // 150,000 ETB
    depositStatus: "PAID",
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-02-05"),
    disputeReason: "Creator cancelled 2 days before the event without prior notice. Booker is requesting full deposit refund plus compensation.",
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Abebe Kebede",
        actorType: "booker",
        timestamp: new Date("2025-01-20T10:00:00"),
      },
      {
        id: "log2",
        action: "Quote sent: ETB 500,000",
        actor: "Teddy Afro",
        actorType: "creator",
        timestamp: new Date("2025-01-21T14:30:00"),
      },
      {
        id: "log3",
        action: "Deposit paid: ETB 150,000",
        actor: "Abebe Kebede",
        actorType: "booker",
        timestamp: new Date("2025-01-22T09:15:00"),
      },
      {
        id: "log4",
        action: "Booking confirmed",
        actor: "System",
        actorType: "system",
        timestamp: new Date("2025-01-22T09:15:00"),
      },
      {
        id: "log5",
        action: "Creator cancelled booking",
        actor: "Teddy Afro",
        actorType: "creator",
        timestamp: new Date("2025-03-13T18:00:00"),
        details: "Personal emergency",
      },
      {
        id: "log6",
        action: "Dispute opened by booker",
        actor: "Abebe Kebede",
        actorType: "booker",
        timestamp: new Date("2025-03-13T20:00:00"),
        details: "Requesting full refund plus compensation for venue cancellation fees",
      },
    ],
  },
  {
    id: "2",
    referenceCode: "BK-B8C2",
    creatorId: "c2",
    creatorName: "Aster Aweke",
    creatorSlug: "aster-aweke",
    bookerName: "Meron Getachew",
    bookerPhone: "+251922345678",
    bookingType: "MC_HOSTING",
    status: "REFUND_PENDING",
    eventDate: new Date("2025-02-28"),
    eventLocation: "Hawassa",
    eventVenue: "Haile Resort",
    quoteAmount: 10000000, // 100,000 ETB
    depositAmount: 3000000, // 30,000 ETB
    depositStatus: "PAID",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-02-01"),
    refundReason: "Event cancelled due to unforeseen circumstances. Mutual agreement for refund.",
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Meron Getachew",
        actorType: "booker",
        timestamp: new Date("2025-01-15T11:00:00"),
      },
      {
        id: "log2",
        action: "Quote sent: ETB 100,000",
        actor: "Aster Aweke",
        actorType: "creator",
        timestamp: new Date("2025-01-16T10:00:00"),
      },
      {
        id: "log3",
        action: "Deposit paid: ETB 30,000",
        actor: "Meron Getachew",
        actorType: "booker",
        timestamp: new Date("2025-01-17T14:00:00"),
      },
      {
        id: "log4",
        action: "Booking cancelled by booker",
        actor: "Meron Getachew",
        actorType: "booker",
        timestamp: new Date("2025-02-01T09:00:00"),
        details: "Event venue flooded, cannot proceed",
      },
      {
        id: "log5",
        action: "Refund approved by creator",
        actor: "Aster Aweke",
        actorType: "creator",
        timestamp: new Date("2025-02-01T11:00:00"),
      },
    ],
  },
  {
    id: "3",
    referenceCode: "BK-C5D9",
    creatorId: "c3",
    creatorName: "Gigi",
    creatorSlug: "gigi",
    bookerName: "Yohannes Tesfaye",
    bookerPhone: "+251933456789",
    bookerEmail: "yohannes@corp.com",
    bookingType: "BRAND_CONTENT",
    status: "CONFIRMED",
    eventDate: new Date("2025-04-10"),
    eventLocation: "Addis Ababa",
    eventVenue: "Sheraton Hotel",
    quoteAmount: 25000000, // 250,000 ETB
    depositAmount: 7500000, // 75,000 ETB
    depositStatus: "PAID",
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-03"),
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Yohannes Tesfaye",
        actorType: "booker",
        timestamp: new Date("2025-02-01T08:00:00"),
      },
      {
        id: "log2",
        action: "Quote sent: ETB 250,000",
        actor: "Gigi",
        actorType: "creator",
        timestamp: new Date("2025-02-02T16:00:00"),
      },
      {
        id: "log3",
        action: "Deposit paid: ETB 75,000",
        actor: "Yohannes Tesfaye",
        actorType: "booker",
        timestamp: new Date("2025-02-03T10:00:00"),
      },
      {
        id: "log4",
        action: "Booking confirmed",
        actor: "System",
        actorType: "system",
        timestamp: new Date("2025-02-03T10:00:00"),
      },
    ],
  },
  {
    id: "4",
    referenceCode: "BK-D1E4",
    creatorId: "c1",
    creatorName: "Teddy Afro",
    creatorSlug: "teddy-afro",
    bookerName: "Sara Bekele",
    bookerPhone: "+251944567890",
    bookingType: "LIVE_PERFORMANCE",
    status: "CANCELLED",
    eventDate: new Date("2025-02-20"),
    eventLocation: "Bahir Dar",
    eventVenue: "Blue Nile Hotel",
    quoteAmount: 40000000, // 400,000 ETB
    depositAmount: 12000000, // 120,000 ETB
    depositStatus: "PAID",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-25"),
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Sara Bekele",
        actorType: "booker",
        timestamp: new Date("2025-01-10T09:00:00"),
      },
      {
        id: "log2",
        action: "Quote sent: ETB 400,000",
        actor: "Teddy Afro",
        actorType: "creator",
        timestamp: new Date("2025-01-11T15:00:00"),
      },
      {
        id: "log3",
        action: "Deposit paid: ETB 120,000",
        actor: "Sara Bekele",
        actorType: "booker",
        timestamp: new Date("2025-01-12T11:00:00"),
      },
      {
        id: "log4",
        action: "Booking cancelled by booker",
        actor: "Sara Bekele",
        actorType: "booker",
        timestamp: new Date("2025-01-25T14:00:00"),
        details: "Budget constraints",
      },
    ],
  },
  {
    id: "5",
    referenceCode: "BK-E2F6",
    creatorId: "c4",
    creatorName: "Mahmoud Ahmed",
    creatorSlug: "mahmoud-ahmed",
    bookerName: "Daniel Alemu",
    bookerPhone: "+251955678901",
    bookingType: "CUSTOM",
    status: "DISPUTED",
    eventDate: new Date("2025-03-01"),
    eventLocation: "Dire Dawa",
    quoteAmount: 15000000, // 150,000 ETB
    depositAmount: 4500000, // 45,000 ETB
    depositStatus: "PAID",
    createdAt: new Date("2025-01-28"),
    updatedAt: new Date("2025-02-15"),
    disputeReason: "Performance duration was 30 minutes shorter than agreed. Booker requesting partial refund.",
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Daniel Alemu",
        actorType: "booker",
        timestamp: new Date("2025-01-28T10:00:00"),
      },
      {
        id: "log2",
        action: "Quote sent: ETB 150,000",
        actor: "Mahmoud Ahmed",
        actorType: "creator",
        timestamp: new Date("2025-01-29T12:00:00"),
      },
      {
        id: "log3",
        action: "Deposit paid: ETB 45,000",
        actor: "Daniel Alemu",
        actorType: "booker",
        timestamp: new Date("2025-01-30T09:00:00"),
      },
      {
        id: "log4",
        action: "Event completed",
        actor: "System",
        actorType: "system",
        timestamp: new Date("2025-03-01T23:00:00"),
      },
      {
        id: "log5",
        action: "Dispute opened by booker",
        actor: "Daniel Alemu",
        actorType: "booker",
        timestamp: new Date("2025-03-02T10:00:00"),
        details: "Performance was 2 hours instead of agreed 2.5 hours",
      },
    ],
  },
  {
    id: "6",
    referenceCode: "BK-F3G8",
    creatorId: "c2",
    creatorName: "Aster Aweke",
    creatorSlug: "aster-aweke",
    bookerName: "Tigist Hailu",
    bookerPhone: "+251966789012",
    bookerEmail: "tigist@gmail.com",
    bookingType: "LIVE_PERFORMANCE",
    status: "COMPLETED",
    eventDate: new Date("2025-01-25"),
    eventLocation: "Addis Ababa",
    eventVenue: "African Union Hall",
    quoteAmount: 80000000, // 800,000 ETB
    depositAmount: 24000000, // 240,000 ETB
    depositStatus: "PAID",
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2025-01-26"),
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Tigist Hailu",
        actorType: "booker",
        timestamp: new Date("2024-12-15T08:00:00"),
      },
      {
        id: "log2",
        action: "Quote sent: ETB 800,000",
        actor: "Aster Aweke",
        actorType: "creator",
        timestamp: new Date("2024-12-16T11:00:00"),
      },
      {
        id: "log3",
        action: "Deposit paid: ETB 240,000",
        actor: "Tigist Hailu",
        actorType: "booker",
        timestamp: new Date("2024-12-17T14:00:00"),
      },
      {
        id: "log4",
        action: "Booking confirmed",
        actor: "System",
        actorType: "system",
        timestamp: new Date("2024-12-17T14:00:00"),
      },
      {
        id: "log5",
        action: "Event completed successfully",
        actor: "System",
        actorType: "system",
        timestamp: new Date("2025-01-26T00:00:00"),
      },
    ],
  },
  {
    id: "7",
    referenceCode: "BK-G4H1",
    creatorId: "c3",
    creatorName: "Gigi",
    creatorSlug: "gigi",
    bookerName: "Henok Tadesse",
    bookerPhone: "+251977890123",
    bookingType: "MC_HOSTING",
    status: "QUOTED",
    eventDate: new Date("2025-05-01"),
    eventLocation: "Gondar",
    quoteAmount: 12000000, // 120,000 ETB
    depositAmount: 3600000, // 36,000 ETB
    depositStatus: "PENDING",
    createdAt: new Date("2025-02-10"),
    updatedAt: new Date("2025-02-11"),
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Henok Tadesse",
        actorType: "booker",
        timestamp: new Date("2025-02-10T09:00:00"),
      },
      {
        id: "log2",
        action: "Quote sent: ETB 120,000",
        actor: "Gigi",
        actorType: "creator",
        timestamp: new Date("2025-02-11T10:00:00"),
      },
    ],
  },
  {
    id: "8",
    referenceCode: "BK-H5I2",
    creatorId: "c5",
    creatorName: "Rophnan",
    creatorSlug: "rophnan",
    bookerName: "Kidist Mekonnen",
    bookerPhone: "+251988901234",
    bookerEmail: "kidist@events.com",
    bookingType: "LIVE_PERFORMANCE",
    status: "DEPOSIT_PAID",
    eventDate: new Date("2025-04-20"),
    eventLocation: "Addis Ababa",
    eventVenue: "Club Illusion",
    quoteAmount: 30000000, // 300,000 ETB
    depositAmount: 9000000, // 90,000 ETB
    depositStatus: "PAID",
    createdAt: new Date("2025-02-05"),
    updatedAt: new Date("2025-02-08"),
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Kidist Mekonnen",
        actorType: "booker",
        timestamp: new Date("2025-02-05T16:00:00"),
      },
      {
        id: "log2",
        action: "Quote sent: ETB 300,000",
        actor: "Rophnan",
        actorType: "creator",
        timestamp: new Date("2025-02-06T09:00:00"),
      },
      {
        id: "log3",
        action: "Deposit paid: ETB 90,000",
        actor: "Kidist Mekonnen",
        actorType: "booker",
        timestamp: new Date("2025-02-08T12:00:00"),
      },
    ],
  },
  {
    id: "9",
    referenceCode: "BK-I6J3",
    creatorId: "c4",
    creatorName: "Mahmoud Ahmed",
    creatorSlug: "mahmoud-ahmed",
    bookerName: "Bethlehem Getnet",
    bookerPhone: "+251999012345",
    bookingType: "CUSTOM",
    status: "REQUESTED",
    eventDate: new Date("2025-06-15"),
    eventLocation: "Jimma",
    quoteAmount: 0,
    depositAmount: 0,
    depositStatus: "PENDING",
    createdAt: new Date("2025-02-12"),
    updatedAt: new Date("2025-02-12"),
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Bethlehem Getnet",
        actorType: "booker",
        timestamp: new Date("2025-02-12T11:00:00"),
      },
    ],
  },
  {
    id: "10",
    referenceCode: "BK-J7K4",
    creatorId: "c5",
    creatorName: "Rophnan",
    creatorSlug: "rophnan",
    bookerName: "Solomon Girma",
    bookerPhone: "+251900123456",
    bookingType: "BRAND_CONTENT",
    status: "DECLINED",
    eventDate: new Date("2025-03-20"),
    eventLocation: "Addis Ababa",
    quoteAmount: 20000000, // 200,000 ETB
    depositAmount: 0,
    depositStatus: "PENDING",
    createdAt: new Date("2025-01-30"),
    updatedAt: new Date("2025-02-01"),
    eventLogs: [
      {
        id: "log1",
        action: "Booking created",
        actor: "Solomon Girma",
        actorType: "booker",
        timestamp: new Date("2025-01-30T14:00:00"),
      },
      {
        id: "log2",
        action: "Booking declined by creator",
        actor: "Rophnan",
        actorType: "creator",
        timestamp: new Date("2025-02-01T09:00:00"),
        details: "Schedule conflict with another event",
      },
    ],
  },
];

// Extract unique creators for the filter dropdown
const UNIQUE_CREATORS = Array.from(
  new Map(MOCK_BOOKINGS.map((b) => [b.creatorId, { id: b.creatorId, name: b.creatorName }])).values()
);

type FilterStatus = "ALL" | "DISPUTED" | "CANCELLED" | "REFUND_PENDING";

export default function AdminBookingManagementPage() {
  // Filters
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [creatorFilter, setCreatorFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Bookings state (in real app, this would come from API)
  const [bookings, setBookings] = useState<AdminBooking[]>(MOCK_BOOKINGS);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Status filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "CANCELLED") {
          if (booking.status !== "CANCELLED") return false;
        } else if (booking.status !== statusFilter) {
          return false;
        }
      }

      // Creator filter
      if (creatorFilter !== "ALL" && booking.creatorId !== creatorFilter) {
        return false;
      }

      // Date range filter
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (booking.eventDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (booking.eventDate > toDate) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesRef = booking.referenceCode.toLowerCase().includes(query);
        const matchesCreator = booking.creatorName.toLowerCase().includes(query);
        const matchesBooker = booking.bookerName.toLowerCase().includes(query);
        if (!matchesRef && !matchesCreator && !matchesBooker) return false;
      }

      return true;
    });
  }, [bookings, statusFilter, creatorFilter, dateFrom, dateTo, searchQuery]);

  // Stats calculations
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const activeDisputes = bookings.filter((b) => b.status === "DISPUTED").length;
    const pendingRefunds = bookings.filter((b) => b.status === "REFUND_PENDING").length;
    const totalRevenue = bookings
      .filter((b) => b.depositStatus === "PAID")
      .reduce((sum, b) => sum + b.depositAmount, 0);

    return { totalBookings, activeDisputes, pendingRefunds, totalRevenue };
  }, [bookings]);

  // Action handlers
  const handleResolveDispute = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "CONFIRMED" as BookingStatus,
              eventLogs: [
                ...b.eventLogs,
                {
                  id: `log-${Date.now()}`,
                  action: "Dispute resolved by admin",
                  actor: "Admin",
                  actorType: "admin" as const,
                  timestamp: new Date(),
                },
              ],
            }
          : b
      )
    );
  };

  const handleIssueRefund = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "REFUND_PENDING" as BookingStatus,
              eventLogs: [
                ...b.eventLogs,
                {
                  id: `log-${Date.now()}`,
                  action: "Refund initiated by admin",
                  actor: "Admin",
                  actorType: "admin" as const,
                  timestamp: new Date(),
                },
              ],
            }
          : b
      )
    );
  };

  const handleProcessRefund = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "CANCELLED" as BookingStatus,
              depositStatus: "REFUNDED" as const,
              eventLogs: [
                ...b.eventLogs,
                {
                  id: `log-${Date.now()}`,
                  action: "Refund processed by admin",
                  actor: "Admin",
                  actorType: "admin" as const,
                  timestamp: new Date(),
                  details: `Refunded ${formatETB(b.depositAmount)}`,
                },
              ],
            }
          : b
      )
    );
  };

  const handleOverrideStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: newStatus,
              eventLogs: [
                ...b.eventLogs,
                {
                  id: `log-${Date.now()}`,
                  action: `Status overridden to ${newStatus}`,
                  actor: "Admin",
                  actorType: "admin" as const,
                  timestamp: new Date(),
                },
              ],
            }
          : b
      )
    );
  };

  const handleSaveNotes = (bookingId: string, notes: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              adminNotes: notes,
              eventLogs: [
                ...b.eventLogs,
                {
                  id: `log-${Date.now()}`,
                  action: "Admin notes updated",
                  actor: "Admin",
                  actorType: "admin" as const,
                  timestamp: new Date(),
                },
              ],
            }
          : b
      )
    );
  };

  const clearFilters = () => {
    setStatusFilter("ALL");
    setCreatorFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
  };

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    creatorFilter !== "ALL" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    searchQuery !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Booking Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Handle disputes, refunds, and manage all platform bookings.
        </p>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalBookings}
              </p>
            </div>
          </div>
        </div>

        {/* Active Disputes */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Disputes</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeDisputes}
                </p>
                {stats.activeDisputes > 0 && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    Needs attention
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Refunds */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <RefreshCw className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Refunds</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingRefunds}
                </p>
                {stats.pendingRefunds > 0 && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                    Action required
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatETB(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by ref, creator, or booker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DISPUTED">Disputed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="REFUND_PENDING">Refund Pending</SelectItem>
            </SelectContent>
          </Select>

          {/* Creator Filter */}
          <Select value={creatorFilter} onValueChange={setCreatorFilter}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder="Filter by creator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Creators</SelectItem>
              {UNIQUE_CREATORS.map((creator) => (
                <SelectItem key={creator.id} value={creator.id}>
                  {creator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-9 w-[150px]"
                placeholder="From"
              />
            </div>
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
              placeholder="To"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="whitespace-nowrap">
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      {/* Booking Table */}
      {filteredBookings.length > 0 ? (
        <BookingTable
          bookings={filteredBookings}
          onResolveDispute={handleResolveDispute}
          onIssueRefund={handleIssueRefund}
          onProcessRefund={handleProcessRefund}
          onOverrideStatus={handleOverrideStatus}
          onSaveNotes={handleSaveNotes}
        />
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No bookings found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {hasActiveFilters
              ? "Try adjusting your filters to see more results."
              : "There are no bookings in the system yet."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
