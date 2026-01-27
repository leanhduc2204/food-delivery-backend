import { Router } from "express";
import { categoryController } from "./controller";
import {
  authenticate,
  authorize,
} from "../../common/middlewares/authMiddleware";

const router = Router();

// Public
router.get("/", categoryController.getCategories);

// Protected (Admin/Owner for now, but really should be Admin)
router.post("/", authenticate, categoryController.createCategory);
router.post(
  "/add-restaurant",
  authenticate,
  categoryController.addRestaurantToCategory,
);

export default router;
