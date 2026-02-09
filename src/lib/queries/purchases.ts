import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Purchase = Tables<"purchases">;
export type PurchaseWithDrop = Purchase & {
  drop: Tables<"drops">;
};

export async function getPurchaseByReceiptId(receiptId: string): Promise<PurchaseWithDrop | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select(`
      *,
      drop:drops(*)
    `)
    .eq("receipt_id", receiptId)
    .single();

  if (error) {
    console.error("Error fetching purchase:", error);
    return null;
  }

  return data as PurchaseWithDrop;
}

export async function getPurchasesByDropId(dropId: string): Promise<Purchase[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("drop_id", dropId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }

  return data ?? [];
}

export async function getRecentPurchasesByCreatorId(
  creatorId: string,
  limit = 10
): Promise<PurchaseWithDrop[]> {
  const supabase = await createClient();

  // First get all drops for this creator
  const { data: drops, error: dropsError } = await supabase
    .from("drops")
    .select("id")
    .eq("creator_id", creatorId);

  if (dropsError || !drops?.length) {
    return [];
  }

  const dropIds = drops.map(d => d.id);

  const { data, error } = await supabase
    .from("purchases")
    .select(`
      *,
      drop:drops(*)
    `)
    .in("drop_id", dropIds)
    .eq("payment_status", "PAID")
    .order("paid_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent purchases:", error);
    return [];
  }

  return (data ?? []) as PurchaseWithDrop[];
}

export type EarningsStats = {
  totalRevenue: number;
  last30DaysRevenue: number;
  totalSales: number;
  last30DaysSales: number;
  averageOrderValue: number;
};

export async function getEarningsStatsByCreatorId(creatorId: string): Promise<EarningsStats> {
  const supabase = await createClient();

  // First get all drops for this creator
  const { data: drops, error: dropsError } = await supabase
    .from("drops")
    .select("id")
    .eq("creator_id", creatorId);

  if (dropsError || !drops?.length) {
    return {
      totalRevenue: 0,
      last30DaysRevenue: 0,
      totalSales: 0,
      last30DaysSales: 0,
      averageOrderValue: 0,
    };
  }

  const dropIds = drops.map(d => d.id);

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("amount, quantity, paid_at")
    .in("drop_id", dropIds)
    .eq("payment_status", "PAID");

  if (error) {
    console.error("Error fetching earnings stats:", error);
    return {
      totalRevenue: 0,
      last30DaysRevenue: 0,
      totalSales: 0,
      last30DaysSales: 0,
      averageOrderValue: 0,
    };
  }

  const allPurchases = purchases ?? [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentPurchases = allPurchases.filter(
    p => p.paid_at && new Date(p.paid_at) >= thirtyDaysAgo
  );

  const totalRevenue = allPurchases.reduce((sum, p) => sum + p.amount, 0);
  const totalSales = allPurchases.reduce((sum, p) => sum + p.quantity, 0);
  const last30DaysRevenue = recentPurchases.reduce((sum, p) => sum + p.amount, 0);
  const last30DaysSales = recentPurchases.reduce((sum, p) => sum + p.quantity, 0);
  const averageOrderValue = totalSales > 0 ? totalRevenue / allPurchases.length : 0;

  return {
    totalRevenue,
    last30DaysRevenue,
    totalSales,
    last30DaysSales,
    averageOrderValue,
  };
}
