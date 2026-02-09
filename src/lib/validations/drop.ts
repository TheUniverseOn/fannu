import { z } from "zod";

export const createDropSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(2000),
  type: z.enum(["EVENT", "MERCH", "CONTENT", "CUSTOM"]),
  price: z.number().int().min(0).optional(),
  currency: z.string().default("ETB"),
  total_slots: z.number().int().positive().optional(),
  vip_required: z.boolean().default(false),
  scheduled_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional(),
  cover_image_url: z.string().url().optional(),
});

export const updateDropSchema = createDropSchema.partial();

export const publishDropSchema = z.object({
  schedule_for: z.string().datetime().optional(),
});

export type CreateDropInput = z.infer<typeof createDropSchema>;
export type UpdateDropInput = z.infer<typeof updateDropSchema>;
export type PublishDropInput = z.infer<typeof publishDropSchema>;
