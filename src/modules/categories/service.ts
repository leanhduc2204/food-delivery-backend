import prisma from "../../config/prisma";
import { z } from "zod";
import { createCategorySchema } from "./schema";

export class CategoryService {
  async createCategory(data: z.infer<typeof createCategorySchema>) {
    return prisma.category.create({
      data,
      include: { restaurant: true, menuItems: true },
    });
  }

  async getCategories(restaurantId?: string, onlyActive = true) {
    return prisma.category.findMany({
      where: {
        ...(restaurantId ? { restaurantId } : {}),
        ...(onlyActive ? { isActive: true } : {}),
      },
      include: {
        restaurant: true,
        menuItems: onlyActive ? { where: { isAvailable: true } } : true,
      },
      orderBy: { sortOrder: "asc" },
    });
  }
}

export const categoryService = new CategoryService();
