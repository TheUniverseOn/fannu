"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";
import { nanoid } from "@/lib/utils";

export async function createBookingRequest(
  data: Omit<TablesInsert<"bookings">, "reference_code" | "status">
) {
  const supabase = await createClient();

  const referenceCode = `BK-${nanoid(8).toUpperCase()}`;

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      ...data,
      reference_code: referenceCode,
      status: "REQUESTED",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    return { error: error.message };
  }

  // Log the event
  await supabase.from("booking_event_log").insert({
    booking_id: booking.id,
    event_type: "BOOKING_REQUESTED",
    actor_type: "BOOKER",
    metadata: { booker_name: data.booker_name },
  });

  return { data: booking };
}

export async function sendQuote(
  bookingId: string,
  quoteData: Omit<TablesInsert<"booking_quotes">, "booking_id" | "status">
) {
  const supabase = await createClient();

  // Create the quote
  const { data: quote, error: quoteError } = await supabase
    .from("booking_quotes")
    .insert({
      ...quoteData,
      booking_id: bookingId,
      status: "ACTIVE",
    })
    .select()
    .single();

  if (quoteError) {
    console.error("Error creating quote:", quoteError);
    return { error: quoteError.message };
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "QUOTED" })
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
  });

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
    })
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
  });

  revalidatePath("/app/bookings");
  revalidatePath(`/app/bookings/${bookingId}`);
  return { success: true };
}

export async function confirmBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "CONFIRMED" })
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
  });

  revalidatePath("/app/bookings");
  revalidatePath(`/app/bookings/${bookingId}`);
  return { success: true };
}

export async function completeBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "COMPLETED" })
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
  });

  revalidatePath("/app/bookings");
  revalidatePath(`/app/bookings/${bookingId}`);
  return { success: true };
}
