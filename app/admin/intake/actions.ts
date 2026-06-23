"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminSectionForCategory, articleAdminEditHref } from "@/lib/admin-sections";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const optional = z.string().optional().transform((value) => value?.trim() || null);

const editSchema = z.object({
  title: z.string().min(3),
  suggestedCategorySlug: z.string().min(1),
  suggestedTags: z.string().optional(),
  suggestedImportance: z.coerce.number().int().min(0).max(100),
  executiveSummary: z.string().min(1)
});

function refresh() {
  revalidatePath("/admin/intake");
  revalidatePath("/admin");
}

async function uniqueArticleSlug(baseSlug: string) {
  let slug = baseSlug || "story";
  let suffix = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

/** Saves inline edits to suggested fields before the item is approved or rejected. */
export async function updateIntakeItem(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = editSchema.parse(raw);
  await prisma.intakeItem.update({
    where: { id },
    data: {
      title: parsed.title,
      suggestedCategorySlug: parsed.suggestedCategorySlug,
      suggestedImportance: parsed.suggestedImportance,
      executiveSummary: parsed.executiveSummary,
      suggestedTags: parsed.suggestedTags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? []
    }
  });
  refresh();
}

/**
 * Converts an IntakeItem into a real Article (status "draft" — never published here)
 * the same way a human would via /admin/[section]/new, then sends the editor straight
 * into the existing article editor to finish and publish. The intake item is marked
 * approved and linked to the new article; it never becomes an Article on its own again.
 */
export async function approveIntakeItem(id: string) {
  const item = await prisma.intakeItem.findUniqueOrThrow({ where: { id }, include: { source: true } });
  if (!item.suggestedCategorySlug) {
    throw new Error("This item has no category assigned yet — edit it and choose a category before approving.");
  }

  const category = await prisma.category.findUnique({ where: { slug: item.suggestedCategorySlug } });
  if (!category) {
    throw new Error(`Category "${item.suggestedCategorySlug}" does not exist.`);
  }

  const slug = await uniqueArticleSlug(slugify(item.title));

  const article = await prisma.article.create({
    data: {
      title: item.title,
      slug,
      originalUrl: item.originalUrl,
      publishedAt: item.publishedAt,
      originalExcerpt: item.rawExcerpt,
      aiSummary: item.executiveSummary,
      importanceScore: item.suggestedImportance,
      tags: item.suggestedTags,
      status: "draft",
      sourceId: item.sourceId,
      categoryId: category.id
    }
  });

  await prisma.intakeItem.update({ where: { id }, data: { status: "approved", articleId: article.id } });
  refresh();

  const section = adminSectionForCategory(category.slug);
  const editHref = section ? articleAdminEditHref(section.slug, article.id) : undefined;
  redirect(editHref ?? "/admin/intake");
}

export async function rejectIntakeItem(id: string) {
  await prisma.intakeItem.update({ where: { id }, data: { status: "rejected" } });
  refresh();
}

export async function archiveIntakeItem(id: string) {
  await prisma.intakeItem.update({ where: { id }, data: { status: "archived" } });
  refresh();
}

export async function scheduleIntakeItem(id: string, formData: FormData) {
  const scheduledFor = optional.parse(formData.get("scheduledFor"));
  if (!scheduledFor) throw new Error("Choose a date/time to schedule this item for.");
  await prisma.intakeItem.update({ where: { id }, data: { status: "scheduled", scheduledFor: new Date(scheduledFor) } });
  refresh();
}

export async function restoreIntakeItem(id: string) {
  await prisma.intakeItem.update({ where: { id }, data: { status: "pending", scheduledFor: null } });
  refresh();
}
