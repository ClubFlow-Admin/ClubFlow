"use server";

import { ArticleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const articleSchema = z.object({
  title: z.string().min(3),
  originalUrl: z.string().url(),
  sourceId: z.string().min(1),
  categoryId: z.string().min(1),
  author: z.string().optional(),
  publishedAt: z.string().min(1),
  tags: z.string().optional(),
  clubName: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  originalExcerpt: z.string().optional(),
  aiSummary: z.string().min(10),
  importanceScore: z.coerce.number().int().min(0).max(100),
  status: z.nativeEnum(ArticleStatus),
  heroImageId: z.string().optional()
});

function parseArticleForm(formData: FormData) {
  const parsed = articleSchema.parse(Object.fromEntries(formData.entries()));
  return {
    ...parsed,
    slug: slugify(parsed.title),
    publishedAt: new Date(parsed.publishedAt),
    tags: parsed.tags
      ? parsed.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    author: parsed.author || null,
    clubName: parsed.clubName || null,
    city: parsed.city || null,
    state: parsed.state || null,
    originalExcerpt: parsed.originalExcerpt || null,
    heroImageId: parsed.heroImageId || null
  };
}

export async function createArticle(formData: FormData) {
  const data = parseArticleForm(formData);

  await prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      originalUrl: data.originalUrl,
      author: data.author,
      publishedAt: data.publishedAt,
      tags: data.tags,
      clubName: data.clubName,
      city: data.city,
      state: data.state,
      originalExcerpt: data.originalExcerpt,
      aiSummary: data.aiSummary,
      importanceScore: data.importanceScore,
      status: data.status,
      sourceId: data.sourceId,
      categoryId: data.categoryId,
      heroImageId: data.heroImageId
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateArticle(id: string, formData: FormData) {
  const data = parseArticleForm(formData);

  await prisma.article.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      originalUrl: data.originalUrl,
      author: data.author,
      publishedAt: data.publishedAt,
      tags: data.tags,
      clubName: data.clubName,
      city: data.city,
      state: data.state,
      originalExcerpt: data.originalExcerpt,
      aiSummary: data.aiSummary,
      importanceScore: data.importanceScore,
      status: data.status,
      sourceId: data.sourceId,
      categoryId: data.categoryId,
      heroImageId: data.heroImageId
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
}
