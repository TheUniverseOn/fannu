import Link from "next/link";
import {
  Bell,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropHero, DropHeader } from "@/components/public/drop-hero";
import { VipCaptureForm } from "@/components/public/vip-capture-form";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { formatETB } from "@/lib/utils";
import type { Creator, DropWithCreator } from "@/types";

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCreator: Creator = {
  id: "creator-1",
  user_id: "user-1",
  slug: "abebe-kebede",
  display_name: "Abebe Kebede",
  bio: "Ethiopian music legend. Making timeless music for generations.",
  avatar_url: null,
  cover_url: null,
  phone: "+251911000001",
  email: "abebe@example.com",
  booking_enabled: true,
  booking_approved: true,
  default_deposit_percent: 30,
  default_deposit_refundable: true,
  default_additional_terms: null,
  status: "ACTIVE",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockDrops: Record<string, DropWithCreator> = {
  "concert-2024": {
    id: "drop-1",
    creator_id: "creator-1",
    slug: "concert-2024",
    title: "Concert Night — Live in Addis",
    description:
      "Join us for an unforgettable night of live music at Millennium Hall. Featuring Abebe Kebede and special guests. Early bird tickets available now — limited spots!",
    cover_image_url:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=900&fit=crop",
    type: "EVENT",
    status: "LIVE",
    scheduled_at: "2026-02-14T20:00:00Z",
    ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    price: 50000,
    currency: "ETB",
    total_slots: 500,
    slots_remaining: 12,
    vip_required: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    creator: mockCreator,
  },
  "valentine-show": {
    id: "drop-2",
    creator_id: "creator-1",
    slug: "valentine-show",
    title: "Valentine's Day Special Show",
    description:
      "A romantic evening of classic Ethiopian love songs. Perfect for couples and music lovers. Limited seating for an intimate experience.",
    cover_image_url:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=900&fit=crop",
    type: "EVENT",
    status: "SCHEDULED",
    scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: null,
    price: 75000,
    currency: "ETB",
    total_slots: 200,
    slots_remaining: 200,
    vip_required: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    creator: mockCreator,
  },
  "exclusive-video": {
    id: "drop-3",
    creator_id: "creator-1",
    slug: "exclusive-video",
    title: "Behind The Scenes: Studio Sessions",
    description:
      "Get exclusive access to never-before-seen footage from our latest recording sessions.",
    cover_image_url:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&h=900&fit=crop",
    type: "CONTENT",
    status: "LIVE",
    scheduled_at: null,
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    price: 0,
    currency: "ETB",
    total_slots: null,
    slots_remaining: null,
    vip_required: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    creator: mockCreator,
  },
  "new-year-show": {
    id: "drop-4",
    creator_id: "creator-1",
    slug: "new-year-show",
    title: "Ethiopian New Year Celebration",
    description:
      "A special celebration of Ethiopian New Year with traditional and contemporary music.",
    cover_image_url:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=900&fit=crop",
    type: "EVENT",
    status: "ENDED",
    scheduled_at: null,
    ends_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    price: 40000,
    currency: "ETB",
    total_slots: 1000,
    slots_remaining: 0,
    vip_required: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    creator: mockCreator,
  },
  "merch-drop": {
    id: "drop-5",
    creator_id: "creator-1",
    slug: "merch-drop",
    title: "Limited Edition T-Shirt Collection",
    description:
      "Exclusive merch drop featuring limited edition t-shirts with original artwork.",
    cover_image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&h=900&fit=crop",
    type: "MERCH",
    status: "LIVE",
    scheduled_at: null,
    ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    price: 150000,
    currency: "ETB",
    total_slots: 50,
    slots_remaining: 0,
    vip_required: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    creator: mockCreator,
  },
};

function getDropData(slug: string): DropWithCreator | null {
  return mockDrops[slug] || null;
}

// ============================================================================
// DROP ACTIONS
// ============================================================================

interface DropActionsProps {
  drop: DropWithCreator;
}

function DropActions({ drop }: DropActionsProps) {
  const isFree = drop.price === 0;
  const hasSlots = drop.total_slots !== null;
  const slotsRemaining = drop.slots_remaining ?? 0;
  const isSoldOut = hasSlots && slotsRemaining === 0;

  if (drop.status === "SCHEDULED") {
    return (
      <div className="space-y-3 px-6 py-2 md:px-8">
        <Button className="w-full" size="lg">
          <Bell className="h-5 w-5" />
          Notify Me When It Drops
        </Button>
        <Button variant="outline" className="w-full" size="lg">
          Join VIP
        </Button>
      </div>
    );
  }

  if (drop.status === "ENDED") {
    return (
      <div className="space-y-3 px-6 py-2 md:px-8">
        <Button variant="secondary" className="w-full" size="lg" disabled>
          This drop has ended
        </Button>
        <p className="text-center text-subhead text-muted-foreground">
          Join the VIP list below to catch the next one!
        </p>
      </div>
    );
  }

  if (isSoldOut) {
    return (
      <div className="space-y-3 px-6 py-2 md:px-8">
        <Button variant="secondary" className="w-full" size="lg" disabled>
          Sold Out
        </Button>
        <p className="text-center text-subhead text-muted-foreground">
          Join the VIP list to be first in line for the next drop
        </p>
      </div>
    );
  }

  if (drop.status === "LIVE") {
    return (
      <div className="space-y-3 px-6 py-2 md:px-8">
        <Button className="w-full" size="lg">
          {isFree ? "Get It Free" : `Buy Now — ${formatETB(drop.price)}`}
        </Button>
        <Button variant="outline" className="w-full" size="lg">
          Join VIP
        </Button>
      </div>
    );
  }

  return null;
}

// ============================================================================
// BOOK CREATOR CTA
// ============================================================================

interface BookCreatorCTAProps {
  creator: Creator;
}

function BookCreatorCTA({ creator }: BookCreatorCTAProps) {
  if (!creator.booking_enabled || !creator.booking_approved) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-8 md:py-6">
      <div className="space-y-1">
        <h3 className="font-display text-headline text-foreground">
          Want to book {creator.display_name.split(" ")[0]}?
        </h3>
        <p className="text-subhead text-muted-foreground">
          Request a booking for your event
        </p>
      </div>
      <Link href={`/book/${creator.slug}`}>
        <Button variant="secondary" size="sm">
          <Calendar className="h-4 w-4" />
          Book
        </Button>
      </Link>
    </div>
  );
}

