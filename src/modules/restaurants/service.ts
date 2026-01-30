import prisma from "../../config/prisma";
import { z } from "zod";
import {
  createRestaurantSchema,
  createMenuItemSchema,
  getRestaurantsQuerySchema,
} from "./schema";
import { Prisma } from "@prisma/client";

export class RestaurantService {
  async createRestaurant(data: z.infer<typeof createRestaurantSchema>) {
    return prisma.restaurant.create({
      data,
    });
  }

  async getRestaurants(query: z.infer<typeof getRestaurantsQuerySchema>) {
    const {
      search,
      category,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "asc",
    } = query;

    // Build where clause
    const where: Prisma.RestaurantWhereInput = {};

    // Search filter (case-insensitive partial match on name)
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Category filter
    if (category) {
      where.categories = {
        some: {
          id: category,
        },
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause
    const orderBy: Prisma.RestaurantOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          categories: { include: { menuItems: true } },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.restaurant.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      data: restaurants,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    };
  }

  async getRestaurantById(id: string) {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: { include: { menuItems: true } },
      },
    });
  }

  async addMenuItem(data: z.infer<typeof createMenuItemSchema>) {
    return prisma.menuItem.create({
      data,
    });
  }
}

export const restaurantService = new RestaurantService();
