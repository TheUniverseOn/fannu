"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Send,
  Users,
  ImagePlus,
  X,
  Clock,
  Calendar,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createBroadcast, saveBroadcastDraft } from "@/lib/actions/broadcasts";
import type { Drop } from "@/lib/queries/drops";

// ============================================================================
// TYPES
// ============================================================================

type Segment = "ALL" | "VIP_ONLY" | "PURCHASERS";
type Channel = "TELEGRAM" | "WHATSAPP" | "SMS";
type ScheduleOption = "NOW" | "LATER";

interface NewBroadcastClientProps {
  creatorId: string;
  drops: Drop[];
  vipCount: number;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function SegmentChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-white"
          : "bg-card text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

function ChannelCheckbox({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={cn(
          "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors",
          checked
            ? "bg-primary border-primary"
            : "border-muted-foreground/50"
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      <span className="text-sm text-foreground">{icon} {label}</span>
    </label>
  );
}

function ScheduleRadio({
  label,
  description,
  isActive,
  onClick,
}: {
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer" onClick={onClick}>
      <div
        className={cn(
          "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
          isActive
            ? "border-primary"
            : "border-muted-foreground/50"
        )}
      >
        {isActive && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </label>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NewBroadcastClient({
  creatorId,
  drops,
  vipCount,
}: NewBroadcastClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [segment, setSegment] = useState<Segment>("ALL");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState<Channel[]>(["SMS", "WHATSAPP"]);
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>("NOW");
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);

  const selectedDrop = drops.find((d) => d.id === selectedDropId);
  const characterCount = message.length;
  const maxCharacters = 160;

  const toggleChannel = (channel: Channel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    if (channels.length === 0) {
      alert("Please select at least one channel");
      return;
    }

    startTransition(async () => {
      const data = {
        creatorId,
        messageText: message,
        segment,
        channels,
        dropId: selectedDropId || undefined,
        scheduledAt:
          scheduleOption === "LATER" && scheduledDate
            ? new Date(scheduledDate).toISOString()
            : undefined,
      };

      const result = isDraft
        ? await saveBroadcastDraft(data)
        : await createBroadcast(data);

      if (result.error) {
        alert(result.error);
      } else {
        router.push("/app/broadcasts");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/app/broadcasts" className="-ml-2 p-2">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">New Broadcast</h1>
      </div>

      {/* Send to */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Send to</label>
        <div className="flex gap-2 flex-wrap">
          <SegmentChip
            label="All VIPs"
            isActive={segment === "ALL"}
            onClick={() => setSegment("ALL")}
          />
          <SegmentChip
            label="SMS Only"
            isActive={segment === "VIP_ONLY"}
            onClick={() => setSegment("VIP_ONLY")}
          />
          <SegmentChip
            label="WhatsApp Only"
            isActive={segment === "PURCHASERS"}
            onClick={() => setSegment("PURCHASERS")}
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hey VIPs! I have exciting news..."
          rows={4}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="text-right text-xs text-muted-foreground">
          {characterCount} / {maxCharacters} characters
        </p>
      </div>

      {/* Channels */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Channels</label>
        <div className="flex gap-6">
          <ChannelCheckbox
            label="SMS"
            icon="💬"
            checked={channels.includes("SMS")}
            onChange={() => toggleChannel("SMS")}
          />
          <ChannelCheckbox
            label="WhatsApp"
            icon="📱"
            checked={channels.includes("WHATSAPP")}
            onChange={() => toggleChannel("WHATSAPP")}
          />
          <ChannelCheckbox
            label="Telegram"
            icon="✈️"
            checked={channels.includes("TELEGRAM")}
            onChange={() => toggleChannel("TELEGRAM")}
          />
        </div>
      </div>

      {/* Attach Media */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Attach Media (optional)
        </label>
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-6 cursor-pointer hover:bg-muted/50 transition-colors">
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Upload image or video (max 10MB)
          </p>
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground">Schedule</label>
        <div className="flex flex-col gap-4">
          <ScheduleRadio
            label="Send now"
            description="Your message will be sent immediately"
            isActive={scheduleOption === "NOW"}
            onClick={() => setScheduleOption("NOW")}
          />
          <ScheduleRadio
            label="Schedule for later"
            description="Pick a date and time"
            isActive={scheduleOption === "LATER"}
            onClick={() => setScheduleOption("LATER")}
          />
        </div>
        {scheduleOption === "LATER" && (
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Link a Drop */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Link a Drop (optional)
        </label>
        {selectedDrop ? (
          <div className="flex items-center gap-3 rounded-xl bg-card border border-border p-3">
            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted">
              {selectedDrop.cover_image_url ? (
                <Image
                  src={selectedDrop.cover_image_url}
                  alt={selectedDrop.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 to-pink-500/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {selectedDrop.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                fannu.et/d/{selectedDrop.slug}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDropId(null)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <select
            value=""
            onChange={(e) => setSelectedDropId(e.target.value || null)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a drop...</option>
            {drops.map((drop) => (
              <option key={drop.id} value={drop.id}>
                {drop.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Reach indicator */}
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-4">
        <Users className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm font-medium text-primary">
          This will reach approximately {vipCount} subscribers
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handleSubmit(true)}
          disabled={isPending}
        >
          Save as Draft
        </Button>
        <Button
          className="flex-1"
          onClick={() => handleSubmit(false)}
          disabled={isPending}
        >
          <Send className="mr-2 h-4 w-4" />
          {scheduleOption === "LATER" ? "Schedule" : "Send Broadcast"}
        </Button>
      </div>
    </div>
  );
}
