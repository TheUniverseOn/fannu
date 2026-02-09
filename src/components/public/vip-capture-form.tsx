"use client";

import * as React from "react";
import { CheckCircle2, Loader2, AlertCircle, Send, MessageCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput, validateEthiopianPhone } from "@/components/shared/phone-input";
import { cn } from "@/lib/utils";
import type { VIPChannel } from "@/types";

interface VipCaptureFormProps {
  creatorName: string;
  creatorId?: string;
  dropId?: string;
  source?: "DROP_PAGE" | "CREATOR_PROFILE" | "DIRECT_LINK";
  onSuccess?: () => void;
  className?: string;
}

type FormState = "idle" | "loading" | "success" | "error";

const channels: { value: VIPChannel; label: string; icon: React.ElementType }[] = [
  { value: "TELEGRAM", label: "Telegram", icon: Send },
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
  { value: "SMS", label: "SMS", icon: Smartphone },
];

/**
 * VIP Capture Form - FanNu Dark Theme Design
 */
export function VipCaptureForm({
  creatorName,
  creatorId: _creatorId,
  dropId: _dropId,
  source: _source = "DROP_PAGE",
  onSuccess,
  className,
}: VipCaptureFormProps) {
  void _creatorId;
  void _dropId;
  void _source;

  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [channel, setChannel] = React.useState<VIPChannel>("TELEGRAM");
  const [status, setStatus] = React.useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(true);

  const isPhoneValid = validateEthiopianPhone(phone);
  const canSubmit = isPhoneValid && agreedToTerms && status !== "loading";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      setErrorMessage("Please enter a valid Ethiopian phone number");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      onSuccess?.();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  // Success State
  if (status === "success") {
    return (
      <div className={cn("rounded-2xl border border-success/30 bg-success/10 p-6", className)}>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h3 className="mt-4 font-display text-title-1 text-foreground">
            You&apos;re on the VIP list!
          </h3>
          <p className="mt-2 text-body text-muted-foreground">
            Check your {channel === "TELEGRAM" ? "Telegram" : channel === "WHATSAPP" ? "WhatsApp" : "SMS"} for a welcome message from {creatorName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div>
        <h3 className="font-display text-title-1 text-foreground">
          Join {creatorName}&apos;s VIP list
        </h3>
        <p className="mt-1 text-body text-muted-foreground">
          Be first to know about drops, shows, and deals
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Input */}
        <div className="space-y-1.5">
          <label className="text-callout font-semibold text-foreground">
            Phone number
          </label>
          <PhoneInput
            value={phone}
            onChange={(value) => {
              setPhone(value);
              if (status === "error") {
                setStatus("idle");
                setErrorMessage("");
              }
            }}
            disabled={status === "loading"}
          />
          <p className="text-caption text-muted-foreground">Required</p>
        </div>

        {/* Name Input (Optional) */}
        <div className="space-y-1.5">
          <label className="text-callout font-semibold text-foreground">
            Name (optional)
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            disabled={status === "loading"}
          />
        </div>

        {/* Channel Selector */}
        <div className="space-y-2">
          <label className="text-callout font-semibold text-foreground">
            Preferred channel
          </label>
          <div className="flex gap-3">
            {channels.map((ch) => {
              const Icon = ch.icon;
              const isSelected = channel === ch.value;
              return (
                <button
                  key={ch.value}
                  type="button"
                  onClick={() => setChannel(ch.value)}
                  disabled={status === "loading"}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-subhead font-semibold transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/50",
                    status === "loading" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {ch.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors",
              agreedToTerms
                ? "bg-primary"
                : "border-2 border-border"
            )}
          >
            {agreedToTerms && (
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <p className="text-caption text-muted-foreground leading-relaxed">
            By joining, you agree to receive messages from {creatorName} via {channel === "TELEGRAM" ? "Telegram" : channel === "WHATSAPP" ? "WhatsApp" : "SMS"}
          </p>
        </div>

        {/* Error Message */}
        {status === "error" && errorMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-error/10 p-3 text-body text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full"
          size="lg"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            "Join VIP"
          )}
        </Button>
      </form>
    </div>
  );
}
