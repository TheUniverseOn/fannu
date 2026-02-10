import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type BookingPayment = Tables<"booking_payments">;
export type Purchase = Tables<"purchases">;

export type Transaction = {
  id: string;
  type: "booking_deposit" | "drop_sales" | "withdrawal" | "refund";
  status: "completed" | "pending" | "processing";
  amount_cents: number;
  description: string;
  subtitle: string;
  created_at: string;
};

export type EarningsData = {
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  thisMonth: number;
  thisMonthChange: number;
  transactionsThisMonth: number;
};

export type EarningsSummary = {
  data: EarningsData;
  transactions: Transaction[];
};

/**
 * Get earnings data for a creator
 */
export async function getCreatorEarnings(creatorId: string): Promise<EarningsSummary> {
  const supabase = await createClient();

  // Get booking payments for this creator's bookings
  const { data: bookingPaymentsData } = await supabase
    .from("booking_payments")
    .select(`
      *,
      booking:bookings!inner(
        creator_id,
        booker_name,
        type
      )
    `)
    .eq("booking.creator_id", creatorId)
    .order("created_at", { ascending: false });

  const bookingPayments = (bookingPaymentsData ?? []) as (BookingPayment & {
    booking: { creator_id: string; booker_name: string; type: string };
  })[];

  // Get purchases for this creator's drops
  const { data: purchasesData } = await supabase
    .from("purchases")
    .select(`
      *,
      drop:drops!inner(
        creator_id,
        title
      )
    `)
    .eq("drop.creator_id", creatorId)
    .order("created_at", { ascending: false });

  const purchases = (purchasesData ?? []) as (Purchase & {
    drop: { creator_id: string; title: string };
  })[];

  // Calculate balances
  const paidBookingPayments = bookingPayments.filter((p) => p.status === "PAID");
  const pendingBookingPayments = bookingPayments.filter((p) => p.status === "PENDING");
  const paidPurchases = purchases.filter((p) => p.payment_status === "PAID");
  const pendingPurchases = purchases.filter((p) => p.payment_status === "PENDING");

  const totalFromBookings = paidBookingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalFromPurchases = paidPurchases.reduce((sum, p) => sum + p.amount, 0);
  const pendingFromBookings = pendingBookingPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingFromPurchases = pendingPurchases.reduce((sum, p) => sum + p.amount, 0);

  // Calculate this month's earnings
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthBookings = paidBookingPayments
    .filter((p) => p.paid_at && new Date(p.paid_at) >= startOfMonth)
    .reduce((sum, p) => sum + p.amount, 0);
  const thisMonthPurchases = paidPurchases
    .filter((p) => p.paid_at && new Date(p.paid_at) >= startOfMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  const lastMonthBookings = paidBookingPayments
    .filter(
      (p) =>
        p.paid_at &&
        new Date(p.paid_at) >= startOfLastMonth &&
        new Date(p.paid_at) <= endOfLastMonth
    )
    .reduce((sum, p) => sum + p.amount, 0);
  const lastMonthPurchases = paidPurchases
    .filter(
      (p) =>
        p.paid_at &&
        new Date(p.paid_at) >= startOfLastMonth &&
        new Date(p.paid_at) <= endOfLastMonth
    )
    .reduce((sum, p) => sum + p.amount, 0);

  const thisMonthTotal = thisMonthBookings + thisMonthPurchases;
  const lastMonthTotal = lastMonthBookings + lastMonthPurchases;

  // Calculate month-over-month change
  const monthChange =
    lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;

  // Count this month's transactions
  const thisMonthBookingCount = paidBookingPayments.filter(
    (p) => p.paid_at && new Date(p.paid_at) >= startOfMonth
  ).length;
  const thisMonthPurchaseCount = paidPurchases.filter(
    (p) => p.paid_at && new Date(p.paid_at) >= startOfMonth
  ).length;

  // Build transactions list
  const transactions: Transaction[] = [];

  // Add booking payments
  for (const payment of bookingPayments.slice(0, 10)) {
    const bookingTypeLabels: Record<string, string> = {
      LIVE_PERFORMANCE: "Concert",
      MC_HOSTING: "MC / Hosting",
      BRAND_CONTENT: "Brand Content",
      CUSTOM: "Custom",
    };

    transactions.push({
      id: payment.id,
      type: payment.status === "REFUNDED" ? "refund" : "booking_deposit",
      status:
        payment.status === "PAID"
          ? "completed"
          : payment.status === "PENDING"
            ? "pending"
            : "processing",
      amount_cents: payment.status === "REFUNDED" ? -payment.amount : payment.amount,
      description: payment.status === "REFUNDED" ? "Refund" : "Booking deposit",
      subtitle: `${payment.booking.booker_name} · ${bookingTypeLabels[payment.booking.type] || payment.booking.type}`,
      created_at: payment.paid_at || payment.created_at,
    });
  }

  // Add purchases
  for (const purchase of paidPurchases.slice(0, 10)) {
    transactions.push({
      id: purchase.id,
      type: purchase.payment_status === "REFUNDED" ? "refund" : "drop_sales",
      status:
        purchase.payment_status === "PAID"
          ? "completed"
          : purchase.payment_status === "PENDING"
            ? "pending"
            : "processing",
      amount_cents: purchase.payment_status === "REFUNDED" ? -purchase.amount : purchase.amount,
      description: "Drop sales",
      subtitle: `${purchase.drop.title} · ${purchase.quantity} ticket${purchase.quantity > 1 ? "s" : ""}`,
      created_at: purchase.paid_at || purchase.created_at,
    });
  }

  // Sort by date
  transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    data: {
      availableBalance: totalFromBookings + totalFromPurchases,
      pendingBalance: pendingFromBookings + pendingFromPurchases,
      totalEarned: totalFromBookings + totalFromPurchases,
      thisMonth: thisMonthTotal,
      thisMonthChange: monthChange,
      transactionsThisMonth: thisMonthBookingCount + thisMonthPurchaseCount,
    },
    transactions: transactions.slice(0, 10),
  };
}
