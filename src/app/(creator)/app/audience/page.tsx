"use client";

import { useState, useMemo } from "react";
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
  X,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Types
type Channel = "telegram" | "whatsapp" | "sms";
type SourceType = "drop" | "profile" | "direct";
type Status = "active" | "unsubscribed";

interface Subscriber {
  id: string;
  name: string | null;
  phone: string;
  channel: Channel;
  source: { type: SourceType; dropName?: string };
  joinedAt: Date;
  status: Status;
  totalPurchases?: number;
  lifetimeValue?: number;
}

// Mock data
const mockSubscribers: Subscriber[] = [
  {
    id: "1",
    name: "Abebe Kebede",
    phone: "+251911223344",
    channel: "telegram",
    source: { type: "drop", dropName: "Concert Night" },
    joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "active",
    totalPurchases: 3,
    lifetimeValue: 750000,
  },
  {
    id: "2",
    name: "Sara Tesfaye",
    phone: "+251922334455",
    channel: "whatsapp",
    source: { type: "profile" },
    joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: "active",
    totalPurchases: 1,
    lifetimeValue: 250000,
  },
  {
    id: "3",
    name: null,
    phone: "+251933445566",
    channel: "sms",
    source: { type: "drop", dropName: "Album Launch" },
    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "active",
  },
  {
    id: "4",
    name: "Dawit Haile",
    phone: "+251944556677",
    channel: "telegram",
    source: { type: "direct" },
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: "active",
    totalPurchases: 5,
    lifetimeValue: 1250000,
  },
  {
    id: "5",
    name: "Meron Alemu",
    phone: "+251955667788",
    channel: "whatsapp",
    source: { type: "drop", dropName: "VIP Meet & Greet" },
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "active",
    totalPurchases: 2,
    lifetimeValue: 500000,
  },
  {
    id: "6",
    name: "Yonas Bekele",
    phone: "+251966778899",
    channel: "telegram",
    source: { type: "profile" },
    joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: "unsubscribed",
  },
  {
    id: "7",
    name: "Tigist Mengistu",
    phone: "+251977889900",
    channel: "sms",
    source: { type: "drop", dropName: "Concert Night" },
    joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: "active",
    totalPurchases: 1,
    lifetimeValue: 150000,
  },
  {
    id: "8",
    name: "Helen Tadesse",
    phone: "+251988990011",
    channel: "whatsapp",
    source: { type: "direct" },
    joinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    status: "active",
  },
  {
    id: "9",
    name: "Hana Girma",
    phone: "+251911001122",
    channel: "telegram",
    source: { type: "drop", dropName: "Album Launch" },
    joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: "active",
    totalPurchases: 4,
    lifetimeValue: 980000,
  },
  {
    id: "10",
    name: "Samuel Tadesse",
    phone: "+251922112233",
    channel: "sms",
    source: { type: "profile" },
    joinedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    status: "active",
  },
];

