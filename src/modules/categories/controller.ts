import { Request, Response } from "express";
import { categoryService } from "./service";
import { createCategorySchema } from "./schema";

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    try {
      const data = createCategorySchema.parse(req.body);
      const category = await categoryService.createCategory(data);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const restaurantId = req.query.restaurantId as string | undefined;
      const categories = await categoryService.getCategories(restaurantId);
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const categoryController = new CategoryController();
