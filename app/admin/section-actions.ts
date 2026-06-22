"use server";

import { ArticleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminSection } from "@/lib/admin-sections";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const optional = z.string().optional().transform((value) => value?.trim() || null);
const status = z.nativeEnum(ArticleStatus);
const articleSchema = z.object({
  title: z.string().min(3), dek: optional, originalUrl: z.string().url(), sourceId: z.string().min(1), author: optional,
  publishedAt: z.string().min(1), tags: z.string().optional(), clubName: optional, city: optional, state: optional,
  originalExcerpt: optional, aiSummary: z.string().min(10), aiWhatHappened: optional, aiWhyItMatters: optional,
  aiIndustryContext: optional, importanceScore: z.coerce.number().int().min(0).max(100),
  status, heroImageId: optional
});

function entityRelationsFromForm(formData: FormData) {
  return {
    clubs: formData.getAll("clubIds").map(String),
    companies: formData.getAll("companyIds").map(String),
    people: formData.getAll("personIds").map(String)
  };
}
const jobSchema = z.object({ title: z.string().min(2), clubName: z.string().min(2), city: optional, state: optional, url: optional, postedAt: z.string().min(1), expiresAt: optional, description: optional, status });
const moveSchema = z.object({ executive: z.string().min(2), newRole: z.string().min(2), previousRole: optional, clubName: z.string().min(2), city: optional, state: optional, effectiveAt: optional, publishedAt: z.string().min(1), notes: optional, status });
const rankingSchema = z.object({ category: z.string().min(2), rank: z.coerce.number().int().positive(), clubName: z.string().min(2), city: optional, state: optional, score: z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().min(0).max(100).nullable()), rationale: z.string().min(10), publishedAt: z.string().min(1), status });
const podcastSchema = z.object({ showName: z.string().min(2), title: z.string().min(2), description: z.string().min(10), duration: optional, publishedAt: optional, audioUrl: optional, status });

function sectionOrThrow(sectionSlug: string) {
  const section = getAdminSection(sectionSlug);
  if (!section) throw new Error("Unknown admin section.");
  return section;
}

function dateOrNull(value: string | null) { return value ? new Date(value) : null; }
function refresh(sectionSlug: string, publicHref: string) {
  revalidatePath("/"); revalidatePath(publicHref); revalidatePath(`/admin/${sectionSlug}`); revalidatePath("/admin");
}

type ArticleSection = Extract<ReturnType<typeof sectionOrThrow>, { kind: "article" }>;

async function createArticle(section: ArticleSection, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = articleSchema.parse(raw);
  const category = await prisma.category.findUnique({ where: { slug: section.categorySlug } });
  if (!category) throw new Error(`Missing locked category: ${section.categorySlug}`);
  const aiKeyTakeaways = formData.getAll("aiKeyTakeaways").map(String).map((item) => item.trim()).filter(Boolean);
  const entities = entityRelationsFromForm(formData);
  return prisma.article.create({
    data: {
      ...parsed,
      slug: slugify(parsed.title),
      publishedAt: new Date(parsed.publishedAt),
      tags: parsed.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
      categoryId: category.id,
      aiKeyTakeaways,
      clubs: entities.clubs.length ? { connect: entities.clubs.map((id) => ({ id })) } : undefined,
      companies: entities.companies.length ? { connect: entities.companies.map((id) => ({ id })) } : undefined,
      people: entities.people.length ? { connect: entities.people.map((id) => ({ id })) } : undefined
    }
  });
}

async function updateArticle(section: ArticleSection, id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = articleSchema.parse(raw);
  const category = await prisma.category.findUnique({ where: { slug: section.categorySlug } });
  if (!category) throw new Error(`Missing locked category: ${section.categorySlug}`);
  const aiKeyTakeaways = formData.getAll("aiKeyTakeaways").map(String).map((item) => item.trim()).filter(Boolean);
  const entities = entityRelationsFromForm(formData);
  return prisma.article.update({
    where: { id },
    data: {
      ...parsed,
      slug: slugify(parsed.title),
      publishedAt: new Date(parsed.publishedAt),
      tags: parsed.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
      categoryId: category.id,
      aiKeyTakeaways,
      clubs: { set: entities.clubs.map((entityId) => ({ id: entityId })) },
      companies: { set: entities.companies.map((entityId) => ({ id: entityId })) },
      people: { set: entities.people.map((entityId) => ({ id: entityId })) }
    }
  });
}

