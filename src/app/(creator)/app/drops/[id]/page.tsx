"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Eye,
  Users,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Clock,
  Share2,
  MoreHorizontal,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn, formatETB, formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
type DropStatus = "draft" | "scheduled" | "live" | "ended" | "cancelled";
type DropType = "EVENT" | "MERCH" | "CONTENT" | "CUSTOM";

interface Drop {
  id: string;
  slug: string;
  title: string;
  description: string;
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
  ends_at?: string;
}

interface Purchase {
  id: string;
  buyerName: string;
  buyerPhone: string;
  amount_cents: number;
  quantity: number;
  purchasedAt: Date;
}

// Mock data
const MOCK_DROPS: Record<string, Drop> = {
  "1": {
    id: "1",
    slug: "new-album-launch",
    title: "New Album Launch Party",
    description: "Join us for an exclusive album launch party! Be the first to hear the new tracks live and meet the artist. Limited tickets available.",
    type: "EVENT",
    status: "live",
    price_cents: 250000,
    cover_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop",
    quantity_limit: 100,
    quantity_sold: 45,
    vip_count: 124,
    total_revenue_cents: 11250000,
    views: 2340,
    created_at: "2024-01-15T10:00:00Z",
    ends_at: "2024-02-15T23:59:59Z",
  },
  "2": {
    id: "2",
    slug: "limited-merch-drop",
    title: "Limited Edition Hoodie",
    description: "Exclusive limited edition hoodie with custom artwork. Only 50 available worldwide. Premium quality cotton blend.",
    type: "MERCH",
    status: "scheduled",
    price_cents: 180000,
    cover_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop",
    quantity_limit: 50,
    quantity_sold: 0,
    vip_count: 256,
    total_revenue_cents: 0,
    views: 890,
    created_at: "2024-01-20T14:00:00Z",
    scheduled_at: "2024-02-01T18:00:00Z",
  },
  "3": {
    id: "3",
    slug: "behind-the-scenes",
    title: "Studio Sessions Documentary",
    description: "An intimate look behind the scenes of the album recording process. Exclusive footage and commentary.",
    type: "CONTENT",
    status: "draft",
    price_cents: 50000,
    cover_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop",
    quantity_limit: null,
    quantity_sold: 0,
    vip_count: 0,
    total_revenue_cents: 0,
    views: 0,
    created_at: "2024-01-22T09:00:00Z",
  },
  "4": {
    id: "4",
    slug: "summer-concert",
    title: "Summer Concert 2024",
    description: "The biggest summer concert of the year! Full band performance with special guests.",
    type: "EVENT",
    status: "ended",
    price_cents: 350000,
    cover_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop",
    quantity_limit: 500,
    quantity_sold: 500,
    vip_count: 489,
    total_revenue_cents: 175000000,
    views: 15420,
    created_at: "2023-12-01T12:00:00Z",
    ends_at: "2024-01-20T23:59:59Z",
  },
  "5": {
    id: "5",
    slug: "vip-meet-greet",
    title: "VIP Meet & Greet",
    description: "Exclusive VIP experience including meet & greet, photo opportunity, and signed merchandise.",
    type: "CUSTOM",
    status: "live",
    price_cents: 500000,
    cover_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop",
    quantity_limit: 20,
    quantity_sold: 18,
    vip_count: 42,
    total_revenue_cents: 9000000,
    views: 1230,
    created_at: "2024-01-10T08:00:00Z",
  },
  "6": {
    id: "6",
    slug: "concert-tickets",
    title: "Concert Night - Feb 14",
    description: "Valentine's Day special concert. Romantic setlist with full acoustic performance.",
    type: "EVENT",
    status: "live",
    price_cents: 150000,
    cover_url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop",
    quantity_limit: 200,
    quantity_sold: 156,
    vip_count: 312,
    total_revenue_cents: 23400000,
    views: 4560,
    created_at: "2024-01-05T16:00:00Z",
    ends_at: "2024-02-14T23:59:59Z",
  },
};

