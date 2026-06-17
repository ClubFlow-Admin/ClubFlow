"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const sourceSchema = z.object({
  name: z.string().min(2),
  homepageUrl: z.string().url().optional().or(z.literal("")),
  rssUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional()
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional()
});

const mediaSchema = z.object({
  title: z.string().min(2),
  url: z.string().min(1),
  altText: z.string().optional(),
  caption: z.string().optional(),
  credit: z.string().optional(),
  category: z.string().optional()
});

const subscriberSchema = z.object({
  email: z.string().email(),
  frequency: z.enum(["daily", "weekly"]).default("weekly"),
  active: z.coerce.boolean().default(true)
});

function emptyToNull(value?: string) {
  return value?.trim() ? value.trim() : null;
}

export async function createSource(formData: FormData) {
  const parsed = sourceSchema.parse(Object.fromEntries(formData.entries()));

  await prisma.source.create({
    data: {
      name: parsed.name.trim(),
      homepageUrl: emptyToNull(parsed.homepageUrl),
      rssUrl: emptyToNull(parsed.rssUrl),
      notes: emptyToNull(parsed.notes)
    }
  });

  revalidatePath("/admin/backend");
}

export async function createCategory(formData: FormData) {
  const parsed = categorySchema.parse(Object.fromEntries(formData.entries()));
  const slug = parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.name);

  await prisma.category.create({
    data: {
      name: parsed.name.trim(),
      slug,
      description: emptyToNull(parsed.description)
    }
  });

  revalidatePath("/admin/backend");
}

export async function createMediaAsset(formData: FormData) {
  const parsed = mediaSchema.parse(Object.fromEntries(formData.entries()));

  await prisma.mediaAsset.create({
    data: {
      title: parsed.title.trim(),
      url: parsed.url.trim(),
      altText: emptyToNull(parsed.altText),
      caption: emptyToNull(parsed.caption),
      credit: emptyToNull(parsed.credit),
      category: emptyToNull(parsed.category)
    }
  });

  revalidatePath("/admin/backend");
  revalidatePath("/admin/articles/new");
}

export async function createSubscriber(formData: FormData) {
  const parsed = subscriberSchema.parse(Object.fromEntries(formData.entries()));

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.email.toLowerCase() },
    update: {
      frequency: parsed.frequency,
      active: parsed.active
    },
    create: {
      email: parsed.email.toLowerCase(),
      frequency: parsed.frequency,
      active: parsed.active
    }
  });

  revalidatePath("/admin/backend");
}

export async function deleteSource(id: string) {
  await prisma.source.delete({ where: { id } });
  revalidatePath("/admin/backend");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/backend");
}

export async function deleteMediaAsset(id: string) {
  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/backend");
}
