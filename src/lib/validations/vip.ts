import { z } from "zod";

const ethiopianPhoneRegex = /^\+251[0-9]{9}$/;

export const vipJoinSchema = z.object({
  creator_id: z.string().uuid("Invalid creator ID"),
  fan_phone: z.string().regex(ethiopianPhoneRegex, "Valid Ethiopian phone number required"),
  fan_name: z.string().max(100).optional(),
  channel: z.enum(["TELEGRAM", "WHATSAPP", "SMS"]),
  source: z.enum(["DROP_PAGE", "CREATOR_PROFILE", "DIRECT_LINK"]),
  source_ref: z.string().optional(),
});

export type VIPJoinInput = z.infer<typeof vipJoinSchema>;
