import { Router } from "express";
import { addressController } from "./controller";
import { authenticate } from "../../common/middlewares/authMiddleware";

const router = Router();

router.use(authenticate);

router.post("/", addressController.createAddress);
router.get("/", addressController.getAddresses);
router.get("/:id", addressController.getAddressById);
router.patch("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

export default router;
