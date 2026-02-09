"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { BookingRequestForm } from "@/components/public/booking-request-form";
import { ArrowLeft } from "lucide-react";

interface BookPageProps {
  params: {
    creatorSlug: string;
  };
}

// Mock creator data - in a real app, this would be fetched from an API
const getMockCreator = (slug: string) => {
  const creators: Record<string, {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string;
    acceptingBookings: boolean;
  }> = {
    "teddy-afro": {
      id: "creator_1",
      name: "Teddy Afro",
      slug: "teddy-afro",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
      acceptingBookings: true,
    },
    "aster-aweke": {
      id: "creator_2",
      name: "Aster Aweke",
      slug: "aster-aweke",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
      acceptingBookings: true,
    },
    "tilahun-gessesse": {
      id: "creator_3",
      name: "Tilahun Gessesse",
      slug: "tilahun-gessesse",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces",
      acceptingBookings: false, // Not accepting bookings example
    },
  };

  // Return creator if found, or generate a default one
  return (
    creators[slug] || {
      id: `creator_${slug}`,
      name: slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      slug,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${slug}`,
      acceptingBookings: true,
    }
  );
};

export default function BookPage({ params }: BookPageProps) {
  const creator = getMockCreator(params.creatorSlug);

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
            <Image
              src={creator.avatarUrl}
              alt={creator.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Request a Booking
            </h1>
            <p className="text-muted-foreground">
              with {creator.name}
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <BookingRequestForm creator={creator} />
      </div>
    </div>
  );
}
