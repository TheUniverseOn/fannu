"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  Wallet,
  Receipt,
  ChevronRight,
  Download,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
} from "lucide-react";
import { cn, formatETB } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { EarningsData, Transaction } from "@/lib/queries/earnings";

// ============================================================================
// TYPES
// ============================================================================

type TransactionType = "booking_deposit" | "drop_sales" | "withdrawal" | "refund";
type TransactionStatus = "completed" | "pending" | "processing";

interface EarningsClientProps {
  earningsData: EarningsData;
  transactions: Transaction[];
}

// ============================================================================
// COMPONENTS
// ============================================================================

function BalanceCard({
  availableBalance,
  pendingBalance,
  totalEarned,
  onWithdraw,
}: {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  onWithdraw: () => void;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-pink-500 p-6 text-white">
      <p className="text-sm font-medium text-white/80">Available balance</p>
      <p className="mt-2 text-4xl font-extrabold tracking-tight">
        {formatETB(availableBalance)}
      </p>
      <p className="mt-2 text-sm text-white/70">
        Pending: {formatETB(pendingBalance)} · Total earned: {formatETB(totalEarned)}
      </p>
      <Button
        onClick={onWithdraw}
        className="mt-4 w-full bg-white text-primary hover:bg-white/90 font-bold"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Withdraw
      </Button>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: number;
}) {
  const isPositive = trend && trend > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trend !== undefined && trend !== 0 && (
          <span
            className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-500" : "text-red-500"
            )}
          >
            {isPositive ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const typeConfig: Record<
    TransactionType,
    { icon: React.ElementType; color: string; bgColor: string }
  > = {
    booking_deposit: {
      icon: ArrowDownLeft,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    drop_sales: {
      icon: ArrowDownLeft,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    withdrawal: {
      icon: Send,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    refund: {
      icon: RefreshCw,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  };

  const statusConfig: Record<
    TransactionStatus,
    { label: string; color: string; bgColor: string; icon: React.ElementType }
  > = {
    completed: {
      label: "Paid",
      color: "text-green-600",
      bgColor: "bg-green-500/20",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending",
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/20",
      icon: Clock,
    },
    processing: {
      label: "Processing",
      color: "text-blue-600",
      bgColor: "bg-blue-500/20",
      icon: RefreshCw,
    },
  };

  const { icon: TypeIcon, color: typeColor, bgColor: typeBgColor } = typeConfig[transaction.type];
  const {
    label: statusLabel,
    color: statusColor,
    bgColor: statusBgColor,
    icon: StatusIcon,
  } = statusConfig[transaction.status];
  const isIncoming = transaction.amount_cents > 0;

  // For withdrawals, show "Sent" instead of "Paid"
  const displayLabel = transaction.type === "withdrawal" && transaction.status === "completed"
    ? "Sent"
    : statusLabel;
  const displayStatusColor = transaction.type === "withdrawal" && transaction.status === "completed"
    ? "text-muted-foreground"
    : statusColor;
  const displayStatusBgColor = transaction.type === "withdrawal" && transaction.status === "completed"
    ? "bg-muted"
    : statusBgColor;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          typeBgColor
        )}
      >
        <TypeIcon className={cn("h-5 w-5", typeColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{transaction.description}</p>
        <p className="text-sm text-muted-foreground truncate">
          {transaction.subtitle}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p
          className={cn(
            "font-semibold",
            isIncoming ? "text-green-500" : "text-foreground"
          )}
        >
          {isIncoming ? "+" : ""}
          {formatETB(Math.abs(transaction.amount_cents))}
        </p>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            displayStatusBgColor,
            displayStatusColor
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {displayLabel}
        </span>
      </div>
    </div>
  );
}

function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Receipt className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No transactions yet</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Your earnings from drops and bookings will appear here.
      </p>
      <Button className="mt-4" asChild>
        <Link href="/app/drops/new">Create a Drop</Link>
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EarningsClient({ earningsData, transactions }: EarningsClientProps) {
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    alert("Withdrawal feature coming soon!");
    setWithdrawing(false);
  };

  const currentMonth = new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
          <p className="text-muted-foreground mt-1">
            Track your revenue and manage withdrawals
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Balance Card */}
      <BalanceCard
        availableBalance={earningsData.availableBalance}
        pendingBalance={earningsData.pendingBalance}
        totalEarned={earningsData.totalEarned}
        onWithdraw={handleWithdraw}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="This month"
          value={formatETB(earningsData.thisMonth)}
          subtitle={currentMonth}
          trend={earningsData.thisMonthChange}
        />
        <MetricCard
          title="Transactions"
          value={earningsData.transactionsThisMonth.toString()}
          subtitle={currentMonth}
        />
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent transactions</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          {transactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            <div>
              {transactions.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
