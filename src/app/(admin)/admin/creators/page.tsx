"use client";

import { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatorTable, Creator, CreatorStatus } from "@/components/admin/creator-table";
import { EmptyState } from "@/components/shared/empty-state";

// Mock data with 10 creators in various states
const mockCreators: Creator[] = [
  {
    id: "1",
    name: "Abebe Bikila",
    slug: "abebe-bikila",
    avatar: null,
    phone: "+251912345678",
    email: "abebe@example.com",
    status: "active",
    bookingEnabled: true,
    bookingApproved: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Tirunesh Dibaba",
    slug: "tirunesh-dibaba",
    avatar: null,
    phone: "+251923456789",
    email: "tirunesh@example.com",
    status: "active",
    bookingEnabled: true,
    bookingApproved: true,
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    name: "Haile Gebrselassie",
    slug: "haile-g",
    avatar: null,
    phone: "+251934567890",
    email: "haile@example.com",
    status: "pending_approval",
    bookingEnabled: false,
    bookingApproved: false,
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "4",
    name: "Meseret Defar",
    slug: "meseret-defar",
    avatar: null,
    phone: "+251945678901",
    email: "meseret@example.com",
    status: "pending_approval",
    bookingEnabled: false,
    bookingApproved: false,
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "5",
    name: "Kenenisa Bekele",
    slug: "kenenisa",
    avatar: null,
    phone: "+251956789012",
    email: "kenenisa@example.com",
    status: "active",
    bookingEnabled: false,
    bookingApproved: true,
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "6",
    name: "Derartu Tulu",
    slug: "derartu-tulu",
    avatar: null,
    phone: "+251967890123",
    email: "derartu@example.com",
    status: "suspended",
    bookingEnabled: false,
    bookingApproved: false,
    createdAt: new Date("2023-12-05"),
  },
  {
    id: "7",
    name: "Almaz Ayana",
    slug: "almaz-ayana",
    avatar: null,
    phone: "+251978901234",
    email: "almaz@example.com",
    status: "active",
    bookingEnabled: true,
    bookingApproved: true,
    createdAt: new Date("2024-02-28"),
  },
  {
    id: "8",
    name: "Feyisa Lilesa",
    slug: "feyisa",
    avatar: null,
    phone: "+251989012345",
    email: "feyisa@example.com",
    status: "pending_approval",
    bookingEnabled: false,
    bookingApproved: false,
    createdAt: new Date("2024-03-18"),
  },
  {
    id: "9",
    name: "Genzebe Dibaba",
    slug: "genzebe",
    avatar: null,
    phone: "+251990123456",
    email: "genzebe@example.com",
    status: "suspended",
    bookingEnabled: false,
    bookingApproved: true,
    createdAt: new Date("2023-11-20"),
  },
  {
    id: "10",
    name: "Letesenbet Gidey",
    slug: "letesenbet",
    avatar: null,
    phone: "+251901234567",
    email: "letesenbet@example.com",
    status: "active",
    bookingEnabled: true,
    bookingApproved: false,
    createdAt: new Date("2024-03-01"),
  },
];

type StatusFilter = "all" | CreatorStatus;

interface StatCardProps {
  label: string;
  value: number;
  variant?: "default" | "warning";
}

function StatCard({ label, value, variant = "default" }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {variant === "warning" && value > 0 && (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
            {value}
          </span>
        )}
      </div>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function CreatorManagementPage() {
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate stats
  const stats = useMemo(() => {
    const total = creators.length;
    const pending = creators.filter((c) => c.status === "pending_approval").length;
    const active = creators.filter((c) => c.status === "active").length;
    const suspended = creators.filter((c) => c.status === "suspended").length;
    return { total, pending, active, suspended };
  }, [creators]);

  // Filter creators
  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      // Status filter
      if (statusFilter !== "all" && creator.status !== statusFilter) {
        return false;
      }

      // Search filter (by name or slug)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = creator.name.toLowerCase().includes(query);
        const matchesSlug = creator.slug.toLowerCase().includes(query);
        if (!matchesName && !matchesSlug) {
          return false;
        }
      }

      return true;
    });
  }, [creators, statusFilter, searchQuery]);

  // Action handlers
  const handleApprove = (id: string) => {
    setCreators((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "active" as CreatorStatus } : c
      )
    );
  };

  const handleReject = (id: string) => {
    // In a real app, this might delete the creator or set a different status
    setCreators((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSuspend = (id: string) => {
    setCreators((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "suspended" as CreatorStatus, bookingEnabled: false }
          : c
      )
    );
  };

  const handleReactivate = (id: string) => {
    setCreators((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "active" as CreatorStatus } : c
      )
    );
  };

  const handleToggleBooking = (id: string, enabled: boolean) => {
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, bookingEnabled: enabled } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Creator Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage all creators on the platform.
        </p>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Creators" value={stats.total} />
        <StatCard label="Pending Approval" value={stats.pending} variant="warning" />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Suspended" value={stats.suspended} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredCreators.length} of {creators.length} creators
        </p>
      </div>

      {/* Table or Empty State */}
      {filteredCreators.length > 0 ? (
        <div className="rounded-lg border bg-card">
          <CreatorTable
            creators={filteredCreators}
            onApprove={handleApprove}
            onReject={handleReject}
            onSuspend={handleSuspend}
            onReactivate={handleReactivate}
            onToggleBooking={handleToggleBooking}
            className="p-4"
          />
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <EmptyState
            icon={Users}
            title="No creators match this filter"
            description="Try adjusting your search or filter criteria to find what you're looking for."
          />
        </div>
      )}
    </div>
  );
}
