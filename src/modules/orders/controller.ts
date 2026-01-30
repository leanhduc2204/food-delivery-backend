import { Request, Response } from "express";
import { orderService } from "./service";
import { createOrderSchema, updateOrderStatusSchema } from "./schema";
import { AuthRequest } from "../../common/middlewares/authMiddleware";

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });

      const data = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(authReq.user.userId, data);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });

      const orders = await orderService.getOrders(
        authReq.user.userId,
        authReq.user.role
      );
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const { id } = req.params;
      const data = updateOrderStatusSchema.parse(req.body);
      const order = await orderService.updateStatus(
        id,
        data.status,
        authReq.user.userId
      );
      res.status(200).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const orderController = new OrderController();
