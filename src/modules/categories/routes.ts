import { Router } from "express";
import { categoryController } from "./controller";
import {
  authenticate,
  authorize,
} from "../../common/middlewares/authMiddleware";

const router = Router();

// Public
router.get("/", categoryController.getCategories);

// Protected (Admin only)
router.post("/", authenticate, authorize(["ADMIN"]), categoryController.createCategory);

export default router;
