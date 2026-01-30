import { z } from "zod";

const paymentProviderEnum = z.enum(["STRIPE", "MOMO", "VNPAY"]);

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  deliveryFee: z.number().min(0).optional().default(0),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional().default("PENDING"),
  paymentProvider: paymentProviderEnum.optional().default("STRIPE"),
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
    "COMPLETED",
    "CANCELLED",
  ]),
});
