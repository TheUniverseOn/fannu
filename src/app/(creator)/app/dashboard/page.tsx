"use client";

import Link from "next/link";
import {
  Bell,
  FileEdit,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Users,
  Sparkles,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Zap,
  Eye,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ============================================================================
// MOCK DATA
// ============================================================================

const metricsData = {
  totalVIPs: 2847,
  vipChange: 340,
  vipChangePercent: 13.5,
  activeDrops: 5,
  liveDrops: 2,
  revenue30Days: 245000,
  revenueChange: 12.3,
  pendingBookings: 3,
  totalViews: 15420,
  viewsChange: 8.2,
  conversionRate: 24.5,
  conversionChange: 2.1,
};

const actionItems = [
  {
    id: "1",
    icon: Bell,
    title: "3 new booking requests",
    subtitle: "Awaiting your response",
    href: "/app/bookings?status=REQUESTED",
    variant: "warning" as const,
    count: 3,
  },
  {
    id: "2",
    icon: FileEdit,
    title: "Draft drop ready",
    subtitle: "\"Summer Collection\" needs review",
    href: "/app/drops",
    variant: "default" as const,
  },
  {
    id: "3",
    icon: Zap,
    title: "VIP milestone reached",
    subtitle: "You hit 2,500 VIPs! Create a celebration drop",
    href: "/app/drops/new",
    variant: "success" as const,
  },
];

const recentActivity = [
  {
    id: "1",
    initials: "SM",
    name: "Sarah M.",
    action: "joined as VIP",
    source: "Concert Night drop",
    time: "2m ago",
    type: "vip" as const,
  },
  {
    id: "2",
    initials: "DT",
    name: "Daniel T.",
    action: "purchased ticket",
    source: "Album Launch Party",
    time: "15m ago",
    type: "purchase" as const,
    amount: 2500,
  },
  {
    id: "3",
    initials: "HG",
    name: "Helen G.",
    action: "requested booking",
    source: "MC/Hosting · Feb 20",
    time: "1h ago",
    type: "booking" as const,
  },
  {
    id: "4",
    initials: "MK",
    name: "Michael K.",
    action: "joined as VIP",
    source: "Profile link",
    time: "2h ago",
    type: "vip" as const,
  },
  {
    id: "5",
    initials: "AT",
    name: "Alem T.",
    action: "purchased merch",
    source: "Limited Edition Hoodie",
    time: "3h ago",
    type: "purchase" as const,
    amount: 1800,
  },
];

const topDrops = [
  { id: "1", title: "Album Launch Party", sales: 45, revenue: 112500, trend: 12 },
  { id: "2", title: "Concert Night", sales: 32, revenue: 80000, trend: -3 },
  { id: "3", title: "VIP Meet & Greet", sales: 28, revenue: 84000, trend: 8 },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function MetricCard({
  title,
  value,
  change,
  changePercent,
  icon: Icon,
  trend,
  variant = "default",
  href,
}: {
  title: string;
  value: string;
  change?: string;
  changePercent?: number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "primary" | "gradient";
  href?: string;
}) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  const content = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 transition-all",
        variant === "gradient"
          ? "bg-gradient-to-br from-primary via-primary to-pink-500 text-white"
          : variant === "primary"
          ? "bg-primary/10 border border-primary/20"
          : "bg-card border border-border hover:border-primary/30",
        href && "cursor-pointer hover:shadow-lg"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === "gradient" ? "text-white/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === "gradient" ? "text-white" : "text-foreground"
          )}>
            {value}
          </p>
          {(change || changePercent !== undefined) && (
            <div className="flex items-center gap-1.5">
              {trend && trend !== "neutral" && (
                isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )
              )}
              <span className={cn(
                "text-sm font-medium",
                isPositive && "text-green-500",
                isNegative && "text-red-500",
                !isPositive && !isNegative && (variant === "gradient" ? "text-white/70" : "text-muted-foreground")
              )}>
                {changePercent !== undefined && (isPositive ? "+" : "")}{changePercent}%
                {change && ` (${change})`}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          variant === "gradient"
            ? "bg-white/20"
            : variant === "primary"
            ? "bg-primary/20"
            : "bg-muted"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            variant === "gradient" ? "text-white" : "text-primary"
          )} />
        </div>
      </div>
      {href && (
        <ArrowUpRight className={cn(
          "absolute top-4 right-4 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100",
          variant === "gradient" ? "text-white/60" : "text-muted-foreground"
        )} />
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="group block">{content}</Link>;
  }
  return content;
}

function ActionItem({
  icon: Icon,
  title,
  subtitle,
  href,
  variant = "default",
  count,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href: string;
  variant?: "default" | "warning" | "success";
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-xl p-4 transition-all hover:scale-[1.01]",
        variant === "warning" && "bg-warning/10 hover:bg-warning/15",
        variant === "success" && "bg-green-500/10 hover:bg-green-500/15",
        variant === "default" && "bg-card border border-border hover:border-primary/30"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          variant === "warning" && "bg-warning/20 text-warning",
          variant === "success" && "bg-green-500/20 text-green-500",
          variant === "default" && "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
      </div>
      {count && (
        <span className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
          variant === "warning" && "bg-warning text-warning-foreground",
          variant === "success" && "bg-green-500 text-white",
          variant === "default" && "bg-primary text-primary-foreground"
        )}>
          {count}
        </span>
      )}
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}

