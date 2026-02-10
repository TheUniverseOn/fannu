import { notFound, redirect } from "next/navigation";
import { getBookingById } from "@/lib/queries/bookings";
import { CheckoutClient } from "./checkout-client";

interface CheckoutPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    notFound();
  }

  // Only allow checkout for QUOTED bookings
  if (booking.status !== "QUOTED") {
    // If already paid, redirect to receipt
    if (booking.status === "DEPOSIT_PAID" || booking.status === "CONFIRMED") {
      const payment = booking.payments.find((p) => p.status === "PAID");
      if (payment) {
        redirect(`/booking/${bookingId}/receipt/${payment.receipt_id}`);
      }
    }
    // Otherwise redirect back to booking page
    redirect(`/booking/${bookingId}`);
  }

  // Get the active quote
  const activeQuote = booking.quotes.find((q) => q.status === "ACTIVE");
  if (!activeQuote) {
    redirect(`/booking/${bookingId}`);
  }

  // Check if quote is expired
  if (new Date(activeQuote.expires_at) < new Date()) {
    redirect(`/booking/${bookingId}`);
  }

  return (
    <CheckoutClient
      booking={booking}
      quote={activeQuote}
    />
  );
}
