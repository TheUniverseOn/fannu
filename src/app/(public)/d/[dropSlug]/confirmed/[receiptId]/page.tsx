import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Copy, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoweredByFooter } from "@/components/public/powered-by-footer";
import { formatETB } from "@/lib/utils";
import { getPurchaseByReceiptId } from "@/lib/actions/purchases";

interface ConfirmedPageProps {
  params: Promise<{ dropSlug: string; receiptId: string }>;
}

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Copy className="h-4 w-4" />
    </button>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={highlight ? "text-primary font-bold" : "text-sm font-semibold text-foreground"}>
        {value}
      </span>
    </div>
  );
}

export default async function ConfirmedPage({ params }: ConfirmedPageProps) {
  const { dropSlug, receiptId } = await params;
  const purchase = await getPurchaseByReceiptId(receiptId);

  if (!purchase || purchase.drop.slug !== dropSlug) {
    notFound();
  }

  const { drop } = purchase;
  const creator = drop.creator;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " · " + new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-6 py-12">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-9 w-9 text-green-500" />
          </div>
          <h1 className="text-[28px] font-extrabold text-foreground">You&apos;re in!</h1>
          <p className="text-muted-foreground leading-relaxed max-w-[300px]">
            Your tickets for {drop.title} are confirmed
          </p>
          <div className="flex items-center gap-2 rounded-2xl bg-card border border-border px-5 py-3">
            <span className="text-sm text-muted-foreground">Order:</span>
            <span className="font-bold text-primary">{purchase.receipt_id}</span>
            <CopyButton text={purchase.receipt_id} />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-6" />

        {/* Ticket Details */}
        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-foreground">Ticket details</h3>
          <DetailRow label="Event" value={drop.title} />
          <DetailRow
            label="Tickets"
            value={`${purchase.quantity} × General Admission`}
          />
          <DetailRow label="Date" value={formatDate(drop.scheduled_at)} />
          <DetailRow label="Location" value="Venue TBA" />
          <DetailRow
            label="Amount paid"
            value={formatETB(purchase.amount)}
            highlight
          />
        </div>

        {/* Note Box */}
        <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 mb-6">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Show this screen or your order reference at the door
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-6" />

        {/* Actions */}
        <div className="space-y-3 mb-8">
          <Button className="w-full" size="lg">
            <Share2 className="mr-2 h-5 w-5" />
            Share with Friends
          </Button>
          <Link href={`/c/${creator.slug}`} className="block">
            <Button variant="outline" className="w-full" size="lg">
              View Creator Profile
            </Button>
          </Link>
        </div>
      </div>

      <PoweredByFooter />
    </div>
  );
}
