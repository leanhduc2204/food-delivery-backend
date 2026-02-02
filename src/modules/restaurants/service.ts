import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "../../config/prisma";
import {
  createMenuItemSchema,
  createRestaurantSchema,
  getRestaurantsQuerySchema,
} from "./schema";

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
      isActive = true,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "asc",
    } = query;

    // Build where clause
    const where: Prisma.RestaurantWhereInput = { isActive };

    // Search filter (case-insensitive partial match on name)
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Category filter (only active categories when filtering by category)
    if (category) {
      where.categories = {
        some: {
          id: category,
          isActive: true,
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
          categories: {
            where: { isActive: true },
            include: { menuItems: { where: { isAvailable: true } } },
          },
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

  async getRestaurantById(
    id: string,
    onlyActive = true,
    incrementViewCount = true
  ) {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id,
        ...(onlyActive ? { isActive: true } : {}),
      },
      include: {
        categories: {
          where: onlyActive ? { isActive: true } : undefined,
          include: {
            menuItems: onlyActive ? { where: { isAvailable: true } } : true,
          },
        },
      },
    });
    if (restaurant && incrementViewCount) {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { viewCount: { increment: 1 } },
      });
      return { ...restaurant, viewCount: restaurant.viewCount + 1 };
    }
    return restaurant;
  }

  async addMenuItem(data: z.infer<typeof createMenuItemSchema>) {
    return prisma.menuItem.create({
      data,
    });
  }
}

export const restaurantService = new RestaurantService();
