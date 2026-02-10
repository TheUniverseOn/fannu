"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Minus,
  Plus,
  Lock,
  Calendar,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatETB, cn } from "@/lib/utils";
import { initiatePurchase } from "@/lib/actions/purchases";
import type { DropWithCreator } from "@/lib/queries/drops";

interface CheckoutClientProps {
  drop: DropWithCreator;
}

export function CheckoutClient({ drop }: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const unitPrice = drop.price || 0;
  const serviceFee = Math.round(unitPrice * quantity * 0.05); // 5% service fee
  const totalAmount = unitPrice * quantity + serviceFee;

  const maxQuantity = drop.slots_remaining ?? 10;

  const handleSubmit = () => {
    if (!phone.trim()) {
      alert("Please enter your phone number");
      return;
    }
    if (!agreedToTerms) {
      alert("Please agree to the terms to continue");
      return;
    }

    startTransition(async () => {
      const result = await initiatePurchase({
        dropId: drop.id,
        fanPhone: phone,
        fanName: name || undefined,
        quantity,
      });

      if (result.error) {
        alert(result.error);
      } else {
        router.push(`/d/${drop.slug}/confirmed/${result.receiptId}`);
      }
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Link href={`/d/${drop.slug}`} className="p-2 -ml-2">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Checkout</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-lg mx-auto">
        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Item Section */}
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="relative h-[72px] w-[72px] shrink-0 rounded-xl overflow-hidden bg-muted">
            {drop.cover_image_url ? (
              <Image
                src={drop.cover_image_url}
                alt={drop.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-pink-500/20" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-foreground truncate">{drop.title}</h2>
            <p className="text-sm text-muted-foreground">
              by {drop.creator.display_name}
            </p>
            <div className="flex items-center gap-4 mt-1">
              {drop.scheduled_at && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(drop.scheduled_at)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Quantity Section */}
        <div className="flex items-center justify-between px-6 py-4">
          <span className="font-semibold text-foreground">Quantity</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border disabled:opacity-50"
            >
              <Minus className="h-4 w-4 text-foreground" />
            </button>
            <span className="text-lg font-bold text-foreground w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary disabled:opacity-50"
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Price Breakdown */}
        <div className="px-6 py-4 space-y-3">
          <h3 className="font-bold text-foreground">Price breakdown</h3>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {quantity} × {formatETB(unitPrice)}
            </span>
            <span className="font-semibold text-foreground">
              {formatETB(unitPrice * quantity)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span className="font-semibold text-foreground">
              {formatETB(serviceFee)}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-xl font-extrabold text-primary">
              {formatETB(totalAmount)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Phone Section */}
        <div className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your name (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 9XX XXX XXXX"
              required
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <div
              className={cn(
                "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                agreedToTerms
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/50"
              )}
              onClick={() => setAgreedToTerms(!agreedToTerms)}
            >
              {agreedToTerms && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className="text-xs text-muted-foreground leading-relaxed">
              I agree to FanNu&apos;s terms and cancellation policy
            </span>
          </label>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Action Section */}
        <div className="px-6 py-4 space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={isPending || !phone.trim() || !agreedToTerms}
          >
            {isPending ? "Processing..." : `Pay ${formatETB(totalAmount)}`}
          </Button>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span className="text-xs">Secure payment processed by FanNu</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center">
          <a
            href="https://wa.me/251911000000?text=Hi, I need help with my purchase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Having issues? Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
