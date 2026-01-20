import { z } from "zod";

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .nonempty(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "ON_THE_WAY",
    "DELIVERED",
    "CANCELLED",
  ]),
});
