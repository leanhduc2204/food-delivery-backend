import { z } from "zod";

export const createGlobalCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(1).max(100).optional(),
  emoji: z.string().max(10).optional().default("📦"),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateGlobalCategorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(1).max(100).optional(),
  emoji: z.string().max(10).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const getGlobalCategoriesQuerySchema = z.object({
  isActive: z.coerce.boolean().optional().default(true),
});
