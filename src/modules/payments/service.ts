import prisma from "../../config/prisma";
import { z } from "zod";
import { updatePaymentStatusSchema } from "./schema";

export class PaymentService {
  async getPaymentsByOrderId(orderId: string, userId: string, role: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { payments: true },
    });
    if (!order) return null;
    if (role === "ADMIN") return order.payments;
    if (order.userId !== userId) return null;
    return order.payments;
  }

  async getPaymentById(id: string, userId: string, role: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!payment) return null;
    if (role === "ADMIN") return payment;
    if (payment.order.userId !== userId) return null;
    return payment;
  }

  async updatePaymentStatus(
    id: string,
    userId: string,
    role: string,
    data: z.infer<typeof updatePaymentStatusSchema>
  ) {
    const payment = await this.getPaymentById(id, userId, role);
    if (!payment) return null;
    if (role !== "ADMIN") return null;
    return prisma.payment.update({
      where: { id },
      data: {
        status: data.status,
        ...(data.transactionId !== undefined && {
          transactionId: data.transactionId,
        }),
      },
      include: { order: true },
    });
  }
}

export const paymentService = new PaymentService();