const MOCK_PURCHASES: Purchase[] = [
  { id: "p1", buyerName: "Abebe K.", buyerPhone: "+251911***456", amount_cents: 250000, quantity: 1, purchasedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: "p2", buyerName: "Sara T.", buyerPhone: "+251922***789", amount_cents: 500000, quantity: 2, purchasedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
  { id: "p3", buyerName: "Dawit H.", buyerPhone: "+251933***012", amount_cents: 250000, quantity: 1, purchasedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
  { id: "p4", buyerName: "Meron A.", buyerPhone: "+251944***345", amount_cents: 750000, quantity: 3, purchasedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { id: "p5", buyerName: "Yonas B.", buyerPhone: "+251955***678", amount_cents: 250000, quantity: 1, purchasedAt: new Date(Date.now() - 36 * 60 * 60 * 1000) },
];

const TYPE_COLORS: Record<DropType, string> = {
  EVENT: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  MERCH: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CONTENT: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  CUSTOM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

// Components
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

function PurchaseRow({ purchase }: { purchase: Purchase }) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 text-sm font-bold text-white">
        {purchase.buyerName.split(" ").map(n => n[0]).join("")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{purchase.buyerName}</p>
        <p className="text-sm text-muted-foreground">{purchase.buyerPhone}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-green-500">{formatETB(purchase.amount_cents)}</p>
        <p className="text-xs text-muted-foreground">{purchase.quantity}x · {formatTime(purchase.purchasedAt)}</p>
      </div>
    </div>
  );
}

export default function DropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dropId = params.id as string;
  const drop = MOCK_DROPS[dropId];

  if (!drop) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Drop not found</h2>
        <p className="text-muted-foreground mt-1">This drop doesn&apos;t exist or has been deleted.</p>
        <Button className="mt-4" onClick={() => router.push("/app/drops")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drops
        </Button>
      </div>
    );
  }

  const progress = drop.quantity_limit
    ? Math.round((drop.quantity_sold / drop.quantity_limit) * 100)
    : null;
  const isSoldOut = drop.quantity_limit && drop.quantity_sold >= drop.quantity_limit;

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/d/${drop.slug}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this drop? This action cannot be undone.")) {
      return;
    }
    setDeleting(true);
    await new Promise(r => setTimeout(r, 1000));
    router.push("/app/drops");
  };

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
              <StatusBadge status={drop.status} type="drop" />
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
            {drop.cover_url ? (
              <Image
                src={drop.cover_url}
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
                TYPE_COLORS[drop.type]
              )}>
                {drop.type}
              </span>
            </div>
            {progress !== null && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between text-white mb-2">
                  <span className="text-lg font-semibold">{drop.quantity_sold}/{drop.quantity_limit} sold</span>
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
            <p className="text-muted-foreground">{drop.description}</p>
          </div>

          {/* Recent Purchases */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Recent Purchases</h2>
              <span className="text-sm text-muted-foreground">{drop.quantity_sold} total</span>
            </div>
            {drop.quantity_sold > 0 ? (
              <div className="divide-y divide-border">
                {MOCK_PURCHASES.slice(0, 5).map((purchase) => (
                  <PurchaseRow key={purchase.id} purchase={purchase} />
                ))}
              </div>
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
              {drop.price_cents > 0 ? formatETB(drop.price_cents) : "Free"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4">
            <StatCard
              label="Total Revenue"
              value={formatETB(drop.total_revenue_cents)}
              icon={DollarSign}
              color="success"
            />
            <StatCard
              label="Total Views"
              value={drop.views.toLocaleString()}
              icon={Eye}
            />
            <StatCard
              label="VIPs Captured"
              value={drop.vip_count}
              icon={Users}
              color="primary"
            />
            <StatCard
              label="Sales"
              value={drop.quantity_sold}
              icon={ShoppingCart}
            />
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
              {drop.ends_at && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ends</span>
                  <span className="ml-auto text-foreground">{formatDate(drop.ends_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Conversion Rate */}
          {drop.views > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {((drop.quantity_sold / drop.views) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
