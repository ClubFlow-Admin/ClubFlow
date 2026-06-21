"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const optionalText = z.string().optional().transform((value) => value?.trim() || null);
const optionalUrl = z.preprocess((value) => (value === "" ? null : value), z.string().url().nullable());
const optionalInt = z.preprocess((value) => (value === "" || value === undefined ? null : value), z.coerce.number().int().nullable());

const clubSchema = z.object({
  name: z.string().trim().min(2),
  slug: optionalText,
  location: optionalText,
  city: optionalText,
  state: optionalText,
  country: optionalText,
  clubType: optionalText,
  website: optionalUrl,
  logoUrl: optionalUrl,
  description: optionalText,
  foundedYear: optionalInt,
  holes: optionalInt,
  status: z.enum(["active", "inactive"])
});

function dataFromForm(formData: FormData) {
  const parsed = clubSchema.parse(Object.fromEntries(formData.entries()));
  return { ...parsed, slug: parsed.slug || slugify(parsed.name) };
}

function refresh() {
  revalidatePath("/admin/clubs");
  revalidatePath("/admin");
}

export async function createClub(formData: FormData) {
  await prisma.club.create({ data: dataFromForm(formData) });
  refresh();
  redirect("/admin/clubs");
}

export async function updateClub(id: string, formData: FormData) {
  await prisma.club.update({ where: { id }, data: dataFromForm(formData) });
  refresh();
  redirect("/admin/clubs");
}

export async function setClubStatus(id: string, status: "active" | "inactive") {
  await prisma.club.update({ where: { id }, data: { status } });
  refresh();
}

export async function deleteClub(id: string) {
  const articleCount = await prisma.club.findUnique({ where: { id }, select: { _count: { select: { articles: true } } } });
  if (articleCount && articleCount._count.articles > 0) {
    await prisma.club.update({ where: { id }, data: { status: "inactive" } });
  } else {
    await prisma.club.delete({ where: { id } });
  }
  refresh();
}
