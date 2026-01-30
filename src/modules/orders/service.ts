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
    const paymentProvider = (data.paymentProvider ?? "STRIPE") as "STRIPE" | "MOMO" | "VNPAY";
    const totalOrderPrice = totalPrice + deliveryFee;

    return prisma.order.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        status: "PENDING",
        totalPrice: totalOrderPrice,
        deliveryFee,
        paymentStatus,
        orderItems: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: "PENDING",
            changedBy: userId,
          },
        },
        payments: {
          create: {
            provider: paymentProvider,
            amount: totalOrderPrice,
            status: paymentStatus,
          },
        },
      },
      include: { orderItems: true, statusHistory: true, payments: true },
    });
  }

  async getOrders(userId: string, role: string) {
    if (role === "USER") {
      return prisma.order.findMany({
        where: { userId },
        include: { orderItems: true, restaurant: true, statusHistory: true, payments: true },
      });
    }
    if (role === "ADMIN") {
      return prisma.order.findMany({
        include: {
          orderItems: true,
          restaurant: true,
          user: true,
          statusHistory: true,
          payments: true,
        },
      });
    }
    return [];
  }

  async updateStatus(
    orderId: string,
    status: z.infer<typeof updateOrderStatusSchema>["status"],
    changedBy: string
  ) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            changedBy,
          },
        },
      },
      include: { orderItems: true, statusHistory: true },
    });
  }
}

export const orderService = new OrderService();
