"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { formatETB } from "@/lib/utils";
import { initiateBookingPayment } from "@/lib/actions/payments";
import type { Tables } from "@/types/database";

interface CheckoutClientProps {
  booking: Tables<"bookings"> & {
    creator: Tables<"creators">;
  };
  quote: Tables<"booking_quotes">;
}

export function CheckoutClient({ booking, quote }: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = () => {
    setIsProcessing(true);
    setError(null);

    startTransition(async () => {
      const result = await initiateBookingPayment(booking.id, quote.id);

      if (result.error) {
        setError(result.error);
        setIsProcessing(false);
        return;
      }

      // If we have a payment URL, redirect to it
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else if (result.receiptId) {
        // If payment was instant (mock), go to receipt
        router.push(`/booking/${booking.id}/receipt/${result.receiptId}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Back link */}
        <Link
          href={`/booking/${booking.id}`}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to quote
        </Link>

        <div className="w-full max-w-sm space-y-6">
          {/* Logo */}
          <h1 className="text-2xl font-extrabold text-primary text-center">
            FanNu
          </h1>

          {/* Card */}
          <div className="rounded-3xl bg-card border border-border p-8 space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Confirm payment
              </h2>
              <p className="text-sm text-muted-foreground">
                Paying deposit for booking with {booking.creator.display_name}
              </p>
            </div>

            {/* Amount */}
            <p className="text-4xl font-extrabold text-foreground text-center">
              {formatETB(quote.deposit_amount)}
            </p>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Pay Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isProcessing || isPending}
            >
              {isProcessing || isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to payment"
              )}
            </Button>
          </div>

          {/* Secure Badge */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className="text-xs">Secure payment processed by FanNu</span>
          </div>
        </div>
      </div>

      <PoweredByFooter />
    </div>
  );
}
