import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatorHeader, CreatorHeaderSkeleton } from "@/components/public/creator-header";
import { DropCardGrid, DropCardGridSkeleton, type DropCardData } from "@/components/public/drop-card";
import { VipCaptureForm } from "@/components/public/vip-capture-form";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { getCreatorBySlug } from "@/lib/queries/creators";
import { getDropsByCreatorSlug } from "@/lib/queries/drops";

// Page props
interface CreatorPageProps {
  params: Promise<{
    creatorSlug: string;
  }>;
}

// Main page component
export default async function CreatorPage({ params }: CreatorPageProps) {
  const { creatorSlug } = await params;
  const creator = await getCreatorBySlug(creatorSlug);

  if (!creator) {
    notFound();
  }

  const drops = await getDropsByCreatorSlug(creatorSlug);

  // Map drops to DropCardData format
  const activeDrops: DropCardData[] = drops.map((drop) => ({
    id: drop.id,
    slug: drop.slug,
    title: drop.title,
    type: drop.type.toLowerCase() as "event" | "merch" | "content" | "custom",
    status: drop.status.toLowerCase() as "live" | "scheduled" | "ended",
    price_cents: drop.price ?? undefined,
    cover_url: drop.cover_image_url ?? undefined,
    quantity_limit: drop.total_slots ?? undefined,
    quantity_sold: drop.total_slots && drop.slots_remaining
      ? drop.total_slots - drop.slots_remaining
      : undefined,
  }));

  const canBook = creator.booking_enabled && creator.booking_approved;

  return (
    <div className="min-h-screen pb-8">
      {/* Profile Header */}
      <Suspense fallback={<CreatorHeaderSkeleton />}>
        <CreatorHeader
          coverUrl={creator.cover_url}
          avatarUrl={creator.avatar_url}
          displayName={creator.display_name}
          bio={creator.bio}
        />
      </Suspense>

      {/* Main Content */}
      <div className="mt-8 px-4 sm:px-6 md:px-8 space-y-10 md:space-y-12">
        {/* Primary Actions */}
        <section className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {canBook ? (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={`/book/${creator.slug}`}>
                <Calendar className="mr-2 h-5 w-5" />
                Book Me
              </Link>
            </Button>
          ) : creator.booking_enabled ? (
            <p className="text-sm text-muted-foreground py-3">
              Booking requests are currently being reviewed.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground py-3">
              Booking is currently unavailable.
            </p>
          )}
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <a href="#vip-section">
              <Star className="mr-2 h-5 w-5" />
              Join VIP
            </a>
          </Button>
        </section>

        {/* Active Drops Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Active Drops</h2>
          </div>

          {activeDrops.length > 0 ? (
            <Suspense fallback={<DropCardGridSkeleton count={3} />}>
              <DropCardGrid drops={activeDrops} />
            </Suspense>
          ) : (
            <div className="rounded-xl border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                No active drops right now
              </h3>
              <p className="mt-2 text-muted-foreground">
                Join the VIP list to be first to know when new drops go live!
              </p>
            </div>
          )}
        </section>

        {/* VIP Capture Section */}
        <section id="vip-section">
          <VipCaptureForm
            creatorName={creator.display_name}
            creatorId={creator.id}
            source="CREATOR_PROFILE"
          />
        </section>
      </div>

      {/* Footer */}
      <PoweredByFooter />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CreatorPageProps) {
  const { creatorSlug } = await params;
  const creator = await getCreatorBySlug(creatorSlug);

  if (!creator) {
    return {
      title: "Creator Not Found | FanNu",
    };
  }

  return {
    title: `${creator.display_name} | FanNu`,
    description: creator.bio || `Check out ${creator.display_name} on FanNu - exclusive drops, bookings, and more.`,
    openGraph: {
      title: creator.display_name,
      description: creator.bio || `Exclusive drops and bookings from ${creator.display_name}`,
      images: creator.cover_url ? [creator.cover_url] : [],
    },
  };
}
