import prisma from "../../config/prisma";
import { z } from "zod";
import { createOrderSchema, updateOrderStatusSchema } from "./schema";

export class OrderService {
  async createOrder(userId: string, data: z.infer<typeof createOrderSchema>) {
    let totalPrice = 0;
    const orderItems: { menuItemId: string; quantity: number; price: number }[] = [];

    for (const item of data.items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      const price = Number(menuItem.price);
      totalPrice += price * item.quantity;
      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price,
      });
    }

    const deliveryFee = data.deliveryFee ?? 0;
    const paymentStatus = (data.paymentStatus ?? "PENDING") as "PENDING" | "PAID" | "FAILED" | "REFUNDED";

    return prisma.order.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        status: "PENDING",
        totalPrice: totalPrice + deliveryFee,
        deliveryFee,
        paymentStatus,
        orderItems: {
          create: orderItems,
        },
      },
      include: { orderItems: true },
    });
  }

  async getOrders(userId: string, role: string) {
    if (role === "USER") {
      return prisma.order.findMany({
        where: { userId },
        include: { orderItems: true, restaurant: true },
      });
    }
    if (role === "ADMIN") {
      return prisma.order.findMany({
        include: { orderItems: true, restaurant: true, user: true },
      });
    }
    return [];
  }

  async updateStatus(
    orderId: string,
    status: z.infer<typeof updateOrderStatusSchema>["status"]
  ) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}

export const orderService = new OrderService();
