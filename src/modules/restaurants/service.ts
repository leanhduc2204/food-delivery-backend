import prisma from "../../config/prisma";
import { z } from "zod";
import { createRestaurantSchema, createMenuItemSchema } from "./schema";

export class RestaurantService {
  async createRestaurant(
    ownerId: string,
    data: z.infer<typeof createRestaurantSchema>
  ) {
    return prisma.restaurant.create({
      data: {
        ...data,
        ownerId,
      },
    });
  }

  async getRestaurants() {
    return prisma.restaurant.findMany({
      include: { menu: true },
    });
  }

  async getRestaurantById(id: string) {
    return prisma.restaurant.findUnique({
      where: { id },
      include: { menu: true },
    });
  }

  async addMenuItem(data: z.infer<typeof createMenuItemSchema>) {
    // Verify restaurant ownership is handled in controller/middleware or here
    return prisma.menuItem.create({
      data,
    });
  }
}

export const restaurantService = new RestaurantService();
