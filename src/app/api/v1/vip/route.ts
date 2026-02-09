import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { vipJoinSchema } from "@/lib/validations/vip";

// POST /api/v1/vip - Join a creator's VIP list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = vipJoinSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: result.error.flatten() } },
        { status: 400 }
      );
    }

    const data = result.data;
    const supabase = createAdminClient();

    // Check if creator exists and is active
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, display_name")
      .eq("id", data.creator_id)
      .eq("status", "ACTIVE")
      .single();

    if (creatorError || !creator) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Creator not found" } },
        { status: 404 }
      );
    }

    // Check for existing subscription
    const { data: existing } = await supabase
      .from("vip_subscriptions")
      .select("id, status")
      .eq("creator_id", data.creator_id)
      .eq("fan_phone", data.fan_phone)
      .single();

    if (existing) {
      if (existing.status === "ACTIVE") {
        return NextResponse.json(
          { error: { code: "CONFLICT", message: "Already subscribed" } },
          { status: 409 }
        );
      }
      
      // Reactivate unsubscribed user
      const { error: updateError } = await supabase
        .from("vip_subscriptions")
        .update({ status: "ACTIVE", channel: data.channel })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json(
          { error: { code: "DATABASE_ERROR", message: "Failed to reactivate subscription" } },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { id: existing.id, status: "ACTIVE", reactivated: true },
        { status: 200 }
      );
    }

    // Create new subscription
    const { data: subscription, error: insertError } = await supabase
      .from("vip_subscriptions")
      .insert({
        creator_id: data.creator_id,
        fan_phone: data.fan_phone,
        fan_name: data.fan_name || null,
        channel: data.channel,
        source: data.source,
        source_ref: data.source_ref || null,
        status: "ACTIVE",
      })
      .select("id, status")
      .single();

    if (insertError) {
      console.error("VIP subscription error:", insertError);
      return NextResponse.json(
        { error: { code: "DATABASE_ERROR", message: "Failed to create subscription" } },
        { status: 500 }
      );
    }

    // TODO: Send welcome message via selected channel

    return NextResponse.json(
      { id: subscription.id, status: subscription.status },
      { status: 201 }
    );
  } catch (error) {
    console.error("VIP API error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
