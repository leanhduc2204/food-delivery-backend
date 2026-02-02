import { Router } from "express";
import { restaurantController } from "./controller";
import {
  authenticate,
  authorize,
} from "../../common/middlewares/authMiddleware";

const router = Router();

// Public
router.get("/", restaurantController.getRestaurants);
router.get("/:id", restaurantController.getRestaurantById);

// Protected (Admin only)
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  restaurantController.createRestaurant
);
router.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  restaurantController.updateRestaurant
);
router.post(
  "/menu",
  authenticate,
  authorize(["ADMIN"]),
  restaurantController.addMenuItem
);

export default router;
