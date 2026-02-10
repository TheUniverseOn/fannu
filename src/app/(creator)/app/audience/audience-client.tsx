"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Send,
  Download,
  Search,
  TrendingUp,
  MessageCircle,
  Phone,
  UserPlus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatETB } from "@/lib/utils";
import type { VipSubscription, VipStats } from "@/lib/queries/vip";

// Types
type Channel = "TELEGRAM" | "WHATSAPP" | "SMS";
type Status = "ACTIVE" | "UNSUBSCRIBED";

interface AudienceClientProps {
  subscribers: VipSubscription[];
  stats: VipStats;
}

// Channel config
const CHANNEL_CONFIG: Record<Channel, { label: string; icon: React.ElementType; color: string }> = {
  TELEGRAM: { label: "Telegram", icon: Send, color: "bg-blue-500/10 text-blue-500" },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle, color: "bg-green-500/10 text-green-500" },
  SMS: { label: "SMS", icon: Phone, color: "bg-yellow-500/10 text-yellow-500" },
};

// Components
function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color?: "default" | "primary" | "success";
}) {
  return (
    <div className={cn(
      "rounded-xl border p-5",
      color === "primary" && "border-primary/20 bg-primary/5",
      color === "success" && "border-green-500/20 bg-green-500/5",
      color === "default" && "border-border bg-card"
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {trend && trend.value > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              <span className="text-sm text-green-500">+{trend.value}</span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          color === "primary" && "bg-primary/10 text-primary",
          color === "success" && "bg-green-500/10 text-green-500",
          color === "default" && "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function ChannelBreakdown({ stats }: { stats: { telegram: number; whatsapp: number; sms: number } }) {
  const total = stats.telegram + stats.whatsapp + stats.sms;

  const channels: { key: Channel; count: number }[] = [
    { key: "TELEGRAM", count: stats.telegram },
    { key: "WHATSAPP", count: stats.whatsapp },
    { key: "SMS", count: stats.sms },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">By Channel</h3>
      <div className="space-y-3">
        {channels.map(({ key, count }) => {
          const config = CHANNEL_CONFIG[key];
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const Icon = config.icon;

          return (
            <div key={key} className="flex items-center gap-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{config.label}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      key === "TELEGRAM" && "bg-blue-500",
                      key === "WHATSAPP" && "bg-green-500",
                      key === "SMS" && "bg-yellow-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopSources({ stats }: { stats: { dropPage: number; creatorProfile: number; directLink: number } }) {
  const sources = [
    { name: "Drop Pages", count: stats.dropPage },
    { name: "Creator Profile", count: stats.creatorProfile },
    { name: "Direct Link", count: stats.directLink },
  ].sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Top Sources</h3>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={source.name} className="flex items-center gap-3">
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded text-xs font-bold",
              index === 0 && "bg-yellow-500/20 text-yellow-500",
              index === 1 && "bg-gray-400/20 text-gray-400",
              index === 2 && "bg-orange-500/20 text-orange-500"
            )}>
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-foreground truncate">{source.name}</span>
            <span className="text-sm font-medium text-muted-foreground">{source.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubscriberCard({ subscriber }: { subscriber: VipSubscription }) {
  const config = CHANNEL_CONFIG[subscriber.channel];
  const Icon = config.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getSourceLabel = () => {
    switch (subscriber.source) {
      case "DROP_PAGE": return subscriber.source_ref || "Drop Page";
      case "CREATOR_PROFILE": return "Profile";
      case "DIRECT_LINK": return "Direct Link";
      default: return subscriber.source;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
      {/* Avatar */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 text-sm font-bold text-white">
        {subscriber.fan_name ? subscriber.fan_name.split(" ").map(n => n[0]).join("").slice(0, 2) : "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">
            {subscriber.fan_name || "Unknown"}
          </p>
          <div className={cn("flex h-5 w-5 items-center justify-center rounded", config.color)}>
            <Icon className="h-3 w-3" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{subscriber.fan_phone}</p>
      </div>

      {/* Source */}
      <div className="hidden sm:block text-right">
        <p className="text-sm text-foreground">{getSourceLabel()}</p>
        <p className="text-xs text-muted-foreground">{formatDate(subscriber.joined_at)}</p>
      </div>

      {/* Status */}
      <div className={cn(
        "shrink-0 px-2 py-1 rounded-full text-xs font-medium",
        subscriber.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
      )}>
        {subscriber.status === "ACTIVE" ? "Active" : "Unsubscribed"}
      </div>
    </div>
  );
}

export function AudienceClient({ subscribers, stats }: AudienceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("ACTIVE");
  const [exporting, setExporting] = useState(false);

  // Calculate new this week
  const newThisWeek = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return subscribers.filter(s =>
      s.status === "ACTIVE" && new Date(s.joined_at) > weekAgo
    ).length;
  }, [subscribers]);

  const handleExport = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1500));

    const headers = ["Name", "Phone", "Channel", "Status", "Source", "Joined"];
    const rows = subscribers.map(s => [
      s.fan_name || "Unknown",
      s.fan_phone,
      s.channel,
      s.status,
      s.source,
      new Date(s.joined_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vip-audience.csv";
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
  };

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => {
      if (channelFilter !== "all" && sub.channel !== channelFilter) return false;
      if (statusFilter !== "all" && sub.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = sub.fan_name?.toLowerCase().includes(query);
        const matchesPhone = sub.fan_phone.includes(query);
        if (!matchesName && !matchesPhone) return false;
      }
      return true;
    });
  }, [subscribers, channelFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Audience</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your VIP list and engage with your fans.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Exporting...</>
            ) : (
              <><Download className="mr-2 h-4 w-4" />Export</>
            )}
          </Button>
          <Button asChild>
            <Link href="/app/broadcasts/new">
              <Send className="mr-2 h-4 w-4" />
              Broadcast
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total VIPs"
          value={stats.total.toLocaleString()}
          icon={Users}
          trend={{ value: newThisWeek, label: "this week" }}
          color="primary"
        />
        <StatsCard
          label="New This Week"
          value={newThisWeek}
          icon={UserPlus}
        />
        <StatsCard
          label="Last 30 Days"
          value={stats.last30Days}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          label="Active Channels"
          value={[stats.byChannel.telegram > 0, stats.byChannel.whatsapp > 0, stats.byChannel.sms > 0].filter(Boolean).length}
          icon={Sparkles}
        />
      </div>

      {/* Channel Breakdown & Top Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelBreakdown stats={stats.byChannel} />
        <TopSources stats={stats.bySource} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as Channel | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="TELEGRAM">Telegram</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="SMS">SMS</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriber List */}
      {filteredSubscribers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? "No results found" : "No VIPs yet"}
          description={searchQuery ? `No subscribers match "${searchQuery}"` : "Share your drop or profile link to start building your VIP audience!"}
        />
      ) : (
        <div className="space-y-3">
          {filteredSubscribers.map((subscriber) => (
            <SubscriberCard key={subscriber.id} subscriber={subscriber} />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredSubscribers.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {filteredSubscribers.length} of {subscribers.length} subscribers
        </p>
      )}
    </div>
  );
}
