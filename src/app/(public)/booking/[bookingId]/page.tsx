import { getBookingById } from "@/lib/queries/bookings";
import { QuotePageClient } from "./quote-page-client";
import { AlertCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoweredByFooter } from "@/components/public/powered-by-footer";

interface BookingPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-background">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-card border border-border">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Booking Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This booking doesn&apos;t exist or the link has expired. Please
            contact support if you believe this is an error.
          </p>
          <a
            href="https://wa.me/251911000000?text=Hi, I need help finding my booking"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block"
          >
            <Button variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </a>
        </div>
        <PoweredByFooter />
      </div>
    );
  }

  return <QuotePageClient booking={booking} />;
}
