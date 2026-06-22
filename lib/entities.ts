import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const ARTICLE_SELECT = {
  id: true,
  title: true,
  slug: true,
  dek: true,
  aiSummary: true,
  publishedAt: true,
  category: { select: { name: true, slug: true } }
} as const;

const MOVE_SELECT = {
  id: true,
  executive: true,
  newRole: true,
  previousRole: true,
  clubName: true,
  effectiveAt: true,
  publishedAt: true,
  article: { select: { slug: true } }
} as const;

const PROJECT_SELECT = {
  id: true,
  clubName: true,
  projectName: true,
  budget: true,
  timeline: true,
  status: true,
  createdAt: true,
  article: { select: { slug: true } }
} as const;

export type EntityArticle = Prisma.ArticleGetPayload<{ select: typeof ARTICLE_SELECT }>;
export type EntityExecutiveMove = Prisma.ExecutiveMoveGetPayload<{ select: typeof MOVE_SELECT }>;
export type EntityDevelopmentProject = Prisma.DevelopmentProjectGetPayload<{ select: typeof PROJECT_SELECT }>;

export type TimelineEntry = { date: Date; label: string; detail: string; href: string | null };

function byCategorySlug<T extends { category: { slug: string } }>(articles: T[], slug: string) {
  return articles.filter((article) => article.category.slug === slug);
}

/** Builds a chronological timeline from an entity's tagged articles, executive moves, and development projects. */
export function buildEntityTimeline(articles: EntityArticle[], moves: EntityExecutiveMove[], projects: EntityDevelopmentProject[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...articles.map((article) => ({
      date: article.publishedAt,
      label: article.category.name,
      detail: article.title,
      href: `/articles/${article.slug}`
    })),
    ...moves.map((move) => ({
      date: move.effectiveAt ?? move.publishedAt ?? new Date(0),
      label: "Executive Move",
      detail: `${move.executive} — ${move.newRole}`,
      href: move.article ? `/articles/${move.article.slug}` : null
    })),
    ...projects.map((project) => ({
      date: project.createdAt,
      label: "Capital Project",
      detail: project.projectName,
      href: project.article ? `/articles/${project.article.slug}` : null
    }))
  ];

  return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getClubBySlug(slug: string) {
  const club = await prisma.club.findUnique({ where: { slug } });
  if (!club) return null;

  const [articles, moves, projects] = await Promise.all([
    prisma.article.findMany({ where: { status: "published", clubs: { some: { id: club.id } } }, select: ARTICLE_SELECT, orderBy: { publishedAt: "desc" } }),
    prisma.executiveMove.findMany({ where: { status: "published", article: { clubs: { some: { id: club.id } } } }, select: MOVE_SELECT, orderBy: { effectiveAt: "desc" } }),
    prisma.developmentProject.findMany({ where: { article: { clubs: { some: { id: club.id } } } }, select: PROJECT_SELECT, orderBy: { createdAt: "desc" } })
  ]);

  return {
    entity: club,
    articles,
    moves,
    projects,
    technology: byCategorySlug(articles, "technology"),
    deals: byCategorySlug(articles, "mergers-acquisitions"),
    timeline: buildEntityTimeline(articles, moves, projects)
  };
}

export async function getCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) return null;

  const [articles, moves, projects] = await Promise.all([
    prisma.article.findMany({ where: { status: "published", companies: { some: { id: company.id } } }, select: ARTICLE_SELECT, orderBy: { publishedAt: "desc" } }),
    prisma.executiveMove.findMany({ where: { status: "published", article: { companies: { some: { id: company.id } } } }, select: MOVE_SELECT, orderBy: { effectiveAt: "desc" } }),
    prisma.developmentProject.findMany({ where: { article: { companies: { some: { id: company.id } } } }, select: PROJECT_SELECT, orderBy: { createdAt: "desc" } })
  ]);

  return {
    entity: company,
    articles,
    moves,
    projects,
    technology: byCategorySlug(articles, "technology"),
    deals: byCategorySlug(articles, "mergers-acquisitions"),
    timeline: buildEntityTimeline(articles, moves, projects)
  };
}

export async function getPersonBySlug(slug: string) {
  const person = await prisma.person.findUnique({ where: { slug } });
  if (!person) return null;

  const [articles, moves, projects] = await Promise.all([
    prisma.article.findMany({ where: { status: "published", people: { some: { id: person.id } } }, select: ARTICLE_SELECT, orderBy: { publishedAt: "desc" } }),
    prisma.executiveMove.findMany({ where: { status: "published", article: { people: { some: { id: person.id } } } }, select: MOVE_SELECT, orderBy: { effectiveAt: "desc" } }),
    prisma.developmentProject.findMany({ where: { article: { people: { some: { id: person.id } } } }, select: PROJECT_SELECT, orderBy: { createdAt: "desc" } })
  ]);

  return {
    entity: person,
    articles,
    moves,
    projects,
    technology: byCategorySlug(articles, "technology"),
    deals: byCategorySlug(articles, "mergers-acquisitions"),
    timeline: buildEntityTimeline(articles, moves, projects)
  };
}

/** Canonical company route prefix, based on the existing industry taxonomy — no schema change needed. */
export function companyRoutePrefix(industry: string | null) {
  if (industry === "technology-vendor") return "/vendors";
  if (industry === "architecture-design") return "/architects";
  return "/companies";
}
