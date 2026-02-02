import prisma from "../../config/prisma";
import { z } from "zod";
import { slugFromName } from "../../common/utils/slug";
import {
  createGlobalCategorySchema,
  updateGlobalCategorySchema,
} from "./schema";

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 0;
  while (true) {
    const existing = await prisma.globalCategory.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (!existing) return slug;
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

export class GlobalCategoryService {
  async createGlobalCategory(
    data: z.infer<typeof createGlobalCategorySchema>
  ) {
    const slug = data.slug?.trim()
      ? slugFromName(data.slug)
      : slugFromName(data.name);
    const uniqueSlug = await ensureUniqueSlug(slug);
    return prisma.globalCategory.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        emoji: data.emoji ?? "📦",
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async getGlobalCategories(onlyActive = true) {
    return prisma.globalCategory.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { links: true } } },
    });
  }

  async getGlobalCategoryById(id: string) {
    return prisma.globalCategory.findUnique({
      where: { id },
      include: { _count: { select: { links: true } } },
    });
  }

  async getGlobalCategoryBySlug(slug: string) {
    return prisma.globalCategory.findFirst({
      where: { slug, isActive: true },
      include: { _count: { select: { links: true } } },
    });
  }

  async updateGlobalCategory(
    id: string,
    data: z.infer<typeof updateGlobalCategorySchema>
  ) {
    const existing = await prisma.globalCategory.findUnique({
      where: { id },
    });
    if (!existing) return null;

    const updateData: {
      name?: string;
      slug?: string;
      emoji?: string;
      sortOrder?: number;
      isActive?: boolean;
    } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.emoji !== undefined) updateData.emoji = data.emoji;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.name !== undefined || data.slug !== undefined) {
      const baseSlug = data.slug?.trim()
        ? slugFromName(data.slug)
        : slugFromName(data.name ?? existing.name);
      updateData.slug = await ensureUniqueSlug(baseSlug, id);
    }

    return prisma.globalCategory.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteGlobalCategory(id: string) {
    const existing = await prisma.globalCategory.findUnique({
      where: { id },
    });
    if (!existing) return null;
    return prisma.globalCategory.delete({
      where: { id },
    });
  }
}

export const globalCategoryService = new GlobalCategoryService();
