import { Router } from "express";
import { orderController } from "./controller";
import {
  authenticate,
  authorize,
} from "../../common/middlewares/authMiddleware";

const router = Router();

router.use(authenticate); // All order routes require auth

router.post("/", orderController.createOrder); // Customer creates order
router.get("/", orderController.getOrders); // Customer/Restaurant views orders
router.patch(
  "/:id/status",
  authorize(["RESTAURANT_OWNER", "DRIVER"]),
  orderController.updateStatus
);

export default router;
