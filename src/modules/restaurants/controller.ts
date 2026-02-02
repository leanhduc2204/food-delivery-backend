import { Request, Response } from "express";
import { restaurantService } from "./service";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  createMenuItemSchema,
  getRestaurantsQuerySchema,
} from "./schema";
import { AuthRequest } from "../../common/middlewares/authMiddleware";

export class RestaurantController {
  async createRestaurant(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });

      const data = createRestaurantSchema.parse(req.body);
      const restaurant = await restaurantService.createRestaurant(data);
      res.status(201).json(restaurant);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getRestaurants(req: Request, res: Response) {
    try {
      // Parse and validate query parameters
      const queryParams = getRestaurantsQuerySchema.parse(req.query);
      const result = await restaurantService.getRestaurants(queryParams);
      res.status(200).json(result);
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

  async getRestaurantById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const restaurant = await restaurantService.getRestaurantById(id);
      if (!restaurant)
        return res.status(404).json({ message: "Restaurant not found" });
      res.status(200).json(restaurant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateRestaurant(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const { id } = req.params;
      const data = updateRestaurantSchema.parse(req.body);
      const restaurant = await restaurantService.updateRestaurant(id, data);
      if (!restaurant)
        return res.status(404).json({ message: "Restaurant not found" });
      res.status(200).json(restaurant);
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

  async addMenuItem(req: Request, res: Response) {
    try {
      const data = createMenuItemSchema.parse(req.body);
      const item = await restaurantService.addMenuItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const restaurantController = new RestaurantController();
