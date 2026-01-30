import { Request, Response } from "express";
import { paymentService } from "./service";
import { updatePaymentStatusSchema } from "./schema";
import { AuthRequest } from "../../common/middlewares/authMiddleware";

export class PaymentController {
  async getPaymentsByOrderId(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const { orderId } = req.params;
      const payments = await paymentService.getPaymentsByOrderId(
        orderId,
        authReq.user.userId,
        authReq.user.role
      );
      if (payments === null)
        return res.status(404).json({ message: "Order not found" });
      res.status(200).json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getPaymentById(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(
        id,
        authReq.user.userId,
        authReq.user.role
      );
      if (!payment)
        return res.status(404).json({ message: "Payment not found" });
      res.status(200).json(payment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const { id } = req.params;
      const data = updatePaymentStatusSchema.parse(req.body);
      const payment = await paymentService.updatePaymentStatus(
        id,
        authReq.user.userId,
        authReq.user.role,
        data
      );
      if (!payment)
        return res
          .status(404)
          .json({ message: "Payment not found or insufficient permissions" });
      res.status(200).json(payment);
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
}

export const paymentController = new PaymentController();
