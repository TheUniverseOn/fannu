"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/database";
import { nanoid } from "@/lib/utils";

type PaymentResult =
  | { paymentUrl?: string; receiptId?: string; error?: never }
  | { error: string; paymentUrl?: never; receiptId?: never };

/**
 * Initiates a booking deposit payment.
 * In production, this would integrate with Chapa or another PSP.
 * For now, it creates a pending payment and simulates instant success.
 */
export async function initiateBookingPayment(
  bookingId: string,
  quoteId: string
): Promise<PaymentResult> {
  const supabase = await createClient();

  // Get the quote
  const { data: quoteData, error: quoteError } = await supabase
    .from("booking_quotes")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (quoteError || !quoteData) {
    return { error: "Quote not found" };
  }

  const quote = quoteData as Tables<"booking_quotes">;

  // Check if quote is still active
  if (quote.status !== "ACTIVE") {
    return { error: "Quote is no longer active" };
  }

  // Check if quote is expired
  if (new Date(quote.expires_at) < new Date()) {
    return { error: "Quote has expired" };
  }

  // Check if payment already exists
  const { data: existingPaymentData } = await supabase
    .from("booking_payments")
    .select("*")
    .eq("booking_id", bookingId)
    .eq("quote_id", quoteId)
    .eq("type", "DEPOSIT")
    .single();

  if (existingPaymentData) {
    const existingPayment = existingPaymentData as Tables<"booking_payments">;
    if (existingPayment.status === "PAID") {
      return { receiptId: existingPayment.receipt_id };
    }
    // If pending, could redirect to existing payment
    // For now, we'll create a new one
  }

  // Generate receipt ID
  const receiptId = `RCP-${nanoid(8).toUpperCase()}`;
  const pspRef = `TXN-${nanoid(10).toUpperCase()}`;

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from("booking_payments")
    .insert({
      booking_id: bookingId,
      quote_id: quoteId,
      amount: quote.deposit_amount,
      currency: quote.currency,
      type: "DEPOSIT",
      status: "PENDING",
      receipt_id: receiptId,
      psp_ref: pspRef,
    } as TablesInsert<"booking_payments">)
    .select()
    .single();

  if (paymentError) {
    console.error("Error creating payment:", paymentError);
    return { error: "Failed to create payment" };
  }

  // In production, you would:
  // 1. Call Chapa API to create a checkout session
  // 2. Return the checkout URL for redirect
  // 3. Handle the webhook callback to confirm payment

  // For development/demo, simulate instant payment success
  await simulatePaymentSuccess(bookingId, quoteId, (payment as Tables<"booking_payments">).id);

  return { receiptId };
}

/**
 * Simulates a successful payment for demo purposes.
 * In production, this would be called via webhook from the PSP.
 */
async function simulatePaymentSuccess(
  bookingId: string,
  quoteId: string,
  paymentId: string
) {
  const supabase = await createClient();

  // Update payment status
  await supabase
    .from("booking_payments")
    .update({
      status: "PAID",
      paid_at: new Date().toISOString(),
    } as TablesInsert<"booking_payments">)
    .eq("id", paymentId);

  // Update quote status
  await supabase
    .from("booking_quotes")
    .update({ status: "ACCEPTED" })
    .eq("id", quoteId);

  // Update booking status
  await supabase
    .from("bookings")
    .update({ status: "DEPOSIT_PAID" } as TablesInsert<"bookings">)
    .eq("id", bookingId);

  // Log the event
  await supabase.from("booking_event_log").insert({
    booking_id: bookingId,
    event_type: "DEPOSIT_PAID",
    actor_type: "SYSTEM",
    metadata: { payment_id: paymentId, quote_id: quoteId },
  } as TablesInsert<"booking_event_log">);

  revalidatePath(`/booking/${bookingId}`);
  revalidatePath(`/app/bookings/${bookingId}`);
}

/**
 * Handles webhook callback from payment provider.
 * This would be called from an API route.
 */
export async function handlePaymentWebhook(
  pspRef: string,
  status: "success" | "failed"
) {
  const supabase = await createClient();

  // Find the payment by PSP reference
  const { data: paymentData, error } = await supabase
    .from("booking_payments")
    .select("*")
    .eq("psp_ref", pspRef)
    .single();

  if (error || !paymentData) {
    console.error("Payment not found for PSP ref:", pspRef);
    return { error: "Payment not found" };
  }

  const payment = paymentData as Tables<"booking_payments">;

  if (status === "success") {
    await simulatePaymentSuccess(
      payment.booking_id,
      payment.quote_id,
      payment.id
    );
    return { success: true };
  } else {
    // Mark payment as failed
    await supabase
      .from("booking_payments")
      .update({ status: "FAILED" } as TablesInsert<"booking_payments">)
      .eq("id", payment.id);

    // Log the event
    await supabase.from("booking_event_log").insert({
      booking_id: payment.booking_id,
      event_type: "PAYMENT_FAILED",
      actor_type: "SYSTEM",
      metadata: { payment_id: payment.id, psp_ref: pspRef },
    } as TablesInsert<"booking_event_log">);

    revalidatePath(`/booking/${payment.booking_id}`);
    return { success: true };
  }
}