// Channel config
const CHANNEL_CONFIG: Record<Channel, { label: string; icon: React.ElementType; color: string }> = {
  telegram: { label: "Telegram", icon: Send, color: "bg-blue-500/10 text-blue-500" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "bg-green-500/10 text-green-500" },
  sms: { label: "SMS", icon: Phone, color: "bg-yellow-500/10 text-yellow-500" },
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
          {trend && (
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

function ChannelBreakdown({ stats }: { stats: Record<Channel, number> }) {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">By Channel</h3>
      <div className="space-y-3">
        {(Object.entries(stats) as [Channel, number][]).map(([channel, count]) => {
          const config = CHANNEL_CONFIG[channel];
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          const Icon = config.icon;

          return (
            <div key={channel} className="flex items-center gap-3">
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
                    className={cn("h-full rounded-full", channel === "telegram" && "bg-blue-500", channel === "whatsapp" && "bg-green-500", channel === "sms" && "bg-yellow-500")}
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

function SubscriberCard({ subscriber }: { subscriber: Subscriber }) {
  const config = CHANNEL_CONFIG[subscriber.channel];
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
      {/* Avatar */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 text-sm font-bold text-white">
        {subscriber.name ? subscriber.name.split(" ").map(n => n[0]).join("") : "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">
            {subscriber.name || "Unknown"}
          </p>
          <div className={cn("flex h-5 w-5 items-center justify-center rounded", config.color)}>
            <Icon className="h-3 w-3" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{subscriber.phone}</p>
      </div>

      {/* Source */}
      <div className="hidden sm:block text-right">
        <p className="text-sm text-foreground">
          {subscriber.source.type === "drop" ? subscriber.source.dropName : subscriber.source.type === "profile" ? "Profile" : "Direct"}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(subscriber.joinedAt)}</p>
      </div>

      {/* Value */}
      {subscriber.lifetimeValue && (
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-green-500">
            ETB {(subscriber.lifetimeValue / 100).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{subscriber.totalPurchases} purchases</p>
        </div>
      )}

      {/* Status */}
      <div className={cn(
        "shrink-0 px-2 py-1 rounded-full text-xs font-medium",
        subscriber.status === "active" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
      )}>
        {subscriber.status === "active" ? "Active" : "Unsubscribed"}
      </div>
    </div>
  );
}

function TopSources({ subscribers }: { subscribers: Subscriber[] }) {
  const sources = useMemo(() => {
    const counts: Record<string, number> = {};
    subscribers.forEach(s => {
      const key = s.source.type === "drop" ? s.source.dropName! : s.source.type === "profile" ? "Profile" : "Direct Link";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [subscribers]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground mb-4">Top Sources</h3>
      <div className="space-y-3">
        {sources.map(([source, count], index) => (
          <div key={source} className="flex items-center gap-3">
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded text-xs font-bold",
              index === 0 && "bg-yellow-500/20 text-yellow-500",
              index === 1 && "bg-gray-400/20 text-gray-400",
              index === 2 && "bg-orange-500/20 text-orange-500",
              index > 2 && "bg-muted text-muted-foreground"
            )}>
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-foreground truncate">{source}</span>
            <span className="text-sm font-medium text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AudiencePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("active");

  // Broadcast modal state
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastChannel, setBroadcastChannel] = useState<Channel>("telegram");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  const handleBroadcast = async () => {
    setBroadcasting(true);
    await new Promise(r => setTimeout(r, 2000));
    setBroadcasting(false);
    setBroadcastSent(true);
    setTimeout(() => {
      setShowBroadcast(false);
      setBroadcastSent(false);
      setBroadcastMessage("");
    }, 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1500));
    // Create CSV content
    const headers = ["Name", "Phone", "Channel", "Status", "Joined", "Lifetime Value"];
    const rows = mockSubscribers.map(s => [
      s.name || "Unknown",
      s.phone,
      s.channel,
      s.status,
      s.joinedAt.toLocaleDateString(),
      s.lifetimeValue ? `ETB ${(s.lifetimeValue / 100).toLocaleString()}` : "-"
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vip-audience.csv";
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
  };

  // Stats
  const stats = useMemo(() => {
    const active = mockSubscribers.filter(s => s.status === "active");
    const totalLTV = active.reduce((sum, s) => sum + (s.lifetimeValue || 0), 0);
    return {
      total: active.length,
      telegram: active.filter(s => s.channel === "telegram").length,
      whatsapp: active.filter(s => s.channel === "whatsapp").length,
      sms: active.filter(s => s.channel === "sms").length,
      newThisWeek: active.filter(s => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return s.joinedAt > weekAgo;
      }).length,
      totalLTV,
    };
  }, []);

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    return mockSubscribers.filter(sub => {
      if (channelFilter !== "all" && sub.channel !== channelFilter) return false;
      if (statusFilter !== "all" && sub.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = sub.name?.toLowerCase().includes(query);
        const matchesPhone = sub.phone.includes(query);
        if (!matchesName && !matchesPhone) return false;
      }
      return true;
    });
  }, [channelFilter, statusFilter, searchQuery]);

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
          <Button onClick={() => setShowBroadcast(true)}>
            <Send className="mr-2 h-4 w-4" />
            Broadcast
          </Button>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Broadcast Message</h2>
              <button
                onClick={() => setShowBroadcast(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {broadcastSent ? (
              <div className="flex flex-col items-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Message Sent!</h3>
                <p className="text-muted-foreground mt-1">
                  Your broadcast is being delivered to {stats[broadcastChannel]} subscribers.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["telegram", "whatsapp", "sms"] as Channel[]).map((channel) => {
                        const config = CHANNEL_CONFIG[channel];
                        const Icon = config.icon;
                        const count = stats[channel];
                        return (
                          <button
                            key={channel}
                            type="button"
                            onClick={() => setBroadcastChannel(channel)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                              broadcastChannel === channel
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            )}
                          >
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.color)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{config.label}</span>
                            <span className="text-xs text-muted-foreground">{count} VIPs</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="broadcast-message">Message</Label>
                    <Textarea
                      id="broadcast-message"
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">{broadcastMessage.length}/500 characters</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowBroadcast(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBroadcast}
                    disabled={broadcasting || !broadcastMessage.trim()}
                    className="flex-1"
                  >
                    {broadcasting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Send to {stats[broadcastChannel]} VIPs</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total VIPs"
          value={stats.total.toLocaleString()}
          icon={Users}
          trend={{ value: stats.newThisWeek, label: "this week" }}
          color="primary"
        />
        <StatsCard
          label="New This Week"
          value={stats.newThisWeek}
          icon={UserPlus}
        />
        <StatsCard
          label="Lifetime Value"
          value={`ETB ${(stats.totalLTV / 100).toLocaleString()}`}
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          label="Avg. Purchases"
          value="2.4"
          icon={Sparkles}
        />
      </div>

      {/* Channel Breakdown & Top Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelBreakdown stats={{ telegram: stats.telegram, whatsapp: stats.whatsapp, sms: stats.sms }} />
        <TopSources subscribers={mockSubscribers.filter(s => s.status === "active")} />
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
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
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
          Showing {filteredSubscribers.length} of {mockSubscribers.length} subscribers
        </p>
      )}
    </div>
  );
}