// ============================================================================
// DIVIDER
// ============================================================================

function Divider() {
  return <div className="h-px bg-border mx-6 md:mx-8" />;
}

// ============================================================================
// NOT FOUND
// ============================================================================

function DropNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-card border border-border">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-display text-display text-foreground">Drop Not Found</h1>
        <p className="mt-2 text-body text-muted-foreground">
          This drop may have been removed or the link is incorrect.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="outline">Go to Home</Button>
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

interface DropPageProps {
  params: {
    dropSlug: string;
  };
}

export default function DropPage({ params }: DropPageProps) {
  const drop = getDropData(params.dropSlug);

  if (!drop) {
    return <DropNotFound />;
  }

  const { creator } = drop;
  const showVIPForm = drop.status !== "CANCELLED";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <DropHero drop={drop} creator={creator} />

      {/* Drop Header */}
      <DropHeader drop={drop} />

      {/* Primary CTAs */}
      <DropActions drop={drop} />

      <Divider />

      {/* VIP Capture Form */}
      {showVIPForm && (
        <div className="px-6 py-6 md:px-8 md:py-8">
          <VipCaptureForm
            creatorName={creator.display_name}
            creatorId={creator.id}
            dropId={drop.id}
            source="DROP_PAGE"
          />
        </div>
      )}

      <Divider />

      {/* Book This Creator */}
      <BookCreatorCTA creator={creator} />

      <Divider />

      {/* Footer */}
      <PoweredByFooter />
    </div>
  );
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: DropPageProps) {
  const drop = getDropData(params.dropSlug);

  if (!drop) {
    return {
      title: "Drop Not Found | FanNu",
    };
  }

  return {
    title: `${drop.title} | ${drop.creator.display_name} | FanNu`,
    description: drop.description || `Get ${drop.title} from ${drop.creator.display_name}`,
    openGraph: {
      title: drop.title,
      description: drop.description || `Get ${drop.title} from ${drop.creator.display_name}`,
      images: drop.cover_image_url ? [drop.cover_image_url] : [],
    },
  };
}
