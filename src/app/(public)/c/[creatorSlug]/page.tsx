import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatorHeader, CreatorHeaderSkeleton } from "@/components/public/creator-header";
import { DropCardGrid, DropCardGridSkeleton, type DropCardData } from "@/components/public/drop-card";
import { VipCaptureForm } from "@/components/public/vip-capture-form";
import { PoweredByFooter } from "@/components/public/powered-by-footer";

// Types
interface Creator {
  id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  booking_enabled: boolean;
  booking_approved: boolean;
}

// Mock data for demo
const MOCK_CREATORS: Record<string, Creator> = {
  "dj-abel": {
    id: "1",
    slug: "dj-abel",
    display_name: "DJ Abel",
    bio: "Ethiopia's #1 DJ. Spinning the hottest Afrobeats, Amharic hits, and international tracks. Book me for your events or grab exclusive merch and experiences.",
    avatar_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face",
    cover_url: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1200&h=400&fit=crop",
    booking_enabled: true,
    booking_approved: true,
  },
  "betty-g": {
    id: "2",
    slug: "betty-g",
    display_name: "Betty G",
    bio: "Singer, songwriter, and performer. Creating music that moves your soul. Join my VIP list for exclusive content and early access to shows.",
    avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    cover_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=400&fit=crop",
    booking_enabled: true,
    booking_approved: false, // Booking pending approval
  },
  "mc-mike": {
    id: "3",
    slug: "mc-mike",
    display_name: "MC Mike",
    bio: "Your favorite hype man and event host. Bringing the energy to every occasion!",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    cover_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&h=400&fit=crop",
    booking_enabled: false, // Booking disabled
    booking_approved: true,
  },
};

const MOCK_DROPS: Record<string, DropCardData[]> = {
  "dj-abel": [
    {
      id: "d1",
      slug: "nye-2024-vip",
      title: "NYE 2024 VIP Experience",
      type: "experience",
      status: "live",
      price_cents: 500000,
      cover_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
      quantity_limit: 50,
      quantity_sold: 32,
    },
    {
      id: "d2",
      slug: "signed-merch-bundle",
      title: "Signed Merch Bundle",
      type: "merch",
      status: "live",
      price_cents: 250000,
      cover_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop",
      quantity_limit: 100,
      quantity_sold: 45,
    },
    {
      id: "d3",
      slug: "virtual-dj-session",
      title: "1-on-1 Virtual DJ Session",
      type: "experience",
      status: "scheduled",
      price_cents: 750000,
      cover_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop",
      quantity_limit: 10,
      quantity_sold: 0,
    },
  ],
  "betty-g": [
    {
      id: "d4",
      slug: "exclusive-single-preview",
      title: "Exclusive New Single Preview",
      type: "content",
      status: "live",
      price_cents: 100000,
      cover_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    },
  ],
  "mc-mike": [], // No active drops
};

// Server function to get creator (simulated)
async function getCreator(slug: string): Promise<Creator | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return MOCK_CREATORS[slug] || null;
}

// Server function to get active drops
async function getActiveDrops(creatorId: string, creatorSlug: string): Promise<DropCardData[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const drops = MOCK_DROPS[creatorSlug] || [];
  // Filter to only show LIVE or SCHEDULED drops
  return drops.filter((d) => d.status === "live" || d.status === "scheduled");
}

// Page props
interface CreatorPageProps {
  params: Promise<{
    creatorSlug: string;
  }>;
}

// Main page component
export default async function CreatorPage({ params }: CreatorPageProps) {
  const { creatorSlug } = await params;
  const creator = await getCreator(creatorSlug);

  if (!creator) {
    notFound();
  }

  const activeDrops = await getActiveDrops(creator.id, creator.slug);
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
          <VipCaptureForm creatorName={creator.display_name} />
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
  const creator = await getCreator(creatorSlug);

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
