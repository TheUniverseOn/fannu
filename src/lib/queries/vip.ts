import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type VipSubscription = Tables<"vip_subscriptions">;

export async function getVipsByCreatorId(creatorId: string): Promise<VipSubscription[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vip_subscriptions")
    .select("*")
    .eq("creator_id", creatorId)
    .eq("status", "ACTIVE")
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("Error fetching VIPs:", error);
    return [];
  }

  return data ?? [];
}

export async function getVipCount(creatorId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("vip_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creatorId)
    .eq("status", "ACTIVE");

  if (error) {
    console.error("Error fetching VIP count:", error);
    return 0;
  }

  return count ?? 0;
}

export async function getRecentVips(creatorId: string, limit = 10): Promise<VipSubscription[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vip_subscriptions")
    .select("*")
    .eq("creator_id", creatorId)
    .eq("status", "ACTIVE")
    .order("joined_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent VIPs:", error);
    return [];
  }

  return data ?? [];
}

export type VipStats = {
  total: number;
  last30Days: number;
  byChannel: {
    telegram: number;
    whatsapp: number;
    sms: number;
  };
  bySource: {
    dropPage: number;
    creatorProfile: number;
    directLink: number;
  };
};

export async function getVipStatsByCreatorId(creatorId: string): Promise<VipStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vip_subscriptions")
    .select("channel, source, joined_at")
    .eq("creator_id", creatorId)
    .eq("status", "ACTIVE");

  if (error) {
    console.error("Error fetching VIP stats:", error);
    return {
      total: 0,
      last30Days: 0,
      byChannel: { telegram: 0, whatsapp: 0, sms: 0 },
      bySource: { dropPage: 0, creatorProfile: 0, directLink: 0 },
    };
  }

  const vips = data ?? [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    total: vips.length,
    last30Days: vips.filter(v => new Date(v.joined_at) >= thirtyDaysAgo).length,
    byChannel: {
      telegram: vips.filter(v => v.channel === "TELEGRAM").length,
      whatsapp: vips.filter(v => v.channel === "WHATSAPP").length,
      sms: vips.filter(v => v.channel === "SMS").length,
    },
    bySource: {
      dropPage: vips.filter(v => v.source === "DROP_PAGE").length,
      creatorProfile: vips.filter(v => v.source === "CREATOR_PROFILE").length,
      directLink: vips.filter(v => v.source === "DIRECT_LINK").length,
    },
  };
}
