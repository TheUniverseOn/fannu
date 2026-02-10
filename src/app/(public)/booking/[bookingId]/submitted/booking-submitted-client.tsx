"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Copy,
  Check,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VipCaptureForm } from "@/components/public/vip-capture-form";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { formatETB } from "@/lib/utils";

// Types
interface BookingData {
  id: string;
  reference_code: string;
  type: "LIVE_PERFORMANCE" | "MC_HOSTING" | "BRAND_CONTENT" | "CUSTOM";
  start_at: string;
  location_city: string;
  location_venue: string | null;
  budget_min: number;
  budget_max: number;
  booker_name: string;
}

interface CreatorData {
  id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
}

interface BookingSubmittedClientProps {
  booking: BookingData;
  creator: CreatorData;
}

// Helpers
const BOOKING_TYPE_LABELS: Record<string, string> = {
  LIVE_PERFORMANCE: "Live Performance",
  MC_HOSTING: "MC / Hosting",
  BRAND_CONTENT: "Brand Content",
  CUSTOM: "Custom",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatBudgetRange(min: number, max: number): string {
  if (min === 0 && max === 0) {
    return "Not specified";
  }
  const formatShort = (n: number) => {
    if (n >= 1000000) return `ETB ${(n / 100 / 1000).toFixed(0)}K`;
    return formatETB(n);
  };
  return `${formatShort(min)} – ${formatShort(max)}`;
}

// Components
function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function BookingSubmittedClient({ booking, creator }: BookingSubmittedClientProps) {
  const [copied, setCopied] = useState(false);
  const [showVipForm, setShowVipForm] = useState(false);

  const handleCopyReference = async () => {
    await navigator.clipboard.writeText(booking.reference_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8 md:py-12">
        {/* Success Animation / Icon */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Request Sent!</h1>
          <p className="mt-2 text-muted-foreground">
            Your booking request has been sent to{" "}
            <span className="font-medium text-foreground">
              {creator.display_name}
            </span>
          </p>
        </div>

        {/* Reference Code */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Your reference</p>
              <p className="text-lg font-bold tracking-wider text-foreground">
                {booking.reference_code}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyReference}
              className="shrink-0"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Request Summary */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Request Summary
          </h3>
          <div className="space-y-4">
            <SummaryRow
              icon={Calendar}
              label="Date"
              value={formatDate(booking.start_at)}
            />
            <SummaryRow
              icon={Tag}
              label="Type"
              value={BOOKING_TYPE_LABELS[booking.type]}
            />
            <SummaryRow
              icon={MapPin}
              label="Location"
              value={
                booking.location_venue
                  ? `${booking.location_venue}, ${booking.location_city}`
                  : booking.location_city
              }
            />
            <SummaryRow
              icon={DollarSign}
              label="Budget"
              value={formatBudgetRange(booking.budget_min, booking.budget_max)}
            />
          </div>
        </div>

        {/* Response Time Note */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">What happens next?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ll receive a response via WhatsApp or SMS, typically
              within 24 hours. Keep your phone handy!
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          {/* VIP Cross-sell */}
          {!showVipForm ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() => setShowVipForm(true)}
            >
              <Star className="mr-2 h-5 w-5" />
              Join {creator.display_name}&apos;s VIP List
            </Button>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4">
              <VipCaptureForm
                creatorName={creator.display_name}
                creatorId={creator.id}
                creatorSlug={creator.slug}
                source="DIRECT_LINK"
              />
            </div>
          )}

          {/* Track Booking */}
          <Link href={`/track/${booking.reference_code}`} className="block">
            <Button variant="outline" className="w-full" size="lg">
              Track Booking Status
            </Button>
          </Link>

          {/* Back to Profile */}
          <Link href={`/c/${creator.slug}`} className="block">
            <Button variant="ghost" className="w-full" size="lg">
              Back to {creator.display_name}&apos;s Profile
            </Button>
          </Link>
        </div>

        {/* Creator Mini Card */}
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
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
            <p className="text-sm font-medium text-foreground">
              {creator.display_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Will review your request
            </p>
          </div>
        </div>

        {/* Support Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Questions?{" "}
            <a
              href={`https://wa.me/251911000000?text=Hi, I need help with booking reference ${booking.reference_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>

      <PoweredByFooter />
    </div>
  );
}