function ActivityItem({
  initials,
  name,
  action,
  source,
  time,
  type,
  amount,
}: {
  initials: string;
  name: string;
  action: string;
  source: string;
  time: string;
  type: "vip" | "purchase" | "booking";
  amount?: number;
}) {
  const typeConfig = {
    vip: { color: "from-primary to-pink-500", badge: "VIP", badgeBg: "bg-primary/20 text-primary" },
    purchase: { color: "from-green-500 to-emerald-500", badge: "Sale", badgeBg: "bg-green-500/20 text-green-500" },
    booking: { color: "from-blue-500 to-cyan-500", badge: "Booking", badgeBg: "bg-blue-500/20 text-blue-500" },
  };

  const config = typeConfig[type];

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
        config.color
      )}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium text-foreground">{name}</span>
          <span className="text-muted-foreground"> {action}</span>
        </p>
        <p className="text-xs text-muted-foreground truncate">{source}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {amount && (
          <span className="text-sm font-semibold text-green-500">
            +ETB {amount.toLocaleString()}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}

function TopDropItem({
  rank,
  title,
  sales,
  revenue,
  trend,
}: {
  rank: number;
  title: string;
  sales: number;
  revenue: number;
  trend: number;
}) {
  const isPositive = trend > 0;

  return (
    <div className="flex items-center gap-3 py-3">
      <span className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
        rank === 1 && "bg-yellow-500/20 text-yellow-500",
        rank === 2 && "bg-gray-400/20 text-gray-400",
        rank === 3 && "bg-orange-500/20 text-orange-500"
      )}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{sales} sales</p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-foreground">
          ETB {(revenue / 100).toLocaleString()}
        </span>
        <span className={cn(
          "text-xs font-medium",
          isPositive ? "text-green-500" : "text-red-500"
        )}>
          {isPositive ? "+" : ""}{trend}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            {greeting}, Teddy
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your audience today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/app/audience">
              <Users className="mr-2 h-4 w-4" />
              View Audience
            </Link>
          </Button>
          <Button asChild>
            <Link href="/app/drops/new">
              <Sparkles className="mr-2 h-4 w-4" />
              New Drop
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total VIPs"
          value={metricsData.totalVIPs.toLocaleString()}
          change={`+${metricsData.vipChange}`}
          changePercent={metricsData.vipChangePercent}
          icon={Users}
          trend="up"
          variant="gradient"
          href="/app/audience"
        />
        <MetricCard
          title="Revenue (30d)"
          value={`ETB ${(metricsData.revenue30Days / 100).toLocaleString()}`}
          changePercent={metricsData.revenueChange}
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Total Views"
          value={metricsData.totalViews.toLocaleString()}
          changePercent={metricsData.viewsChange}
          icon={Eye}
          trend="up"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metricsData.conversionRate}%`}
          changePercent={metricsData.conversionChange}
          icon={ShoppingCart}
          trend="up"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Drops</p>
              <p className="text-2xl font-bold text-foreground">{metricsData.activeDrops}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="text-green-500 font-medium">{metricsData.liveDrops} live</span> right now
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Bookings</p>
              <p className="text-2xl font-bold text-foreground">{metricsData.pendingBookings}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Calendar className="h-5 w-5 text-warning" />
            </div>
          </div>
          <p className="mt-2 text-sm text-warning font-medium">
            Action needed
          </p>
        </div>
        <Link href="/app/drops/new" className="group">
          <div className="h-full rounded-xl border border-dashed border-border bg-card/50 p-5 transition-all hover:border-primary/50 hover:bg-card">
            <div className="flex h-full items-center justify-center gap-2 text-muted-foreground group-hover:text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Create New Drop</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Action Items */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Action Needed</h2>
            <span className="text-sm text-muted-foreground">{actionItems.length} items</span>
          </div>
          <div className="space-y-3">
            {actionItems.map((item) => (
              <ActionItem
                key={item.id}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                href={item.href}
                variant={item.variant}
                count={item.count}
              />
            ))}
          </div>
        </div>

        {/* Top Performing Drops */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Top Drops</h2>
              <Link href="/app/drops" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {topDrops.map((drop, index) => (
                <TopDropItem
                  key={drop.id}
                  rank={index + 1}
                  title={drop.title}
                  sales={drop.sales}
                  revenue={drop.revenue}
                  trend={drop.trend}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/audience">View all</Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((item) => (
            <ActivityItem
              key={item.id}
              initials={item.initials}
              name={item.name}
              action={item.action}
              source={item.source}
              time={item.time}
              type={item.type}
              amount={item.amount}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
