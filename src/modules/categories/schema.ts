import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
});

export const addRestaurantToCategorySchema = z.object({
  restaurantId: z.string().uuid(),
  categoryId: z.string().uuid(),
});
