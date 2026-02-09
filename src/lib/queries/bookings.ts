import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type Booking = Tables<"bookings">;
export type BookingQuote = Tables<"booking_quotes">;
export type BookingPayment = Tables<"booking_payments">;

export type BookingWithDetails = Booking & {
  creator: Tables<"creators">;
  quotes: BookingQuote[];
  payments: BookingPayment[];
};

export async function getBookingById(id: string): Promise<BookingWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      creator:creators(*),
      quotes:booking_quotes(*),
      payments:booking_payments(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching booking:", error);
    return null;
  }

  return data as BookingWithDetails;
}

export async function getBookingByReferenceCode(code: string): Promise<BookingWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      creator:creators(*),
      quotes:booking_quotes(*),
      payments:booking_payments(*)
    `)
    .eq("reference_code", code)
    .single();

  if (error) {
    console.error("Error fetching booking:", error);
    return null;
  }

  return data as BookingWithDetails;
}

export async function getBookingsByCreatorId(
  creatorId: string,
  status?: Booking["status"]
): Promise<Booking[]> {
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data ?? [];
}

export async function getPendingBookingsCount(creatorId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("creator_id", creatorId)
    .eq("status", "REQUESTED");

  if (error) {
    console.error("Error fetching pending bookings count:", error);
    return 0;
  }

  return count ?? 0;
}

export type BookingStats = {
  total: number;
  requested: number;
  quoted: number;
  depositPaid: number;
  confirmed: number;
  completed: number;
  declined: number;
};

export async function getBookingStatsByCreatorId(creatorId: string): Promise<BookingStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("status")
    .eq("creator_id", creatorId);

  if (error) {
    console.error("Error fetching booking stats:", error);
    return {
      total: 0,
      requested: 0,
      quoted: 0,
      depositPaid: 0,
      confirmed: 0,
      completed: 0,
      declined: 0,
    };
  }

  const bookings = data ?? [];
  return {
    total: bookings.length,
    requested: bookings.filter(b => b.status === "REQUESTED").length,
    quoted: bookings.filter(b => b.status === "QUOTED").length,
    depositPaid: bookings.filter(b => b.status === "DEPOSIT_PAID").length,
    confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
    declined: bookings.filter(b => b.status === "DECLINED").length,
  };
}
