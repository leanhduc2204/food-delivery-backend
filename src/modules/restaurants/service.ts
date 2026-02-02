import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "../../config/prisma";
import {
  createMenuItemSchema,
  createRestaurantSchema,
  updateRestaurantSchema,
  getRestaurantsQuerySchema,
} from "./schema";

const includeGlobalCategories = {
  globalCategoryLinks: {
    include: { globalCategory: true },
  },
};

export class RestaurantService {
  async createRestaurant(data: z.infer<typeof createRestaurantSchema>) {
    const { globalCategoryIds = [], ...rest } = data;
    return prisma.restaurant.create({
      data: {
        ...rest,
        globalCategoryLinks:
          globalCategoryIds.length > 0
            ? {
                create: globalCategoryIds.map((globalCategoryId) => ({
                  globalCategoryId,
                })),
              }
            : undefined,
      },
      include: {
        categories: true,
        ...includeGlobalCategories,
      },
    });
  }

  async getRestaurants(query: z.infer<typeof getRestaurantsQuerySchema>) {
    const {
      search,
      category,
      globalCategory,
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

    // Global category filter
    if (globalCategory) {
      where.globalCategoryLinks = {
        some: {
          globalCategoryId: globalCategory,
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
          ...includeGlobalCategories,
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
        ...includeGlobalCategories,
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

  async updateRestaurant(
    id: string,
    data: z.infer<typeof updateRestaurantSchema>
  ) {
    const existing = await prisma.restaurant.findUnique({
      where: { id },
    });
    if (!existing) return null;

    const {
      globalCategoryIds,
      ...rest
    } = data;

    const updateData: Prisma.RestaurantUpdateInput = { ...rest };

    if (globalCategoryIds !== undefined) {
      await prisma.restaurantGlobalCategory.deleteMany({
        where: { restaurantId: id },
      });
      if (globalCategoryIds.length > 0) {
        updateData.globalCategoryLinks = {
          create: globalCategoryIds.map((globalCategoryId) => ({
            globalCategoryId,
          })),
        };
      }
    }

    return prisma.restaurant.update({
      where: { id },
      data: updateData,
      include: {
        categories: true,
        ...includeGlobalCategories,
      },
    });
  }
}

export const restaurantService = new RestaurantService();
