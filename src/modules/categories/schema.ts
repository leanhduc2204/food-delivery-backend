import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
  restaurantId: z.string().uuid(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});
