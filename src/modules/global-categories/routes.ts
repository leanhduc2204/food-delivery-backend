import { Router } from "express";
import { globalCategoryController } from "./controller";
import {
  authenticate,
  authorize,
} from "../../common/middlewares/authMiddleware";

const router = Router();

// Public
router.get("/", globalCategoryController.getGlobalCategories);
router.get("/:id", globalCategoryController.getGlobalCategoryById);

// Protected (Admin only)
router.post(
  "/",
  authenticate,
  authorize(["ADMIN"]),
  globalCategoryController.createGlobalCategory
);
router.patch(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  globalCategoryController.updateGlobalCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  globalCategoryController.deleteGlobalCategory
);

export default router;
