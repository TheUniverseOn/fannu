"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/database";

type BroadcastResult =
  | { broadcastId: string; error?: never }
  | { error: string; broadcastId?: never };

export async function createBroadcast(data: {
  creatorId: string;
  messageText: string;
  segment: "ALL" | "VIP_ONLY" | "PURCHASERS";
  channels: ("TELEGRAM" | "WHATSAPP" | "SMS")[];
  mediaUrl?: string;
  dropId?: string;
  scheduledAt?: string;
}): Promise<BroadcastResult> {
  const supabase = await createClient();

  const status = data.scheduledAt ? "SCHEDULED" : "SENDING";

  const { data: broadcast, error } = await supabase
    .from("broadcasts")
    .insert({
      creator_id: data.creatorId,
      message_text: data.messageText,
      segment: data.segment,
      channels: data.channels,
      media_url: data.mediaUrl || null,
      drop_id: data.dropId || null,
      scheduled_at: data.scheduledAt || null,
      status,
    } as TablesInsert<"broadcasts">)
    .select()
    .single();

  if (error || !broadcast) {
    console.error("Error creating broadcast:", error);
    return { error: "Failed to create broadcast" };
  }

  const broadcastData = broadcast as Tables<"broadcasts">;

  // If sending immediately, simulate the send process
  if (status === "SENDING") {
    await simulateBroadcastSend(broadcastData.id, data.creatorId);
  }

  revalidatePath("/app/broadcasts");
  return { broadcastId: broadcastData.id };
}

export async function saveBroadcastDraft(data: {
  creatorId: string;
  messageText: string;
  segment: "ALL" | "VIP_ONLY" | "PURCHASERS";
  channels: ("TELEGRAM" | "WHATSAPP" | "SMS")[];
  mediaUrl?: string;
  dropId?: string;
}): Promise<BroadcastResult> {
  const supabase = await createClient();

  const { data: broadcast, error } = await supabase
    .from("broadcasts")
    .insert({
      creator_id: data.creatorId,
      message_text: data.messageText,
      segment: data.segment,
      channels: data.channels,
      media_url: data.mediaUrl || null,
      drop_id: data.dropId || null,
      status: "DRAFT",
    } as TablesInsert<"broadcasts">)
    .select()
    .single();

  if (error || !broadcast) {
    console.error("Error saving broadcast draft:", error);
    return { error: "Failed to save draft" };
  }

  const broadcastData = broadcast as Tables<"broadcasts">;

  revalidatePath("/app/broadcasts");
  return { broadcastId: broadcastData.id };
}

async function simulateBroadcastSend(broadcastId: string, creatorId: string) {
  const supabase = await createClient();

  // Get VIP subscribers count
  const { count } = await supabase
    .from("vip_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creatorId)
    .eq("status", "ACTIVE");

  const recipientsCount = count ?? 0;

  // Update broadcast as sent
  await supabase
    .from("broadcasts")
    .update({
      status: "SENT",
      sent_at: new Date().toISOString(),
      recipients_count: recipientsCount,
      delivered_count: recipientsCount,
      failed_count: 0,
    })
    .eq("id", broadcastId);
}

export async function deleteBroadcast(broadcastId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("broadcasts")
    .delete()
    .eq("id", broadcastId);

  if (error) {
    console.error("Error deleting broadcast:", error);
    return { error: "Failed to delete broadcast" };
  }

  revalidatePath("/app/broadcasts");
  return {};
}

export async function cancelScheduledBroadcast(broadcastId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("broadcasts")
    .update({
      status: "DRAFT",
      scheduled_at: null,
    })
    .eq("id", broadcastId)
    .eq("status", "SCHEDULED");

  if (error) {
    console.error("Error cancelling broadcast:", error);
    return { error: "Failed to cancel broadcast" };
  }

  revalidatePath("/app/broadcasts");
  return {};
}
