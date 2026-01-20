import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { z } from "zod";
import { registerSchema, loginSchema } from "./schema";

const SALT_ROUNDS = 10;

export class AuthService {
  async register(data: z.infer<typeof registerSchema>) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const token = this.generateToken(user.id, user.role);

    return { user, token };
  }

  async login(data: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user.id, user.role);

    return { user, token };
  }

  private generateToken(userId: string, role: string) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || "secret", {
      expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as any,
    });
  }
}

export const authService = new AuthService();
