"use client";

import { Send, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

export interface VIPSubscriber {
  id: string;
  name: string | null;
  phone: string;
  channel: "telegram" | "whatsapp" | "sms";
  source: {
    type: "drop" | "profile" | "direct";
    dropName?: string;
  };
  joinedAt: Date;
  status: "active" | "unsubscribed";
}

interface AudienceTableProps {
  subscribers: VIPSubscriber[];
  className?: string;
}

const channelConfig = {
  telegram: {
    icon: Send,
    label: "Telegram",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  whatsapp: {
    icon: MessageCircle,
    label: "WhatsApp",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  sms: {
    icon: Phone,
    label: "SMS",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
};

function maskPhone(phone: string): string {
  // Format: +251 9XX XX34
  if (phone.length < 8) return phone;
  const lastFour = phone.slice(-2);
  const countryCode = phone.slice(0, 4);
  return `${countryCode} 9XX XX${lastFour}`;
}

function formatSource(source: VIPSubscriber["source"]): string {
  if (source.type === "drop" && source.dropName) {
    return `Drop: ${source.dropName}`;
  }
  if (source.type === "profile") {
    return "Profile";
  }
  return "Direct Link";
}

export function AudienceTable({ subscribers, className }: AudienceTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b text-left text-sm font-medium text-muted-foreground">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Phone</th>
            <th className="pb-3 pr-4">Channel</th>
            <th className="pb-3 pr-4">Source</th>
            <th className="pb-3 pr-4">Joined</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {subscribers.map((subscriber) => {
            const channel = channelConfig[subscriber.channel];
            const ChannelIcon = channel.icon;

            return (
              <tr key={subscriber.id} className="text-sm">
                <td className="py-4 pr-4">
                  <span className="font-medium">
                    {subscriber.name || "Unknown"}
                  </span>
                </td>
                <td className="py-4 pr-4 font-mono text-muted-foreground">
                  {maskPhone(subscriber.phone)}
                </td>
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("rounded p-1", channel.bgColor)}>
                      <ChannelIcon className={cn("h-3.5 w-3.5", channel.color)} />
                    </div>
                    <span>{channel.label}</span>
                  </div>
                </td>
                <td className="py-4 pr-4 text-muted-foreground">
                  {formatSource(subscriber.source)}
                </td>
                <td className="py-4 pr-4 text-muted-foreground">
                  {formatRelativeTime(subscriber.joinedAt)}
                </td>
                <td className="py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      subscriber.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {subscriber.status === "active" ? "Active" : "Unsubscribed"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
