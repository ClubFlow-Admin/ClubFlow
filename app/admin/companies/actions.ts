"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const optionalText = z.string().optional().transform((value) => value?.trim() || null);
const optionalUrl = z.preprocess((value) => (value === "" ? null : value), z.string().url().nullable());

const companySchema = z.object({
  name: z.string().trim().min(2),
  slug: optionalText,
  industry: optionalText,
  website: optionalUrl,
  logoUrl: optionalUrl,
  description: optionalText,
  headquarters: optionalText,
  status: z.enum(["active", "inactive"])
});

function dataFromForm(formData: FormData) {
  const parsed = companySchema.parse(Object.fromEntries(formData.entries()));
  return { ...parsed, slug: parsed.slug || slugify(parsed.name) };
}

function refresh() {
  revalidatePath("/admin/companies");
  revalidatePath("/admin");
}

export async function createCompany(formData: FormData) {
  await prisma.company.create({ data: dataFromForm(formData) });
  refresh();
  redirect("/admin/companies");
}

export async function updateCompany(id: string, formData: FormData) {
  await prisma.company.update({ where: { id }, data: dataFromForm(formData) });
  refresh();
  redirect("/admin/companies");
}

export async function setCompanyStatus(id: string, status: "active" | "inactive") {
  await prisma.company.update({ where: { id }, data: { status } });
  refresh();
}

export async function deleteCompany(id: string) {
  const record = await prisma.company.findUnique({ where: { id }, select: { _count: { select: { articles: true } } } });
  if (record && record._count.articles > 0) {
    await prisma.company.update({ where: { id }, data: { status: "inactive" } });
  } else {
    await prisma.company.delete({ where: { id } });
  }
  refresh();
}
