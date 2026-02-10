import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Drop = Tables<"drops">;
export type DropWithCreator = Drop & {
  creator: Tables<"creators">;
};

export async function getDropBySlug(slug: string): Promise<DropWithCreator | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drops")
    .select(`
      *,
      creator:creators(*)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching drop:", error);
    return null;
  }

  return data as DropWithCreator;
}

export async function getDropById(id: string): Promise<DropWithCreator | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drops")
    .select(`
      *,
      creator:creators(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching drop:", error);
    return null;
  }

  return data as DropWithCreator;
}

export async function getDropsByCreatorId(creatorId: string): Promise<Drop[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching drops:", error);
    return [];
  }

  return (data ?? []) as Drop[];
}

export async function getLiveDropsByCreatorId(creatorId: string): Promise<Drop[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .eq("creator_id", creatorId)
    .in("status", ["LIVE", "SCHEDULED"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching live drops:", error);
    return [];
  }

  return (data ?? []) as Drop[];
}

export async function getDropsByCreatorSlug(creatorSlug: string): Promise<Drop[]> {
  const supabase = await createClient();

  // First get the creator
  const { data: creator, error: creatorError } = await supabase
    .from("creators")
    .select("id")
    .eq("slug", creatorSlug)
    .single();

  if (creatorError || !creator) {
    console.error("Error fetching creator:", creatorError);
    return [];
  }

  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .eq("creator_id", (creator as { id: string }).id)
    .in("status", ["LIVE", "SCHEDULED"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching drops:", error);
    return [];
  }

  return (data ?? []) as Drop[];
}

export type DropStats = {
  totalDrops: number;
  liveDrops: number;
  totalRevenue: number;
  totalSales: number;
};

export async function getDropStatsByCreatorId(creatorId: string): Promise<DropStats> {
  const supabase = await createClient();

  const { data: drops, error } = await supabase
    .from("drops")
    .select("id, status")
    .eq("creator_id", creatorId);

  if (error) {
    console.error("Error fetching drop stats:", error);
    return { totalDrops: 0, liveDrops: 0, totalRevenue: 0, totalSales: 0 };
  }

  const totalDrops = drops?.length ?? 0;
  const liveDrops = drops?.filter(d => d.status === "LIVE").length ?? 0;

  // Get purchase stats
  const dropIds = drops?.map(d => d.id) ?? [];
  if (dropIds.length === 0) {
    return { totalDrops, liveDrops, totalRevenue: 0, totalSales: 0 };
  }

  const { data: purchases, error: purchaseError } = await supabase
    .from("purchases")
    .select("amount, quantity")
    .in("drop_id", dropIds)
    .eq("payment_status", "PAID");

  if (purchaseError) {
    console.error("Error fetching purchase stats:", purchaseError);
    return { totalDrops, liveDrops, totalRevenue: 0, totalSales: 0 };
  }

  const totalRevenue = purchases?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const totalSales = purchases?.reduce((sum, p) => sum + p.quantity, 0) ?? 0;

  return { totalDrops, liveDrops, totalRevenue, totalSales };
}
