"use client";

import { Users, MessageCircle, Phone, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelBreakdown {
  telegram: number;
  whatsapp: number;
  sms: number;
}

interface AudienceStatsProps {
  totalVips: number;
  channelBreakdown: ChannelBreakdown;
  className?: string;
}

export function AudienceStats({
  totalVips,
  channelBreakdown,
  className,
}: AudienceStatsProps) {
  const stats = [
    {
      label: "Total VIPs",
      value: totalVips,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Telegram",
      value: channelBreakdown.telegram,
      icon: Send,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "WhatsApp",
      value: channelBreakdown.whatsapp,
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "SMS",
      value: channelBreakdown.sms,
      icon: Phone,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className={cn("grid gap-4 grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-lg border bg-card p-4"
        >
          <div className={cn("rounded-lg p-2", stat.bgColor)}>
            <stat.icon className={cn("h-5 w-5", stat.color)} />
          </div>
          <div>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
