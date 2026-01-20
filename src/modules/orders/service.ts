import prisma from "../../config/prisma";
import { z } from "zod";
import { createOrderSchema, updateOrderStatusSchema } from "./schema";

export class OrderService {
  async createOrder(userId: string, data: z.infer<typeof createOrderSchema>) {
    // Calculate total price (simplified: assuming we fetch prices)
    // For this MVP, we will fetch menu items to calculate total
    let total = 0;

    // Check if items exist and calculate total
    // Note: In real app, optimize this to fewer queries
    for (const item of data.items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      total += Number(menuItem.price) * item.quantity;
    }

    return prisma.order.create({
      data: {
        userId,
        restaurantId: data.restaurantId,
        total,
        status: "PENDING",
      },
    });
  }

  async getOrders(userId: string, role: string) {
    if (role === "CUSTOMER") {
      return prisma.order.findMany({ where: { userId } });
    } else if (role === "RESTAURANT_OWNER") {
      // Find restaurants owned by user
      const restaurants = await prisma.restaurant.findMany({
        where: { ownerId: userId },
      });
      const restaurantIds = restaurants.map((r) => r.id);
      return prisma.order.findMany({
        where: { restaurantId: { in: restaurantIds } },
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
