import { Request, Response } from "express";
import { globalCategoryService } from "./service";
import {
  createGlobalCategorySchema,
  updateGlobalCategorySchema,
  getGlobalCategoriesQuerySchema,
} from "./schema";

export class GlobalCategoryController {
  async createGlobalCategory(req: Request, res: Response) {
    try {
      const data = createGlobalCategorySchema.parse(req.body);
      const category = await globalCategoryService.createGlobalCategory(data);
      res.status(201).json(category);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid input",
          errors: error.errors,
        });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async getGlobalCategories(req: Request, res: Response) {
    try {
      const query = getGlobalCategoriesQuerySchema.parse(req.query);
      const slug = req.query.slug as string | undefined;
      if (slug) {
        const category = await globalCategoryService.getGlobalCategoryBySlug(slug);
        if (!category)
          return res.status(404).json({ message: "Global category not found" });
        return res.status(200).json(category);
      }
      const categories = await globalCategoryService.getGlobalCategories(
        query.isActive
      );
      res.status(200).json(categories);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid query parameters",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async getGlobalCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await globalCategoryService.getGlobalCategoryById(id);
      if (!category)
        return res.status(404).json({ message: "Global category not found" });
      res.status(200).json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateGlobalCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateGlobalCategorySchema.parse(req.body);
      const category = await globalCategoryService.updateGlobalCategory(id, data);
      if (!category)
        return res.status(404).json({ message: "Global category not found" });
      res.status(200).json(category);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid input",
          errors: error.errors,
        });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async deleteGlobalCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await globalCategoryService.deleteGlobalCategory(id);
      if (!category)
        return res.status(404).json({ message: "Global category not found" });
      res.status(200).json({ message: "Global category deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const globalCategoryController = new GlobalCategoryController();
