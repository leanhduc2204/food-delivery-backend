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

  async getCategories(restaurantId?: string) {
    return prisma.category.findMany({
      where: restaurantId ? { restaurantId } : undefined,
      include: { restaurant: true, menuItems: true },
      orderBy: { sortOrder: "asc" },
    });
  }
}

export const categoryService = new CategoryService();
