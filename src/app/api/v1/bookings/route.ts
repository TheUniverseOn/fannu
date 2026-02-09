import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingRequestSchema } from "@/lib/validations/booking";
import { generateReferenceCode } from "@/lib/utils";

// POST /api/v1/bookings - Create a new booking request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = bookingRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: result.error.flatten() } },
        { status: 400 }
      );
    }

    const data = result.data;
    const supabase = createAdminClient();

    // Resolve creator by slug
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, display_name, phone, booking_enabled, booking_approved")
      .eq("slug", data.creator_slug)
      .eq("status", "ACTIVE")
      .single();

    if (creatorError || !creator) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Creator not found" } },
        { status: 404 }
      );
    }

    if (!creator.booking_enabled || !creator.booking_approved) {
      return NextResponse.json(
        { error: { code: "INVALID_STATE", message: "Creator is not accepting bookings" } },
        { status: 400 }
      );
    }

    // Generate unique reference code
    let referenceCode = generateReferenceCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("reference_code", referenceCode)
        .single();
      
      if (!existing) break;
      referenceCode = generateReferenceCode();
      attempts++;
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        creator_id: creator.id,
        booker_name: data.booker_name,
        booker_phone: data.booker_phone,
        booker_email: data.booker_email || null,
        type: data.type,
        start_at: data.start_at,
        end_at: data.end_at,
        location_city: data.location_city,
        location_venue: data.location_venue || null,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        notes: data.notes,
        attachments: data.attachments || [],
        status: "REQUESTED",
        reference_code: referenceCode,
      })
      .select("id, reference_code, status")
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      return NextResponse.json(
        { error: { code: "DATABASE_ERROR", message: "Failed to create booking" } },
        { status: 500 }
      );
    }

    // Log event
    await supabase.from("booking_event_log").insert({
      booking_id: booking.id,
      event_type: "requested",
      actor_type: "BOOKER",
      metadata: { booker_name: data.booker_name },
    });

    // TODO: Send notifications (SMS/WhatsApp) to creator and booker

    return NextResponse.json(
      {
        id: booking.id,
        reference_code: booking.reference_code,
        status: booking.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
