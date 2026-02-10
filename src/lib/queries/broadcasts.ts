import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Broadcast = Tables<"broadcasts">;

export type BroadcastWithDrop = Broadcast & {
  drop: Tables<"drops"> | null;
};

export async function getBroadcastsByCreatorId(
  creatorId: string,
  status?: Broadcast["status"]
): Promise<BroadcastWithDrop[]> {
  const supabase = await createClient();

  let query = supabase
    .from("broadcasts")
    .select(`
      *,
      drop:drops(*)
    `)
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching broadcasts:", error);
    return [];
  }

  return (data ?? []) as BroadcastWithDrop[];
}

export async function getBroadcastById(id: string): Promise<BroadcastWithDrop | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("broadcasts")
    .select(`
      *,
      drop:drops(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching broadcast:", error);
    return null;
  }

  return data as BroadcastWithDrop;
}

export type BroadcastStats = {
  total: number;
  sent: number;
  scheduled: number;
  draft: number;
};

export async function getBroadcastStatsByCreatorId(creatorId: string): Promise<BroadcastStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("broadcasts")
    .select("status")
    .eq("creator_id", creatorId);

  if (error) {
    console.error("Error fetching broadcast stats:", error);
    return { total: 0, sent: 0, scheduled: 0, draft: 0 };
  }

  const broadcasts = data ?? [];
  return {
    total: broadcasts.length,
    sent: broadcasts.filter((b) => b.status === "SENT").length,
    scheduled: broadcasts.filter((b) => b.status === "SCHEDULED").length,
    draft: broadcasts.filter((b) => b.status === "DRAFT").length,
  };
}

export async function getRecipientsCount(
  creatorId: string,
  segment: "ALL" | "VIP_ONLY" | "PURCHASERS"
): Promise<number> {
  const supabase = await createClient();

  if (segment === "ALL" || segment === "VIP_ONLY") {
    const { count, error } = await supabase
      .from("vip_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", creatorId)
      .eq("status", "ACTIVE");

    if (error) {
      console.error("Error fetching recipients count:", error);
      return 0;
    }

    return count ?? 0;
  }

  // For purchasers, would need to count unique purchasers of creator's drops
  // This is a simplified implementation
  return 0;
}
