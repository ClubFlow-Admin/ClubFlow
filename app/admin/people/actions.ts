"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const optionalText = z.string().optional().transform((value) => value?.trim() || null);
const optionalUrl = z.preprocess((value) => (value === "" ? null : value), z.string().url().nullable());

const personSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  slug: optionalText,
  title: optionalText,
  biography: optionalText,
  photoUrl: optionalUrl,
  linkedInUrl: optionalUrl,
  currentOrganization: optionalText,
  status: z.enum(["active", "inactive"])
});

function dataFromForm(formData: FormData) {
  const parsed = personSchema.parse(Object.fromEntries(formData.entries()));
  return { ...parsed, slug: parsed.slug || slugify(`${parsed.firstName} ${parsed.lastName}`) };
}

function refresh() {
  revalidatePath("/admin/people");
  revalidatePath("/admin");
}

export async function createPerson(formData: FormData) {
  await prisma.person.create({ data: dataFromForm(formData) });
  refresh();
  redirect("/admin/people");
}

export async function updatePerson(id: string, formData: FormData) {
  await prisma.person.update({ where: { id }, data: dataFromForm(formData) });
  refresh();
  redirect("/admin/people");
}

export async function setPersonStatus(id: string, status: "active" | "inactive") {
  await prisma.person.update({ where: { id }, data: { status } });
  refresh();
}

export async function deletePerson(id: string) {
  const record = await prisma.person.findUnique({ where: { id }, select: { _count: { select: { articles: true } } } });
  if (record && record._count.articles > 0) {
    await prisma.person.update({ where: { id }, data: { status: "inactive" } });
  } else {
    await prisma.person.delete({ where: { id } });
  }
  refresh();
}
