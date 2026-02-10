"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/database";
import { nanoid } from "@/lib/utils";

type BookingResult =
  | { data: Tables<"bookings">; error?: never }
  | { error: string; data?: never };

export async function createBookingRequest(
  data: Omit<TablesInsert<"bookings">, "reference_code" | "status">
): Promise<BookingResult> {
  const supabase = await createClient();

  const referenceCode = `BK-${nanoid(8).toUpperCase()}`;

  const { data: insertedBooking, error } = await supabase
    .from("bookings")
    .insert({
      ...data,
      reference_code: referenceCode,
      status: "REQUESTED",
    } as TablesInsert<"bookings">)
    .select()
    .single();

  if (error || !insertedBooking) {
    console.error("Error creating booking:", error);
    return { error: error?.message || "Failed to create booking" };
  }

  const booking = insertedBooking as Tables<"bookings">;

  // Log the event
  await supabase.from("booking_event_log").insert({
    booking_id: booking.id,
    event_type: "BOOKING_REQUESTED",
    actor_type: "BOOKER",
    metadata: { booker_name: data.booker_name },
  } as TablesInsert<"booking_event_log">);

  return { data: booking };
}

export async function sendQuote(
  bookingId: string,
  quoteData: Omit<TablesInsert<"booking_quotes">, "booking_id" | "status">
) {
  const supabase = await createClient();

  // Create the quote
  const { data: insertedQuote, error: quoteError } = await supabase
    .from("booking_quotes")
    .insert({
      ...quoteData,
      booking_id: bookingId,
      status: "ACTIVE",
    } as TablesInsert<"booking_quotes">)
    .select()
    .single();

  if (quoteError || !insertedQuote) {
    console.error("Error creating quote:", quoteError);
    return { error: quoteError?.message || "Failed to create quote" };
  }

  const quote = insertedQuote as Tables<"booking_quotes">;

  // Update booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "QUOTED" } as TablesInsert<"bookings">)
    .eq("id", bookingId);

  if (updateError) {
    console.error("Error updating booking status:", updateError);
    return { error: updateError.message };
  }

  // Log the event
  await supabase.from("booking_event_log").insert({
    booking_id: bookingId,
    event_type: "QUOTE_SENT",
    actor_type: "CREATOR",
    metadata: { quote_id: quote.id, amount: quoteData.total_amount },
  } as TablesInsert<"booking_event_log">);

  revalidatePath("/app/bookings");
  revalidatePath(`/app/bookings/${bookingId}`);
  return { data: quote };
}

export async function declineBooking(bookingId: string, reason: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "DECLINED",
      decline_reason: reason,
    } as TablesInsert<"bookings">)
    .eq("id", bookingId);

  if (error) {
    console.error("Error declining booking:", error);
    return { error: error.message };
  }

  // Log the event
  await supabase.from("booking_event_log").insert({
    booking_id: bookingId,
    event_type: "BOOKING_DECLINED",
    actor_type: "CREATOR",
    metadata: { reason },
  } as TablesInsert<"booking_event_log">);

  revalidatePath("/app/bookings");
  revalidatePath(`/app/bookings/${bookingId}`);
  return { success: true };
}

export async function confirmBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "CONFIRMED" } as TablesInsert<"bookings">)
    .eq("id", bookingId);

  if (error) {
    console.error("Error confirming booking:", error);
    return { error: error.message };
  }

  // Log the event
  await supabase.from("booking_event_log").insert({
    booking_id: bookingId,
    event_type: "BOOKING_CONFIRMED",
    actor_type: "CREATOR",
    metadata: {},
  } as TablesInsert<"booking_event_log">);

  revalidatePath("/app/bookings");
  revalidatePath(`/app/bookings/${bookingId}`);
  return { success: true };
}

export async function completeBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "COMPLETED" } as TablesInsert<"bookings">)
    .eq("id", bookingId);

  if (error) {
    console.error("Error completing booking:", error);
    return { error: error.message };
  }

  // Log the event
  await supabase.from("booking_event_log").insert({
    booking_id: bookingId,
    event_type: "BOOKING_COMPLETED",
    actor_type: "CREATOR",
    metadata: {},
  } as TablesInsert<"booking_event_log">);

  revalidatePath("/app/bookings");
  revalidatePath(`/app/bookings/${bookingId}`);
  return { success: true };
}
