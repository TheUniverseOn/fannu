"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Calendar,
  User,
  Bell,
  TrendingUp,
  Users,
  DollarSign,
  Wallet,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Drops", href: "/app/drops", icon: Sparkles },
  { name: "Bookings", href: "/app/bookings", icon: Calendar },
  { name: "Earnings", href: "/app/earnings", icon: Wallet },
  { name: "Profile", href: "/app/settings", icon: User },
];

// Mock data for right sidebar
const recentActivity = [
  { id: 1, type: "signup", message: "New VIP signup", time: "2m ago" },
  { id: 2, type: "booking", message: "Booking request received", time: "15m ago" },
  { id: 3, type: "payment", message: "Payment confirmed", time: "1h ago" },
  { id: 4, type: "signup", message: "3 new signups", time: "2h ago" },
];

const quickStats = [
  { label: "Today's Revenue", value: "ETB 12,500", icon: DollarSign, trend: "+12%" },
  { label: "Active Fans", value: "1,234", icon: Users, trend: "+5%" },
  { label: "Conversion", value: "24%", icon: TrendingUp, trend: "+2%" },
];

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Left Sidebar - Navigation */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-[72px] lg:flex-col lg:border-r lg:border-border lg:bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border">
          <Link href="/app/dashboard" className="font-display text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            F
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col items-center gap-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={item.name}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>

        {/* Notification bell at bottom */}
        <div className="flex items-center justify-center py-4 border-t border-border">
          <button className="relative flex h-12 w-12 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>
      </aside>

      {/* Desktop Right Sidebar - Activity & Stats */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:z-40 lg:flex lg:w-[320px] lg:flex-col lg:border-l lg:border-border lg:bg-card">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <h2 className="font-semibold text-foreground">Activity</h2>
          <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Stats</h3>
          <div className="space-y-3">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="font-semibold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-500">{stat.trend}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex-1 overflow-auto p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                  activity.type === "signup" && "bg-green-500/10 text-green-500",
                  activity.type === "booking" && "bg-blue-500/10 text-blue-500",
                  activity.type === "payment" && "bg-primary/10 text-primary"
                )}>
                  {activity.type === "signup" && <Users className="h-4 w-4" />}
                  {activity.type === "booking" && <Calendar className="h-4 w-4" />}
                  {activity.type === "payment" && <DollarSign className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="p-4 border-t border-border">
          <Link
            href="/app/dashboard"
            className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            View All Activity
          </Link>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="lg:pl-[72px] lg:pr-[320px]">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-background/95 backdrop-blur border-b border-border lg:hidden">
          <Link href="/app/dashboard" className="font-display text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            FanNu
          </Link>
          <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:sticky lg:top-0 lg:z-30 lg:flex lg:items-center lg:justify-between lg:h-16 lg:px-8 lg:bg-background/95 lg:backdrop-blur lg:border-b lg:border-border">
          <h1 className="font-display text-xl font-semibold text-foreground">
            {navigation.find(n => pathname === n.href || (n.href !== "/app/dashboard" && pathname.startsWith(n.href)))?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome back, Creator</span>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        <div className="bg-background px-4 pb-safe">
          <div className="flex items-center justify-around rounded-2xl bg-card border border-border p-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/app/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all flex-1",
                    isActive
                      ? "bg-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
