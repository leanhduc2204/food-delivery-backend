import { Router } from "express";
import { paymentController } from "./controller";
import {
  authenticate,
  authorize,
} from "../../common/middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

router.get("/order/:orderId", paymentController.getPaymentsByOrderId);
router.get("/:id", paymentController.getPaymentById);
router.patch(
  "/:id/status",
  authorize(["ADMIN"]),
  paymentController.updatePaymentStatus
);

export default router;
