import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "./schema";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

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
        email: data.email,
        name: data.name,
        role: data.role as "USER" | "ADMIN",
        passwordHash: hashedPassword,
      },
    });

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    };
  }

  async login(data: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const accessToken = this.generateAccessToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    };
  }

  async refresh(data: z.infer<typeof refreshTokenSchema>) {
    const payload = this.verifyRefreshToken(data.refreshToken);
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        refreshToken: data.refreshToken,
      },
    });
    if (!user) {
      throw new Error("Invalid or expired refresh token");
    }
    const accessToken = this.generateAccessToken(user.id, user.role);
    const newRefreshToken = this.generateRefreshToken(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });
    const { passwordHash: _, refreshToken: __, ...userWithoutSensitive } = user;
    return {
      user: userWithoutSensitive,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    };
  }

  async logout(data: z.infer<typeof logoutSchema>) {
    if (!data.refreshToken) {
      return { message: "Logged out" };
    }
    let payload: { userId: string } | null = null;
    try {
      payload = this.verifyRefreshToken(data.refreshToken);
    } catch {
      return { message: "Logged out" };
    }
    await prisma.user.updateMany({
      where: { id: payload.userId, refreshToken: data.refreshToken },
      data: { refreshToken: null },
    });
    return { message: "Logged out" };
  }

  private generateAccessToken(userId: string, role: string) {
    return jwt.sign(
      { userId, role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
    );
  }

  private generateRefreshToken(userId: string) {
    return jwt.sign(
      { userId, type: "refresh" },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
    );
  }

  private verifyRefreshToken(token: string): { userId: string } {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      type?: string;
    };
    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return { userId: payload.userId };
  }
}

export const authService = new AuthService();
