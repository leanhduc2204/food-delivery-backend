import { Request, Response } from "express";
import { authService } from "./service";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "./schema";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const data = refreshTokenSchema.parse(req.body);
      const result = await authService.refresh(data);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid input",
          errors: error.errors,
        });
      }
      res.status(401).json({ message: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const data = logoutSchema.parse(req.body);
      const result = await authService.logout(data);
      res.status(200).json(result);
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

export const authController = new AuthController();