export async function createSectionContent(sectionSlug: string, formData: FormData) {
  const section = sectionOrThrow(sectionSlug);
  const raw = Object.fromEntries(formData.entries());
  if (section.kind === "article") {
    await createArticle(section, formData);
  } else if (section.kind === "job") {
    const parsed = jobSchema.parse(raw);
    await prisma.jobPosting.create({ data: { ...parsed, postedAt: new Date(parsed.postedAt), expiresAt: dateOrNull(parsed.expiresAt) } });
  } else if (section.kind === "executiveMove") {
    const parsed = moveSchema.parse(raw);
    await prisma.executiveMove.create({ data: { ...parsed, effectiveAt: dateOrNull(parsed.effectiveAt), publishedAt: new Date(parsed.publishedAt) } });
  } else if (section.kind === "ranking") {
    const parsed = rankingSchema.parse(raw); await prisma.rankingEntry.create({ data: { ...parsed, publishedAt: new Date(parsed.publishedAt) } });
  } else {
    const parsed = podcastSchema.parse(raw);
    await prisma.podcastEpisode.create({ data: { ...parsed, publishedAt: dateOrNull(parsed.publishedAt), comingSoon: formData.get("comingSoon") === "true" } });
  }
  refresh(sectionSlug, section.publicHref);
  redirect(`/admin/${sectionSlug}`);
}

/** Same as createSectionContent, but stays in the editor (article sections only) instead of returning to the list. */
export async function createSectionContentAndContinue(sectionSlug: string, formData: FormData) {
  const section = sectionOrThrow(sectionSlug);
  if (section.kind !== "article") throw new Error("Save & continue is only supported for article sections.");
  const created = await createArticle(section, formData);
  refresh(sectionSlug, section.publicHref);
  redirect(`/admin/${sectionSlug}/${created.id}/edit?saved=1`);
}

export async function updateSectionContent(sectionSlug: string, id: string, formData: FormData) {
  const section = sectionOrThrow(sectionSlug);
  const raw = Object.fromEntries(formData.entries());
  if (section.kind === "article") {
    await updateArticle(section, id, formData);
  } else if (section.kind === "job") {
    const parsed = jobSchema.parse(raw);
    await prisma.jobPosting.update({ where: { id }, data: { ...parsed, postedAt: new Date(parsed.postedAt), expiresAt: dateOrNull(parsed.expiresAt) } });
  } else if (section.kind === "executiveMove") {
    const parsed = moveSchema.parse(raw);
    await prisma.executiveMove.update({ where: { id }, data: { ...parsed, effectiveAt: dateOrNull(parsed.effectiveAt), publishedAt: new Date(parsed.publishedAt) } });
  } else if (section.kind === "ranking") {
    const parsed = rankingSchema.parse(raw); await prisma.rankingEntry.update({ where: { id }, data: { ...parsed, publishedAt: new Date(parsed.publishedAt) } });
  } else {
    const parsed = podcastSchema.parse(raw);
    await prisma.podcastEpisode.update({ where: { id }, data: { ...parsed, publishedAt: dateOrNull(parsed.publishedAt), comingSoon: formData.get("comingSoon") === "true" } });
  }
  refresh(sectionSlug, section.publicHref);
  redirect(`/admin/${sectionSlug}`);
}

/** Same as updateSectionContent, but stays in the editor (article sections only) instead of returning to the list. */
export async function updateSectionContentAndContinue(sectionSlug: string, id: string, formData: FormData) {
  const section = sectionOrThrow(sectionSlug);
  if (section.kind !== "article") throw new Error("Save & continue is only supported for article sections.");
  await updateArticle(section, id, formData);
  refresh(sectionSlug, section.publicHref);
  redirect(`/admin/${sectionSlug}/${id}/edit?saved=1`);
}

export async function deleteSectionContent(sectionSlug: string, id: string) {
  const section = sectionOrThrow(sectionSlug);
  if (section.kind === "article") await prisma.article.delete({ where: { id } });
  else if (section.kind === "job") await prisma.jobPosting.delete({ where: { id } });
  else if (section.kind === "executiveMove") await prisma.executiveMove.delete({ where: { id } });
  else if (section.kind === "ranking") await prisma.rankingEntry.delete({ where: { id } });
  else await prisma.podcastEpisode.delete({ where: { id } });
  refresh(sectionSlug, section.publicHref);
}

export async function setSectionContentStatus(sectionSlug: string, id: string, nextStatus: ArticleStatus) {
  const section = sectionOrThrow(sectionSlug);
  const parsedStatus = status.parse(nextStatus);
  if (section.kind === "article") await prisma.article.update({ where: { id }, data: { status: parsedStatus } });
  else if (section.kind === "job") await prisma.jobPosting.update({ where: { id }, data: { status: parsedStatus } });
  else if (section.kind === "executiveMove") await prisma.executiveMove.update({ where: { id }, data: { status: parsedStatus } });
  else if (section.kind === "ranking") await prisma.rankingEntry.update({ where: { id }, data: { status: parsedStatus } });
  else await prisma.podcastEpisode.update({ where: { id }, data: { status: parsedStatus } });
  refresh(sectionSlug, section.publicHref);
}
