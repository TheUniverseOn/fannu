import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { getCreatorBySlug } from "@/lib/queries/creators";

interface VipSuccessPageProps {
  params: Promise<{ creatorSlug: string }>;
  searchParams: Promise<{ phone?: string; channel?: string }>;
}

export default async function VipSuccessPage({ params, searchParams }: VipSuccessPageProps) {
  const { creatorSlug } = await params;
  const { channel } = await searchParams;

  const creator = await getCreatorBySlug(creatorSlug);

  if (!creator) {
    notFound();
  }

  const channelLabel = channel === "TELEGRAM"
    ? "Telegram"
    : channel === "WHATSAPP"
    ? "WhatsApp"
    : "SMS";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-center px-4 py-3 border-b border-border">
        <Link href={`/c/${creator.slug}`} className="absolute left-4 p-2">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Link>
        <h1 className="text-lg font-semibold text-foreground">VIP Confirmation</h1>
      </div>

      {/* Spacer */}
      <div className="h-10" />

      {/* Success Content */}
      <div className="flex flex-col items-center text-center px-6 gap-5">
        {/* Success Circle */}
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-success/20">
          <CheckCircle2 className="h-11 w-11 text-success" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground">
          You&apos;re on the VIP list!
        </h2>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed max-w-[340px]">
          Welcome to {creator.display_name}&apos;s inner circle. You&apos;ll be the first
          to know about new drops, exclusive deals, and upcoming shows.
        </p>
      </div>

      {/* VIP Details Card */}
      <div className="px-6 mt-6">
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Creator</span>
            <span className="text-sm font-semibold text-foreground">{creator.display_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-semibold text-success">Active VIP</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Notifications</span>
            <span className="text-sm font-semibold text-foreground">via {channelLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-semibold text-foreground">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 py-6 space-y-3">
        <Link href={`/c/${creator.slug}`}>
          <Button className="w-full" size="lg">
            <Sparkles className="h-5 w-5" />
            Browse More Drops
          </Button>
        </Link>
        <Button variant="outline" className="w-full" size="lg">
          <Share2 className="h-5 w-5" />
          Share with Friends
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <PoweredByFooter />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: VipSuccessPageProps) {
  const { creatorSlug } = await params;
  const creator = await getCreatorBySlug(creatorSlug);

  if (!creator) {
    return { title: "VIP | FanNu" };
  }

  return {
    title: `VIP Confirmed | ${creator.display_name} | FanNu`,
    description: `You're now a VIP member of ${creator.display_name}'s inner circle!`,
  };
}
