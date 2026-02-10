"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  Clock,
  FileText,
  MessageSquare,
  ChevronRight,
  MoreVertical,
  Trash2,
  XCircle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteBroadcast, cancelScheduledBroadcast } from "@/lib/actions/broadcasts";
import type { BroadcastWithDrop } from "@/lib/queries/broadcasts";

// ============================================================================
// TYPES
// ============================================================================

type FilterStatus = "ALL" | "SENT" | "SCHEDULED" | "DRAFT";

interface BroadcastsClientProps {
  broadcasts: BroadcastWithDrop[];
}

// ============================================================================
// COMPONENTS
// ============================================================================

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
        isActive
          ? "bg-primary text-white"
          : "bg-card text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string }> = {
    SENT: {
      label: "Sent",
      bgColor: "bg-green-500/20",
      textColor: "text-green-600",
      dotColor: "bg-green-500",
    },
    SCHEDULED: {
      label: "Scheduled",
      bgColor: "bg-blue-500/20",
      textColor: "text-blue-600",
      dotColor: "bg-blue-500",
    },
    SENDING: {
      label: "Sending",
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-600",
      dotColor: "bg-yellow-500",
    },
    DRAFT: {
      label: "Draft",
      bgColor: "bg-muted",
      textColor: "text-muted-foreground",
      dotColor: "bg-muted-foreground",
    },
    FAILED: {
      label: "Failed",
      bgColor: "bg-red-500/20",
      textColor: "text-red-600",
      dotColor: "bg-red-500",
    },
  };

  const { label, bgColor, textColor, dotColor } = config[status] || config.DRAFT;

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", bgColor, textColor)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
      {label}
    </span>
  );
}

function BroadcastItem({ broadcast }: { broadcast: BroadcastWithDrop }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return;
    setIsDeleting(true);
    await deleteBroadcast(broadcast.id);
    setIsDeleting(false);
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this scheduled broadcast?")) return;
    await cancelScheduledBroadcast(broadcast.id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getChannelsText = () => {
    const channels = broadcast.channels || [];
    if (channels.length === 0) return "";
    return channels.map((c) => c === "WHATSAPP" ? "WhatsApp" : c).join(" + ");
  };

  const getRecipientsText = () => {
    if (broadcast.status === "DRAFT") return "Draft · Not sent yet";
    if (broadcast.recipients_count) {
      return `${broadcast.recipients_count} recipients · ${getChannelsText()}`;
    }
    return getChannelsText();
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-foreground line-clamp-1">
              {broadcast.message_text}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {getRecipientsText()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {broadcast.sent_at
                ? formatDate(broadcast.sent_at)
                : broadcast.scheduled_at
                  ? new Date(broadcast.scheduled_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Draft"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {broadcast.status === "SCHEDULED" && (
                  <DropdownMenuItem onClick={handleCancel}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                )}
                {(broadcast.status === "DRAFT" || broadcast.status === "SCHEDULED") && (
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-2">
          <StatusBadge status={broadcast.status} />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Send className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No broadcasts yet</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Send your first message to your VIP subscribers
      </p>
      <Button className="mt-4" asChild>
        <Link href="/app/broadcasts/new">
          <Plus className="mr-2 h-4 w-4" />
          New Broadcast
        </Link>
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BroadcastsClient({ broadcasts }: BroadcastsClientProps) {
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (filter === "ALL") return true;
    if (filter === "SENT") return b.status === "SENT";
    if (filter === "SCHEDULED") return b.status === "SCHEDULED";
    if (filter === "DRAFT") return b.status === "DRAFT";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Broadcasts</h1>
          <p className="text-muted-foreground mt-1">
            Message your VIP subscribers
          </p>
        </div>
        <Button asChild>
          <Link href="/app/broadcasts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Broadcast
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <FilterChip
          label="All"
          isActive={filter === "ALL"}
          onClick={() => setFilter("ALL")}
        />
        <FilterChip
          label="Sent"
          isActive={filter === "SENT"}
          onClick={() => setFilter("SENT")}
        />
        <FilterChip
          label="Scheduled"
          isActive={filter === "SCHEDULED"}
          onClick={() => setFilter("SCHEDULED")}
        />
        <FilterChip
          label="Draft"
          isActive={filter === "DRAFT"}
          onClick={() => setFilter("DRAFT")}
        />
      </div>

      {/* Broadcast List */}
      {filteredBroadcasts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filteredBroadcasts.map((broadcast) => (
            <BroadcastItem key={broadcast.id} broadcast={broadcast} />
          ))}
        </div>
      )}
    </div>
  );
}
