import { z } from "zod";

// Ethiopian phone number validation (E.164 format)
const ethiopianPhoneRegex = /^\+251[0-9]{9}$/;

export const bookingRequestSchema = z.object({
  creator_slug: z.string().min(1, "Creator is required"),
  booker_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  booker_phone: z.string().regex(ethiopianPhoneRegex, "Valid Ethiopian phone number required (+251...)"),
  booker_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  type: z.enum(["LIVE_PERFORMANCE", "MC_HOSTING", "BRAND_CONTENT", "CUSTOM"]),
  start_at: z.string().datetime("Invalid date format"),
  end_at: z.string().datetime("Invalid date format"),
  location_city: z.string().min(2, "City is required").max(100),
  location_venue: z.string().max(200).optional(),
  budget_min: z.number().int().positive("Budget must be positive"),
  budget_max: z.number().int().positive("Budget must be positive"),
  notes: z.string().min(20, "Please provide at least 20 characters").max(2000),
  attachments: z.array(z.string().url()).max(3).optional(),
}).refine(data => new Date(data.end_at) > new Date(data.start_at), {
  message: "End time must be after start time",
  path: ["end_at"],
}).refine(data => data.budget_max >= data.budget_min, {
  message: "Maximum budget must be >= minimum",
  path: ["budget_max"],
}).refine(data => new Date(data.start_at) > new Date(), {
  message: "Event date must be in the future",
  path: ["start_at"],
});

export const quoteSchema = z.object({
  total_amount: z.number().int().positive("Amount must be positive"),
  deposit_percent: z.number().int().min(10).max(100),
  deposit_refundable: z.boolean(),
  expires_in_hours: z.union([
    z.literal(24),
    z.literal(48),
    z.literal(72),
    z.literal(168),
  ]),
  terms_text: z.string().min(20, "Terms must be at least 20 characters").max(5000),
});

export const declineBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(10, "Please provide a reason").max(500),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type DeclineBookingInput = z.infer<typeof declineBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
