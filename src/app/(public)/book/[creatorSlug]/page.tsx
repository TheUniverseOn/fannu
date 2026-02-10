import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCreatorBySlug } from "@/lib/queries/creators";
import { BookingRequestForm } from "@/components/public/booking-request-form";

interface BookPageProps {
  params: Promise<{
    creatorSlug: string;
  }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { creatorSlug } = await params;
  const creator = await getCreatorBySlug(creatorSlug);

  if (!creator) {
    notFound();
  }

  return (
    <div className="py-8 pb-16 md:py-12">
      <div className="w-full px-4 md:px-6">
        {/* Back Link */}
        <Link
          href={`/c/${creator.slug}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to profile
        </Link>

        {/* Creator Mini Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {creator.avatar_url ? (
              <Image
                src={creator.avatar_url}
                alt={creator.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-pink-500/20 text-lg font-semibold">
                {creator.display_name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Request a Booking
            </h1>
            <p className="text-muted-foreground">
              with {creator.display_name}
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <BookingRequestForm
          creatorId={creator.id}
          creatorSlug={creator.slug}
          creatorName={creator.display_name}
          acceptingBookings={creator.booking_enabled}
        />
      </div>
    </div>
  );
}
