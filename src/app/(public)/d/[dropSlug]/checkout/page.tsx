import { notFound, redirect } from "next/navigation";
import { getDropBySlug } from "@/lib/queries/drops";
import { CheckoutClient } from "./checkout-client";

interface CheckoutPageProps {
  params: Promise<{ dropSlug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { dropSlug } = await params;
  const drop = await getDropBySlug(dropSlug);

  if (!drop) {
    notFound();
  }

  // Redirect if drop is not purchasable
  if (drop.status !== "LIVE") {
    redirect(`/d/${dropSlug}`);
  }

  // Redirect if sold out
  if (drop.total_slots !== null && drop.slots_remaining === 0) {
    redirect(`/d/${dropSlug}`);
  }

  // Redirect if free (no checkout needed)
  if (!drop.price || drop.price === 0) {
    redirect(`/d/${dropSlug}`);
  }

  return <CheckoutClient drop={drop} />;
}
