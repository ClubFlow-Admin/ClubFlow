"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FeedAvailability } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sourceCategories, sourceTypes } from "@/lib/source-options";

const optionalText = z.string().optional().transform((value) => value?.trim() || null);
const optionalUrl = z.preprocess((value) => value === "" ? null : value, z.string().url().nullable());
const optionalDate = z.preprocess((value) => value === "" ? null : value, z.string().nullable());
const sourceSchema = z.object({
  name: z.string().trim().min(2),
  organization: optionalText,
  homepageUrl: optionalUrl,
  rssUrl: optionalUrl,
  sourceType: z.enum(sourceTypes.map((item) => item.value) as [string, ...string[]]),
  primaryCategory: z.preprocess((value) => value === "" ? null : value, z.enum(sourceCategories.map((item) => item.value) as [string, ...string[]]).nullable()),
  priority: z.coerce.number().int().min(0).max(100),
  feedAvailability: z.nativeEnum(FeedAvailability),
  importFrequencyMinutes: z.coerce.number().int().min(5).max(1440),
  lastCheckedAt: optionalDate,
  lastSuccessfulImportAt: optionalDate,
  notes: optionalText
});

function dateOrNull(value: string | null) {
  return value ? new Date(value) : null;
}

function dataFromForm(formData: FormData) {
  const parsed = sourceSchema.parse(Object.fromEntries(formData.entries()));
  const validCategories = new Set<string>(sourceCategories.map((item) => item.value));
  const categories = formData.getAll("categories").map(String).filter((value) => validCategories.has(value));
  return {
    ...parsed,
    categories,
    active: formData.get("active") === "true",
    lastCheckedAt: dateOrNull(parsed.lastCheckedAt),
    lastSuccessfulImportAt: dateOrNull(parsed.lastSuccessfulImportAt)
  };
}

function refresh() {
  revalidatePath("/admin/sources");
  revalidatePath("/admin/sources/health");
  revalidatePath("/admin");
}

export async function createSource(formData: FormData) {
  await prisma.source.create({ data: dataFromForm(formData) });
  refresh();
  redirect("/admin/sources");
}

export async function updateSource(id: string, formData: FormData) {
  const data = dataFromForm(formData);
  await prisma.source.update({ where: { id }, data });
  refresh();
  redirect("/admin/sources");
}

export async function setSourceActive(id: string, active: boolean) {
  await prisma.source.update({ where: { id }, data: { active } });
  refresh();
}

export async function setSourceNeedsReview(id: string, formData: FormData) {
  const needsReview = formData.get("needsReview") === "true";
  const reviewNote = optionalText.parse(formData.get("reviewNote") ?? undefined);
  await prisma.source.update({ where: { id }, data: { needsReview, reviewNote } });
  refresh();
}

export async function deleteSource(id: string) {
  const [articleCount, intakeItemCount] = await Promise.all([
    prisma.article.count({ where: { sourceId: id } }),
    prisma.intakeItem.count({ where: { sourceId: id } })
  ]);
  if (articleCount > 0 || intakeItemCount > 0) {
    throw new Error("This source has articles or intake history — disable it instead of deleting.");
  }
  await prisma.source.delete({ where: { id } });
  refresh();
}
