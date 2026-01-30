import { Request, Response } from "express";
import { addressService } from "./service";
import { createAddressSchema, updateAddressSchema } from "./schema";
import { AuthRequest } from "../../common/middlewares/authMiddleware";

export class AddressController {
  async createAddress(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const data = createAddressSchema.parse(req.body);
      const address = await addressService.createAddress(
        authReq.user.userId,
        data
      );
      res.status(201).json(address);
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

  async getAddresses(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const addresses = await addressService.getAddresses(authReq.user.userId);
      res.status(200).json(addresses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAddressById(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const { id } = req.params;
      const address = await addressService.getAddressById(
        id,
        authReq.user.userId
      );
      if (!address)
        return res.status(404).json({ message: "Address not found" });
      res.status(200).json(address);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const { id } = req.params;
      const data = updateAddressSchema.parse(req.body);
      const address = await addressService.updateAddress(
        id,
        authReq.user.userId,
        data
      );
      if (!address)
        return res.status(404).json({ message: "Address not found" });
      res.status(200).json(address);
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

  async deleteAddress(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user)
        return res.status(401).json({ message: "Unauthorized" });
      const { id } = req.params;
      const address = await addressService.deleteAddress(
        id,
        authReq.user.userId
      );
      if (!address)
        return res.status(404).json({ message: "Address not found" });
      res.status(200).json({ message: "Address deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const addressController = new AddressController();
