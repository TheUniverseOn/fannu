import { redirect } from "next/navigation";
import { getCreatorOrDemo } from "@/lib/auth";
import { getDropsByCreatorId, getDropStatsByCreatorId } from "@/lib/queries/drops";
import { getVipCount } from "@/lib/queries/vip";
import { DropsListClient } from "./drops-list-client";

export default async function DropsListPage() {
  const creator = await getCreatorOrDemo();

  if (!creator) {
    redirect("/login");
  }

  // Fetch drops and stats
  const [drops, dropStats, totalVips] = await Promise.all([
    getDropsByCreatorId(creator.id),
    getDropStatsByCreatorId(creator.id),
    getVipCount(creator.id),
  ]);

  // Map drops to the format expected by the client component
  const mappedDrops = drops.map((drop) => ({
    id: drop.id,
    slug: drop.slug,
    title: drop.title,
    type: drop.type,
    status: drop.status.toLowerCase() as "draft" | "scheduled" | "live" | "ended" | "cancelled",
    price_cents: drop.price ?? 0,
    cover_url: drop.cover_image_url,
    quantity_limit: drop.total_slots,
    quantity_sold: drop.total_slots && drop.slots_remaining
      ? drop.total_slots - drop.slots_remaining
      : 0,
    vip_count: 0, // Would need separate query per drop
    total_revenue_cents: 0, // Would need separate query per drop
    views: 0, // Would need analytics integration
    created_at: drop.created_at,
    scheduled_at: drop.scheduled_at ?? undefined,
  }));

  const stats = {
    liveDrops: dropStats.liveDrops,
    totalRevenue: dropStats.totalRevenue,
    totalSales: dropStats.totalSales,
    totalVips,
  };

  return <DropsListClient initialDrops={mappedDrops} stats={stats} />;
}
