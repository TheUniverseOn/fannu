import { Suspense } from "react";
import {
  ReceiptCard,
  ReceiptCardSkeleton,
  ReceiptNotFound,
  type ReceiptData,
} from "@/components/public/receipt-card";

// ============================================================================
// MOCK DATA
// ============================================================================

// Mock receipts for different payment states
const MOCK_RECEIPTS: Record<string, ReceiptData> = {
  // Paid drop purchase
  "abc123xy": {
    type: "drop_purchase",
    receiptId: "abc123xy",
    referenceId: "PUR-2024-00142",
    pspReference: "TLX-8472639",
    amount: 50000, // 500 ETB in cents
    currency: "ETB",
    paymentStatus: "PAID",
    createdAt: "2026-02-06T12:30:00Z",
    paidAt: "2026-02-06T12:30:45Z",
    creator: {
      display_name: "DJ Rophnan",
      phone: "+251911123456",
    },
    drop: {
      title: "Exclusive Album Pre-Release Access",
    },
    quantity: 1,
  },

  // Paid booking deposit
  "bk456def": {
    type: "booking_deposit",
    receiptId: "bk456def",
    referenceId: "DEP-2024-00089",
    pspReference: "TLX-9283746",
    amount: 250000, // 2,500 ETB in cents
    currency: "ETB",
    paymentStatus: "PAID",
    createdAt: "2026-02-06T14:15:00Z",
    paidAt: "2026-02-06T14:15:32Z",
    creator: {
      display_name: "Teddy Afro",
      phone: "+251912345678",
    },
    booking: {
      reference_code: "BK-X7K9",
      status: "DEPOSIT_PAID",
    },
    quote: {
      total_amount: 1000000, // 10,000 ETB
      deposit_amount: 250000, // 2,500 ETB (25%)
      deposit_refundable: true,
    },
  },

  // Pending payment
  pending01: {
    type: "drop_purchase",
    receiptId: "pending01",
    referenceId: "PUR-2024-00143",
    amount: 75000, // 750 ETB
    currency: "ETB",
    paymentStatus: "PENDING",
    createdAt: "2026-02-06T15:45:00Z",
    creator: {
      display_name: "Rophnan",
      phone: "+251911123456",
    },
    drop: {
      title: "VIP Meet & Greet Pass",
    },
    quantity: 2,
  },

  // Failed payment
  failed99: {
    type: "booking_deposit",
    receiptId: "failed99",
    referenceId: "DEP-2024-00090",
    amount: 150000, // 1,500 ETB
    currency: "ETB",
    paymentStatus: "FAILED",
    createdAt: "2026-02-06T10:20:00Z",
    creator: {
      display_name: "Abelone",
      phone: "+251913456789",
    },
    booking: {
      reference_code: "BK-M3P2",
      status: "QUOTED",
    },
    quote: {
      total_amount: 600000, // 6,000 ETB
      deposit_amount: 150000, // 1,500 ETB
      deposit_refundable: false,
    },
  },

  // Refunded
  refund77: {
    type: "drop_purchase",
    receiptId: "refund77",
    referenceId: "PUR-2024-00100",
    pspReference: "TLX-7362514",
    amount: 100000, // 1,000 ETB
    currency: "ETB",
    paymentStatus: "REFUNDED",
    createdAt: "2026-01-28T09:00:00Z",
    paidAt: "2026-01-28T09:00:30Z",
    creator: {
      display_name: "Hailu Mergia",
      phone: "+251914567890",
    },
    drop: {
      title: "Sold Out Concert - Cancelled Event",
    },
    quantity: 1,
  },

  // Multi-quantity drop purchase
  multi123: {
    type: "drop_purchase",
    receiptId: "multi123",
    referenceId: "PUR-2024-00145",
    pspReference: "TLX-1928374",
    amount: 150000, // 1,500 ETB (3 x 500)
    currency: "ETB",
    paymentStatus: "PAID",
    createdAt: "2026-02-06T16:00:00Z",
    paidAt: "2026-02-06T16:00:22Z",
    creator: {
      display_name: "Gizachew Teshome",
      phone: "+251915678901",
    },
    drop: {
      title: "Limited Edition Merch Bundle",
    },
    quantity: 3,
  },

  // Confirmed booking (past deposit_paid)
  confirm88: {
    type: "booking_deposit",
    receiptId: "confirm88",
    referenceId: "DEP-2024-00075",
    pspReference: "TLX-6574839",
    amount: 500000, // 5,000 ETB
    currency: "ETB",
    paymentStatus: "PAID",
    createdAt: "2026-02-01T11:30:00Z",
    paidAt: "2026-02-01T11:30:15Z",
    creator: {
      display_name: "Mahmoud Ahmed",
      phone: "+251916789012",
    },
    booking: {
      reference_code: "BK-Q8W2",
      status: "CONFIRMED",
    },
    quote: {
      total_amount: 2000000, // 20,000 ETB
      deposit_amount: 500000, // 5,000 ETB (25%)
      deposit_refundable: true,
    },
  },
};

// ============================================================================
// DATA FETCHING (Mock)
// ============================================================================

async function getReceipt(receiptId: string): Promise<ReceiptData | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock data or null if not found
  return MOCK_RECEIPTS[receiptId] || null;
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface ReceiptPageProps {
  params: Promise<{
    receiptId: string;
  }>;
}

async function ReceiptContent({ receiptId }: { receiptId: string }) {
  const receipt = await getReceipt(receiptId);

  if (!receipt) {
    return <ReceiptNotFound />;
  }

  return <ReceiptCard data={receipt} />;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { receiptId } = await params;

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-6 md:py-12 print:bg-white print:py-0">
      {/* Print-friendly container */}
      <div className="print:py-8">
        <Suspense fallback={<ReceiptCardSkeleton />}>
          <ReceiptContent receiptId={receiptId} />
        </Suspense>
      </div>
    </div>
  );
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: ReceiptPageProps) {
  const { receiptId } = await params;

  return {
    title: `Receipt ${receiptId} | FanNu`,
    description: "View your payment receipt from FanNu",
    robots: {
      index: false, // Don't index receipt pages
      follow: false,
    },
  };
}
