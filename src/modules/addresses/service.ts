import prisma from "../../config/prisma";
import { z } from "zod";
import { createAddressSchema, updateAddressSchema } from "./schema";

export class AddressService {
  async createAddress(userId: string, data: z.infer<typeof createAddressSchema>) {
    const isDefault = data.isDefault ?? false;
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.userAddress.create({
      data: {
        userId,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault,
      },
    });
  }

  async getAddresses(userId: string) {
    return prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async getAddressById(id: string, userId: string) {
    return prisma.userAddress.findFirst({
      where: { id, userId },
    });
  }

  async updateAddress(
    id: string,
    userId: string,
    data: z.infer<typeof updateAddressSchema>
  ) {
    const existing = await this.getAddressById(id, userId);
    if (!existing) return null;
    if (data.isDefault === true) {
      await prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return prisma.userAddress.update({
      where: { id },
      data: {
        ...(data.address !== undefined && { address: data.address }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  }

  async deleteAddress(id: string, userId: string) {
    const existing = await this.getAddressById(id, userId);
    if (!existing) return null;
    return prisma.userAddress.delete({
      where: { id },
    });
  }
}

export const addressService = new AddressService();
