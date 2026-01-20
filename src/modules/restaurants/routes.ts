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

// Protected (Restaurant Owner only)
router.post(
  "/",
  authenticate,
  authorize(["RESTAURANT_OWNER"]),
  restaurantController.createRestaurant
);
router.post(
  "/menu",
  authenticate,
  authorize(["RESTAURANT_OWNER"]),
  restaurantController.addMenuItem
);

export default router;
