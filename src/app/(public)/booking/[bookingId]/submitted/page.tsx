import { notFound } from "next/navigation";
import { getBookingById } from "@/lib/queries/bookings";
import { BookingSubmittedClient } from "./booking-submitted-client";

interface BookingSubmittedPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default async function BookingSubmittedPage({ params }: BookingSubmittedPageProps) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  return (
    <BookingSubmittedClient
      booking={{
        id: booking.id,
        reference_code: booking.reference_code,
        type: booking.type,
        start_at: booking.start_at,
        location_city: booking.location_city,
        location_venue: booking.location_venue,
        budget_min: booking.budget_min,
        budget_max: booking.budget_max,
        booker_name: booking.booker_name,
      }}
      creator={{
        id: booking.creator.id,
        slug: booking.creator.slug,
        display_name: booking.creator.display_name,
        avatar_url: booking.creator.avatar_url,
      }}
    />
  );
}
