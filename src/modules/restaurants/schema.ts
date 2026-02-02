import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  rating: z.number().min(0).max(5).optional().default(0),
  viewCount: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional().default(true),
  categoryId: z.string().uuid(),
});

export const getRestaurantsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  category: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional().default(true),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  sortBy: z.enum(["name", "createdAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});
