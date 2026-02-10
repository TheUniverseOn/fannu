"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/database";
import { nanoid } from "@/lib/utils";

type SubscribeResult =
  | { success: true; confirmationId: string; alreadySubscribed?: boolean; resubscribed?: boolean }
  | { success: false; error: string };

export async function subscribeToVip(
  data: Omit<TablesInsert<"vip_subscriptions">, "status">
): Promise<SubscribeResult> {
  const supabase = await createClient();

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("vip_subscriptions")
    .select("id, status")
    .eq("creator_id", data.creator_id)
    .eq("fan_phone", data.fan_phone)
    .single();

  const confirmationId = `VIP-${nanoid(6).toUpperCase()}`;

  if (existing) {
    // If unsubscribed, resubscribe
    if (existing.status === "UNSUBSCRIBED") {
      const { error } = await supabase
        .from("vip_subscriptions")
        .update({ status: "ACTIVE" })
        .eq("id", existing.id);

      if (error) {
        console.error("Error resubscribing:", error);
        return { success: false, error: error.message };
      }
      return { success: true, confirmationId, resubscribed: true };
    }
    // Already subscribed
    return { success: true, confirmationId, alreadySubscribed: true };
  }

  // Create new subscription
  const { error } = await supabase.from("vip_subscriptions").insert({
    ...data,
    status: "ACTIVE",
  });

  if (error) {
    console.error("Error subscribing to VIP:", error);
    return { success: false, error: error.message };
  }

  return { success: true, confirmationId };
}

/**
 * Get VIP subscription with creator details
 */
export async function getVipSubscription(creatorId: string, fanPhone: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vip_subscriptions")
    .select(`
      *,
      creator:creators(*)
    `)
    .eq("creator_id", creatorId)
    .eq("fan_phone", fanPhone)
    .eq("status", "ACTIVE")
    .single();

  if (error || !data) {
    return null;
  }

  return data as Tables<"vip_subscriptions"> & {
    creator: Tables<"creators">;
  };
}

export async function unsubscribeFromVip(creatorId: string, fanPhone: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vip_subscriptions")
    .update({ status: "UNSUBSCRIBED" })
    .eq("creator_id", creatorId)
    .eq("fan_phone", fanPhone);

  if (error) {
    console.error("Error unsubscribing:", error);
    return { error: error.message };
  }

  return { success: true };
}
