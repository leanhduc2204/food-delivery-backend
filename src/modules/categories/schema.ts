import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
  emoji: z.string().max(10).optional().default("📦"),
  restaurantId: z.string().uuid(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const getCategoriesQuerySchema = z.object({
  restaurantId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional().default(true),
});
