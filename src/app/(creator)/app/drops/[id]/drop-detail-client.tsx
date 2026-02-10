"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Users,
  ShoppingCart,
  Calendar,
  Clock,
  Share2,
  MoreHorizontal,
  Sparkles,
  DollarSign,
  StopCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EndDropModal } from "@/components/creator/end-drop-modal";
import { cn, formatETB, formatDate } from "@/lib/utils";
import { endDrop, deleteDrop } from "@/lib/actions/drops";
import type { DropWithCreator } from "@/lib/queries/drops";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TYPE_COLORS: Record<string, string> = {
  EVENT: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  MERCH: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONTENT: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  CUSTOM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

function StatCard({
  label,
  value,
  icon: Icon,
  color = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
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
      </div>
    </div>
  );
}

interface DropDetailClientProps {
  drop: DropWithCreator;
}

export function DropDetailClient({ drop }: DropDetailClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Calculate stats
  const quantitySold = drop.total_slots && drop.slots_remaining !== null
    ? drop.total_slots - drop.slots_remaining
    : 0;
  const totalRevenue = quantitySold * (drop.price || 0);
  const progress = drop.total_slots
    ? Math.round((quantitySold / drop.total_slots) * 100)
    : null;
  const isSoldOut = drop.total_slots && drop.slots_remaining === 0;

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/d/${drop.slug}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndDrop = async () => {
    await endDrop(drop.id);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this drop? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    await deleteDrop(drop.id);
    router.push("/app/drops");
  };

  const statusForBadge = drop.status.toLowerCase() as "live" | "scheduled" | "ended" | "draft" | "cancelled";
  const canEnd = drop.status === "LIVE" || drop.status === "SCHEDULED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app/drops")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{drop.title}</h1>
              <StatusBadge status={statusForBadge} type="drop" />
            </div>
            <p className="text-muted-foreground mt-1">
              Created {formatDate(drop.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/d/${drop.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/app/drops/${drop.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              {canEnd && (
                <DropdownMenuItem onClick={() => setShowEndModal(true)}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  End Drop
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Deleting..." : "Delete Drop"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Cover & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
            {drop.cover_image_url ? (
              <Image
                src={drop.cover_image_url}
                alt={drop.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Sparkles className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            <div className="absolute top-4 left-4">
              <span className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
                TYPE_COLORS[drop.type] || TYPE_COLORS.CUSTOM
              )}>
                {drop.type}
              </span>
            </div>
            {progress !== null && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between text-white mb-2">
                  <span className="text-lg font-semibold">{quantitySold}/{drop.total_slots} sold</span>
                  <span className="text-lg font-semibold">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
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

          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground mb-3">Description</h2>
            <p className="text-muted-foreground">{drop.description || "No description provided."}</p>
          </div>

          {/* Recent Purchases - Placeholder */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Recent Purchases</h2>
              <span className="text-sm text-muted-foreground">{quantitySold} total</span>
            </div>
            {quantitySold > 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Purchase history coming soon...
              </p>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No purchases yet
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Price */}
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Price</p>
            <p className="text-3xl font-bold text-foreground">
              {drop.price && drop.price > 0 ? formatETB(drop.price) : "Free"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4">
            <StatCard
              label="Total Revenue"
              value={formatETB(totalRevenue)}
              icon={DollarSign}
              color="success"
            />
            <StatCard
              label="Sales"
              value={quantitySold}
              icon={ShoppingCart}
            />
            {drop.total_slots && (
              <StatCard
                label="Remaining"
                value={drop.slots_remaining ?? 0}
                icon={Users}
                color="primary"
              />
            )}
          </div>

          {/* Dates */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created</span>
                <span className="ml-auto text-foreground">{formatDate(drop.created_at)}</span>
              </div>
              {drop.scheduled_at && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Scheduled</span>
                  <span className="ml-auto text-foreground">{formatDate(drop.scheduled_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* End Drop Button for live drops */}
          {canEnd && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowEndModal(true)}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              End Drop
            </Button>
          )}
        </div>
      </div>

      {/* End Drop Modal */}
      <EndDropModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={handleEndDrop}
        drop={{
          id: drop.id,
          title: drop.title,
          quantitySold,
          quantityLimit: drop.total_slots,
          totalRevenue,
        }}
      />
    </div>
  );
}
