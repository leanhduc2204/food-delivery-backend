import { z } from "zod";

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
  transactionId: z.string().optional(),
});
