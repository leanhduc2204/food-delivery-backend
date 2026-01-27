import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2),
});

export const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  restaurantId: z.string().uuid(),
});

// Query parameters schema for getRestaurants endpoint
// Note: Express query params come as strings, so we need to coerce them
export const getRestaurantsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  category: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  sortBy: z.enum(["name", "createdAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});
