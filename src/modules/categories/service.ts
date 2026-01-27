import prisma from "../../config/prisma";
import { z } from "zod";
import { createCategorySchema, addRestaurantToCategorySchema } from "./schema";

export class CategoryService {
  async createCategory(data: z.infer<typeof createCategorySchema>) {
    return prisma.category.create({
      data,
    });
  }

  async getCategories() {
    return prisma.category.findMany({
      include: { restaurants: true },
    });
  }

  async addRestaurantToCategory(
    data: z.infer<typeof addRestaurantToCategorySchema>,
  ) {
    return prisma.category.update({
      where: { id: data.categoryId },
      data: {
        restaurants: {
          connect: { id: data.restaurantId },
        },
      },
    });
  }
}

export const categoryService = new CategoryService();
