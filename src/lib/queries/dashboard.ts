import { createClient } from "@/lib/supabase/server";
import { getVipStatsByCreatorId } from "./vip";
import { getEarningsStatsByCreatorId, getRecentPurchasesByCreatorId } from "./purchases";
import { getBookingStatsByCreatorId, getBookingsByCreatorId } from "./bookings";
import { getDropStatsByCreatorId, getDropsByCreatorId } from "./drops";
import type { Tables } from "@/types/database";

export type DashboardData = {
  creator: Tables<"creators">;
  vipStats: Awaited<ReturnType<typeof getVipStatsByCreatorId>>;
  earningsStats: Awaited<ReturnType<typeof getEarningsStatsByCreatorId>>;
  dropStats: Awaited<ReturnType<typeof getDropStatsByCreatorId>>;
  bookingStats: Awaited<ReturnType<typeof getBookingStatsByCreatorId>>;
  recentPurchases: Awaited<ReturnType<typeof getRecentPurchasesByCreatorId>>;
  pendingBookings: Tables<"bookings">[];
  recentDrops: Tables<"drops">[];
};

export async function getDashboardData(creatorId: string): Promise<DashboardData | null> {
  const supabase = await createClient();

  // Get creator
  const { data: creatorData, error } = await supabase
    .from("creators")
    .select("*")
    .eq("id", creatorId)
    .single();

  if (error || !creatorData) {
    console.error("Error fetching creator:", error);
    return null;
  }

  const creator = creatorData as Tables<"creators">;

  // Fetch all stats in parallel
  const [
    vipStats,
    earningsStats,
    dropStats,
    bookingStats,
    recentPurchases,
    pendingBookings,
    recentDrops,
  ] = await Promise.all([
    getVipStatsByCreatorId(creatorId),
    getEarningsStatsByCreatorId(creatorId),
    getDropStatsByCreatorId(creatorId),
    getBookingStatsByCreatorId(creatorId),
    getRecentPurchasesByCreatorId(creatorId, 5),
    getBookingsByCreatorId(creatorId, "REQUESTED"),
    getDropsByCreatorId(creatorId).then(drops => drops.slice(0, 5)),
  ]);

  return {
    creator,
    vipStats,
    earningsStats,
    dropStats,
    bookingStats,
    recentPurchases,
    pendingBookings,
    recentDrops,
  };
}

export type ActivityItem = {
  id: string;
  type: "vip" | "purchase" | "booking";
  name: string;
  action: string;
  source: string;
  time: string;
  amount?: number;
};

export async function getRecentActivity(creatorId: string, limit = 10): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const activities: ActivityItem[] = [];

  // Get recent VIPs
  const { data: vips } = await supabase
    .from("vip_subscriptions")
    .select("id, fan_name, fan_phone, source, joined_at")
    .eq("creator_id", creatorId)
    .eq("status", "ACTIVE")
    .order("joined_at", { ascending: false })
    .limit(limit);

  if (vips) {
    activities.push(
      ...vips.map((v) => ({
        id: `vip-${v.id}`,
        type: "vip" as const,
        name: v.fan_name || v.fan_phone.slice(-4),
        action: "joined as VIP",
        source: v.source.replace("_", " ").toLowerCase(),
        time: v.joined_at,
      }))
    );
  }

  // Get recent purchases
  const { data: drops } = await supabase
    .from("drops")
    .select("id")
    .eq("creator_id", creatorId);

  if (drops?.length) {
    const dropIds = drops.map((d) => d.id);
    const { data: purchases } = await supabase
      .from("purchases")
      .select("id, fan_name, fan_phone, amount, paid_at, drop:drops(title)")
      .in("drop_id", dropIds)
      .eq("payment_status", "PAID")
      .order("paid_at", { ascending: false })
      .limit(limit);

    if (purchases) {
      activities.push(
        ...purchases.map((p) => ({
          id: `purchase-${p.id}`,
          type: "purchase" as const,
          name: p.fan_name || p.fan_phone.slice(-4),
          action: "purchased",
          source: (p.drop as { title: string })?.title || "Drop",
          time: p.paid_at || "",
          amount: p.amount,
        }))
      );
    }
  }

  // Get recent bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booker_name, type, created_at, start_at")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (bookings) {
    activities.push(
      ...bookings.map((b) => ({
        id: `booking-${b.id}`,
        type: "booking" as const,
        name: b.booker_name,
        action: "requested booking",
        source: `${b.type.replace("_", " ")} · ${new Date(b.start_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        time: b.created_at,
      }))
    );
  }

  // Sort by time and limit
  return activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, limit);
}
