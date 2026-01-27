import { Request, Response } from "express";
import { categoryService } from "./service";
import { createCategorySchema, addRestaurantToCategorySchema } from "./schema";
import { AuthRequest } from "../../common/middlewares/authMiddleware";

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
      const categories = await categoryService.getCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async addRestaurantToCategory(req: Request, res: Response) {
    try {
      const data = addRestaurantToCategorySchema.parse(req.body);
      const category = await categoryService.addRestaurantToCategory(data);
      res.status(200).json(category);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const categoryController = new CategoryController();
