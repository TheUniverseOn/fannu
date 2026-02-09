"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Plus,
  Sparkles,
  Users,
  ShoppingCart,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn, formatETB, formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDrop } from "@/lib/actions/drops";

// Types
type DropStatus = "draft" | "scheduled" | "live" | "ended" | "cancelled";
type DropType = "EVENT" | "MERCH" | "CONTENT" | "CUSTOM";

interface Drop {
  id: string;
  slug: string;
  title: string;
  type: DropType;
  status: DropStatus;
  price_cents: number;
  cover_url: string | null;
  quantity_limit: number | null;
  quantity_sold: number;
  vip_count: number;
  total_revenue_cents: number;
  views: number;
  created_at: string;
  scheduled_at?: string;
}

interface Stats {
  liveDrops: number;
  totalRevenue: number;
  totalSales: number;
  totalVips: number;
}

type StatusFilter = "all" | DropStatus;
type SortOrder = "newest" | "oldest" | "revenue" | "sales";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Draft" },
  { value: "ended", label: "Ended" },
];

const TYPE_COLORS: Record<DropType, string> = {
  EVENT: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  MERCH: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONTENT: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  CUSTOM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

// Components
function DropCard({
  drop,
  onCopyLink,
  onDelete
}: {
  drop: Drop;
  onCopyLink: (slug: string) => void;
  onDelete: (id: string) => void;
}) {
  const progress = drop.quantity_limit
    ? Math.round((drop.quantity_sold / drop.quantity_limit) * 100)
    : null;
  const isSoldOut = drop.quantity_limit && drop.quantity_sold >= drop.quantity_limit;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
      {/* Cover Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {drop.cover_url ? (
          <Image
            src={drop.cover_url}
            alt={drop.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
            TYPE_COLORS[drop.type]
          )}>
            {drop.type}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={drop.status} type="drop" />
        </div>

        {/* Progress bar for limited drops */}
        {progress !== null && (
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center justify-between text-xs text-white mb-1">
              <span>{drop.quantity_sold}/{drop.quantity_limit} sold</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isSoldOut ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {drop.title}
            </h3>
            <p className="mt-1 text-lg font-bold text-foreground">
              {drop.price_cents > 0 ? formatETB(drop.price_cents) : "Free"}
            </p>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 relative z-10">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/app/drops/${drop.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/app/drops/${drop.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Drop
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopyLink(drop.slug)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/d/${drop.slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public Page
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(drop.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">{drop.views.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Views</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">{drop.vip_count}</p>
            <p className="text-xs text-muted-foreground">VIPs</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <ShoppingCart className="h-3.5 w-3.5" />
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">{drop.quantity_sold}</p>
            <p className="text-xs text-muted-foreground">Sales</p>
          </div>
        </div>

        {/* Revenue */}
        {drop.total_revenue_cents > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-2">
            <span className="text-sm text-green-500">Revenue</span>
            <span className="font-semibold text-green-500">{formatETB(drop.total_revenue_cents)}</span>
          </div>
        )}

        {/* Date */}
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {drop.status === "scheduled" && drop.scheduled_at
            ? `Scheduled for ${formatDate(drop.scheduled_at)}`
            : `Created ${formatDate(drop.created_at)}`
          }
        </div>
      </div>

      {/* Clickable overlay */}
      <Link href={`/app/drops/${drop.id}`} className="absolute inset-0 z-0" />
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "default"
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  color?: "default" | "primary" | "success";
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4",
      color === "primary" && "border-primary/20 bg-primary/5",
      color === "success" && "border-green-500/20 bg-green-500/5",
      color === "default" && "border-border bg-card"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          color === "primary" && "bg-primary/10 text-primary",
          color === "success" && "bg-green-500/10 text-green-500",
          color === "default" && "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        {trend && (
          <span className="ml-auto text-sm font-medium text-green-500">{trend}</span>
        )}
      </div>
    </div>
  );
}

interface DropsListClientProps {
  initialDrops: Drop[];
  stats: Stats;
}

export function DropsListClient({ initialDrops, stats }: DropsListClientProps) {
  const router = useRouter();
  const [drops, setDrops] = useState(initialDrops);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/d/${slug}`;
    await navigator.clipboard.writeText(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this drop? This action cannot be undone.")) {
      return;
    }

    const result = await deleteDrop(id);
    if (!result.error) {
      setDrops(drops.filter(d => d.id !== id));
    }
  };

  // Filter and sort drops
  const filteredDrops = useMemo(() => {
    let filtered = [...drops];

    if (statusFilter !== "all") {
      filtered = filtered.filter((drop) => drop.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "revenue":
          return b.total_revenue_cents - a.total_revenue_cents;
        case "sales":
          return b.quantity_sold - a.quantity_sold;
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [drops, statusFilter, sortOrder]);

  // Count drops by status
  const statusCounts = useMemo(() => {
    return drops.reduce((acc, drop) => {
      acc[drop.status] = (acc[drop.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [drops]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Drops</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage timed campaigns for your fans.
          </p>
        </div>
        <Button onClick={() => router.push("/app/drops/new")} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Drop
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Live Drops"
          value={stats.liveDrops.toString()}
          icon={Sparkles}
          color="primary"
        />
        <StatsCard
          label="Total Sales"
          value={stats.totalSales.toLocaleString()}
          icon={ShoppingCart}
        />
        <StatsCard
          label="VIPs Captured"
          value={stats.totalVips.toLocaleString()}
          icon={Users}
        />
        <StatsCard
          label="Total Revenue"
          value={formatETB(stats.totalRevenue)}
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs - Mobile */}
        <div className="sm:hidden">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label} {statusCounts[tab.value] !== undefined && `(${statusCounts[tab.value]})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Tabs - Desktop */}
        <div className="hidden sm:flex items-center gap-1 rounded-xl bg-card border border-border p-1">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === "all" ? drops.length : statusCounts[tab.value] || 0;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  statusFilter === tab.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  statusFilter === tab.value
                    ? "bg-white/20"
                    : "bg-muted"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="revenue">Highest revenue</SelectItem>
            <SelectItem value="sales">Most sales</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drops Grid */}
      {filteredDrops.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={statusFilter === "all" ? "Create your first drop" : `No ${statusFilter} drops`}
          description={
            statusFilter === "all"
              ? "Drops let you sell exclusive content, event tickets, merchandise, and more to your fans."
              : `You don't have any ${statusFilter} drops at the moment.`
          }
          action={
            statusFilter === "all"
              ? { label: "Create Drop", onClick: () => router.push("/app/drops/new") }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDrops.map((drop) => (
            <DropCard key={drop.id} drop={drop} onCopyLink={handleCopyLink} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredDrops.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filteredDrops.length} of {drops.length} drops
        </p>
      )}
    </div>
  );
}
