"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type UpdateProfileResult = { success: true } | { error: string };

export async function updateCreatorProfile(data: {
  creatorId: string;
  displayName: string;
  bio: string | null;
  email: string | null;
  avatarUrl?: string | null;
}): Promise<UpdateProfileResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("creators")
    .update({
      display_name: data.displayName,
      bio: data.bio,
      email: data.email,
      avatar_url: data.avatarUrl,
    })
    .eq("id", data.creatorId);

  if (error) {
    console.error("Error updating creator profile:", error);
    return { error: "Failed to update profile" };
  }

  revalidatePath("/app/settings");
  revalidatePath(`/c/`);
  return { success: true };
}

export async function updateCreatorBookingSettings(data: {
  creatorId: string;
  bookingEnabled: boolean;
  defaultDepositPercent: number;
  defaultDepositRefundable: boolean;
  defaultAdditionalTerms: string | null;
}): Promise<UpdateProfileResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("creators")
    .update({
      booking_enabled: data.bookingEnabled,
      default_deposit_percent: data.defaultDepositPercent,
      default_deposit_refundable: data.defaultDepositRefundable,
      default_additional_terms: data.defaultAdditionalTerms,
    })
    .eq("id", data.creatorId);

  if (error) {
    console.error("Error updating booking settings:", error);
    return { error: "Failed to update booking settings" };
  }

  revalidatePath("/app/settings");
  return { success: true };
}
