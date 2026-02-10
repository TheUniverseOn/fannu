"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/database";
import { nanoid } from "@/lib/utils";

type PurchaseResult =
  | { receiptId: string; orderId: string; error?: never }
  | { error: string; receiptId?: never; orderId?: never };

/**
 * Initiates a purchase for a drop.
 * In production, this would integrate with Chapa or another PSP.
 * For now, it creates a purchase record and simulates instant success.
 */
export async function initiatePurchase(data: {
  dropId: string;
  fanPhone: string;
  fanName?: string;
  quantity: number;
}): Promise<PurchaseResult> {
  const supabase = await createClient();

  // Get the drop
  const { data: dropData, error: dropError } = await supabase
    .from("drops")
    .select("*")
    .eq("id", data.dropId)
    .single();

  if (dropError || !dropData) {
    return { error: "Drop not found" };
  }

  const drop = dropData as Tables<"drops">;

  // Check if drop is live
  if (drop.status !== "LIVE") {
    return { error: "This drop is not available for purchase" };
  }

  // Check slots availability
  if (drop.total_slots !== null && drop.slots_remaining !== null) {
    if (drop.slots_remaining < data.quantity) {
      return { error: `Only ${drop.slots_remaining} slots remaining` };
    }
  }

  // Calculate amount
  const unitPrice = drop.price || 0;
  const amount = unitPrice * data.quantity;

  // Generate receipt ID
  const receiptId = `ORD-${nanoid(6).toUpperCase()}`;
  const pspRef = `TXN-${nanoid(10).toUpperCase()}`;

  // Create purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      drop_id: data.dropId,
      fan_phone: data.fanPhone,
      fan_name: data.fanName || null,
      quantity: data.quantity,
      amount,
      currency: drop.currency,
      receipt_id: receiptId,
      psp_ref: pspRef,
      payment_status: "PENDING",
    } as TablesInsert<"purchases">)
    .select()
    .single();

  if (purchaseError || !purchase) {
    console.error("Error creating purchase:", purchaseError);
    return { error: "Failed to create purchase" };
  }

  const purchaseData = purchase as Tables<"purchases">;

  // Update slots remaining
  if (drop.total_slots !== null && drop.slots_remaining !== null) {
    await supabase
      .from("drops")
      .update({ slots_remaining: drop.slots_remaining - data.quantity })
      .eq("id", data.dropId);
  }

  // Simulate instant payment success for demo
  await simulatePurchaseSuccess(purchaseData.id);

  revalidatePath(`/d/${drop.slug}`);
  return { receiptId, orderId: purchaseData.id };
}

/**
 * Simulates a successful payment for demo purposes.
 */
async function simulatePurchaseSuccess(purchaseId: string) {
  const supabase = await createClient();

  await supabase
    .from("purchases")
    .update({
      payment_status: "PAID",
      paid_at: new Date().toISOString(),
    })
    .eq("id", purchaseId);
}

/**
 * Get purchase by receipt ID
 */
export async function getPurchaseByReceiptId(receiptId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select(`
      *,
      drop:drops(
        *,
        creator:creators(*)
      )
    `)
    .eq("receipt_id", receiptId)
    .single();

  if (error) {
    console.error("Error fetching purchase:", error);
    return null;
  }

  return data as Tables<"purchases"> & {
    drop: Tables<"drops"> & { creator: Tables<"creators"> };
  };
}
