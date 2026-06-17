import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: { category: true; source: true; heroImage: true };
}>;

export type ArticleFilters = {
  category?: string;
  query?: string;
  source?: string;
  clubName?: string;
  location?: string;
  from?: string;
  to?: string;
  status?: ArticleStatus;
};

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getSources() {
  return prisma.source.findMany({ orderBy: { name: "asc" } });
}

export async function getArticles(filters: ArticleFilters = {}) {
  const where: Prisma.ArticleWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.source) {
    where.source = { name: { contains: filters.source, mode: "insensitive" } };
  }

  if (filters.clubName) {
    where.clubName = { contains: filters.clubName, mode: "insensitive" };
  }

  if (filters.location) {
    where.OR = [
      { city: { contains: filters.location, mode: "insensitive" } },
      { state: { contains: filters.location, mode: "insensitive" } }
    ];
  }

  if (filters.query) {
    const search = filters.query;
    where.OR = [
      ...(Array.isArray(where.OR) ? where.OR : []),
      { title: { contains: search, mode: "insensitive" } },
      { aiSummary: { contains: search, mode: "insensitive" } },
      { originalExcerpt: { contains: search, mode: "insensitive" } },
      { clubName: { contains: search, mode: "insensitive" } },
      { tags: { has: search } }
    ];
  }

  if (filters.from || filters.to) {
    where.publishedAt = {};
    if (filters.from) where.publishedAt.gte = new Date(filters.from);
    if (filters.to) where.publishedAt.lte = new Date(filters.to);
  }

  return prisma.article.findMany({
    where,
    include: { category: true, source: true, heroImage: true },
    orderBy: [{ importanceScore: "desc" }, { publishedAt: "desc" }]
  });
}

export async function getPublishedArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "published" },
    include: { category: true, source: true, heroImage: true }
  });
}
