"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sourceCategories, sourceTypes } from "@/lib/source-options";

const optionalText = z.string().optional().transform((value) => value?.trim() || null);
const optionalUrl = z.preprocess((value) => value === "" ? null : value, z.string().url().nullable());
const optionalDate = z.preprocess((value) => value === "" ? null : value, z.string().nullable());
const sourceSchema = z.object({
  name: z.string().trim().min(2),
  homepageUrl: optionalUrl,
  rssUrl: optionalUrl,
  sourceType: z.enum(sourceTypes.map((item) => item.value) as [string, ...string[]]),
  primaryCategory: z.preprocess((value) => value === "" ? null : value, z.enum(sourceCategories.map((item) => item.value) as [string, ...string[]]).nullable()),
  priority: z.coerce.number().int().min(0).max(100),
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
