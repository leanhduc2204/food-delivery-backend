import { Request, Response } from "express";
import { restaurantService } from "./service";
import { createRestaurantSchema, createMenuItemSchema } from "./schema";
import { AuthRequest } from "../../common/middlewares/authMiddleware";

export class RestaurantController {
  async createRestaurant(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });

      const data = createRestaurantSchema.parse(req.body);
      const restaurant = await restaurantService.createRestaurant(
        authReq.user.userId,
        data
      );
      res.status(201).json(restaurant);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getRestaurants(req: Request, res: Response) {
    try {
      const restaurants = await restaurantService.getRestaurants();
      res.status(200).json(restaurants);
    } catch (error: any) {
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

  async addMenuItem(req: Request, res: Response) {
    try {
      // Note: Ideally check if user owns the restaurant
      const data = createMenuItemSchema.parse(req.body);
      const item = await restaurantService.addMenuItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const restaurantController = new RestaurantController();
