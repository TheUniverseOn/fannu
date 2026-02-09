import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropHero, DropHeader } from "@/components/public/drop-hero";
import { VipCaptureForm } from "@/components/public/vip-capture-form";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { formatETB } from "@/lib/utils";
import { getDropBySlug, type DropWithCreator } from "@/lib/queries/drops";
import type { Creator } from "@/lib/queries/creators";

// ============================================================================
// DROP ACTIONS
// ============================================================================

interface DropActionsProps {
  drop: DropWithCreator;
}

function DropActions({ drop }: DropActionsProps) {
  const isFree = !drop.price || drop.price === 0;
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
          {isFree ? "Get It Free" : `Buy Now — ${formatETB(drop.price!)}`}
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
// MAIN PAGE
// ============================================================================

interface DropPageProps {
  params: Promise<{
    dropSlug: string;
  }>;
}

export default async function DropPage({ params }: DropPageProps) {
  const { dropSlug } = await params;
  const drop = await getDropBySlug(dropSlug);

  if (!drop) {
    notFound();
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
  const { dropSlug } = await params;
  const drop = await getDropBySlug(dropSlug);

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
