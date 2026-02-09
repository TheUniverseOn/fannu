"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  Upload,
  X,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  scheduled_at?: string;
  ends_at?: string;
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
    ends_at: "2024-02-14T23:59:59Z",
  },
};

// Components
function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function EditDropPage() {
  const params = useParams();
  const router = useRouter();
  const dropId = params.id as string;
  const drop = MOCK_DROPS[dropId];

  // Form state
  const [title, setTitle] = useState(drop?.title || "");
  const [description, setDescription] = useState(drop?.description || "");
  const [type, setType] = useState<DropType>(drop?.type || "EVENT");
  const [priceETB, setPriceETB] = useState(drop ? (drop.price_cents / 100).toString() : "");
  const [quantityLimit, setQuantityLimit] = useState(drop?.quantity_limit?.toString() || "");
  const [coverUrl, setCoverUrl] = useState(drop?.cover_url || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!drop) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Drop not found</h2>
        <p className="text-muted-foreground mt-1">This drop doesn't exist or has been deleted.</p>
        <Button className="mt-4" onClick={() => router.push("/app/drops")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drops
        </Button>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      router.push(`/app/drops/${dropId}`);
    }, 1000);
  };

  const isEditable = drop.status === "draft" || drop.status === "scheduled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/app/drops/${dropId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Drop</h1>
            <p className="text-muted-foreground mt-1">{drop.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/app/drops/${dropId}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || saved}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : saved ? (
              <><span className="mr-2">✓</span>Saved!</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Save Changes</>
            )}
          </Button>
        </div>
      </div>

      {!isEditable && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
          <p className="text-sm text-warning">
            This drop is currently {drop.status}. Some fields cannot be edited.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <SettingsCard title="Basic Information">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter drop title"
                  disabled={!isEditable && drop.quantity_sold > 0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your drop..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Drop Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as DropType)} disabled={!isEditable}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EVENT">Event / Tickets</SelectItem>
                    <SelectItem value="MERCH">Merchandise</SelectItem>
                    <SelectItem value="CONTENT">Digital Content</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SettingsCard>

          {/* Pricing */}
          <SettingsCard title="Pricing & Inventory">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (ETB)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">ETB</span>
                  <Input
                    id="price"
                    type="number"
                    value={priceETB}
                    onChange={(e) => setPriceETB(e.target.value)}
                    className="pl-12"
                    placeholder="0"
                    disabled={!isEditable && drop.quantity_sold > 0}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Set to 0 for free drops</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Limit (Optional)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantityLimit}
                  onChange={(e) => setQuantityLimit(e.target.value)}
                  placeholder="Unlimited"
                  disabled={!isEditable && drop.quantity_sold > 0}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for unlimited availability
                  {drop.quantity_sold > 0 && ` (${drop.quantity_sold} already sold)`}
                </p>
              </div>
            </div>
          </SettingsCard>

          {/* Cover Image */}
          <SettingsCard title="Cover Image">
            <div className="space-y-4">
              {coverUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={coverUrl}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setCoverUrl(null)}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-foreground">Click to upload</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                </label>
              )}
            </div>
          </SettingsCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <SettingsCard title="Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Status</span>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                  drop.status === "live" && "bg-green-500/10 text-green-500",
                  drop.status === "scheduled" && "bg-blue-500/10 text-blue-500",
                  drop.status === "draft" && "bg-muted text-muted-foreground",
                  drop.status === "ended" && "bg-gray-500/10 text-gray-500"
                )}>
                  {drop.status}
                </span>
              </div>
              {drop.status === "draft" && (
                <Button className="w-full" variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Publish Now
                </Button>
              )}
            </div>
          </SettingsCard>

          {/* Schedule */}
          {(drop.status === "draft" || drop.status === "scheduled") && (
            <SettingsCard title="Schedule">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">Start Date & Time</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      className="pl-10"
                      defaultValue={drop.scheduled_at ? new Date(drop.scheduled_at).toISOString().slice(0, 16) : ""}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends_at">End Date & Time (Optional)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ends_at"
                      type="datetime-local"
                      className="pl-10"
                      defaultValue={drop.ends_at ? new Date(drop.ends_at).toISOString().slice(0, 16) : ""}
                    />
                  </div>
                </div>
              </div>
            </SettingsCard>
          )}

          {/* Stats (Read-only) */}
          {drop.quantity_sold > 0 && (
            <SettingsCard title="Performance">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sold</span>
                  <span className="font-medium text-foreground">{drop.quantity_sold}</span>
                </div>
                {drop.quantity_limit && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-medium text-foreground">{drop.quantity_limit - drop.quantity_sold}</span>
                  </div>
                )}
              </div>
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  );
}
