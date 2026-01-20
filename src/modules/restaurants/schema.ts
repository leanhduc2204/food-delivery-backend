import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2),
});

export const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  restaurantId: z.string().uuid(),
});
