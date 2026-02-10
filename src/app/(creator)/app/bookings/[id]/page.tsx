import { redirect } from "next/navigation";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getBookingById } from "@/lib/queries/bookings";
import { getCreatorByUserId } from "@/lib/queries/creators";
import { getCurrentUser } from "@/lib/auth";
import { BookingDetailClient } from "./booking-detail-client";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;

  // Get current user and verify they're a creator
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const creator = await getCreatorByUserId(user.id);
  if (!creator) {
    redirect("/login");
  }

  // Fetch the booking
  const booking = await getBookingById(id);

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Booking not found</h2>
        <p className="text-muted-foreground mt-1">This booking doesn&apos;t exist or has been deleted.</p>
        <Link href="/app/bookings">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  // Verify the booking belongs to this creator
  if (booking.creator_id !== creator.id) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Access denied</h2>
        <p className="text-muted-foreground mt-1">You don&apos;t have access to view this booking.</p>
        <Link href="/app/bookings">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  return <BookingDetailClient booking={booking} />;
}
