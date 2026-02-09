"use server";

import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

export async function subscribeToVip(
  data: Omit<TablesInsert<"vip_subscriptions">, "status">
) {
  const supabase = await createClient();

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("vip_subscriptions")
    .select("id, status")
    .eq("creator_id", data.creator_id)
    .eq("fan_phone", data.fan_phone)
    .single();

  if (existing) {
    // If unsubscribed, resubscribe
    if (existing.status === "UNSUBSCRIBED") {
      const { error } = await supabase
        .from("vip_subscriptions")
        .update({ status: "ACTIVE" })
        .eq("id", existing.id);

      if (error) {
        console.error("Error resubscribing:", error);
        return { error: error.message };
      }
      return { success: true, resubscribed: true };
    }
    // Already subscribed
    return { success: true, alreadySubscribed: true };
  }

  // Create new subscription
  const { error } = await supabase.from("vip_subscriptions").insert({
    ...data,
    status: "ACTIVE",
  });

  if (error) {
    console.error("Error subscribing to VIP:", error);
    return { error: error.message };
  }

  return { success: true };
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
