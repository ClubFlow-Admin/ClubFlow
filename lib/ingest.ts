import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { summarizeClubStory } from "@/lib/openai";
import { ingestRssFeed } from "@/lib/rss";
import { slugify } from "@/lib/utils";

const AI_UNCONFIGURED_MESSAGE = "OpenAI is not configured. Add OPENAI_API_KEY to generate a ClubFlow summary.";

const categorySlugBySourceCategory: Record<string, string> = {
  industry: "industry-news",
  developments: "developments-renovations",
  technology: "technology",
  "mergers-acquisitions": "mergers-acquisitions",
  "capital-investments": "capital-investments",
  clubopspro: "clubopspro"
};

export type SourceIngestResult = {
  sourceId: string;
  sourceName: string;
  status: "ok" | "skipped" | "error";
  itemsFound: number;
  articlesCreated: number;
  duplicatesSkipped: number;
  aiSummariesGenerated: number;
  error?: string;
};

export type IngestRunSummary = {
  sourcesChecked: number;
  itemsFound: number;
  articlesCreated: number;
  duplicatesSkipped: number;
  aiSummariesGenerated: number;
  sources: SourceIngestResult[];
};

async function uniqueSlug(baseSlug: string) {
  let slug = baseSlug || "story";
  let suffix = 1;
  while (await prisma.article.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function runRssIngestion(): Promise<IngestRunSummary> {
  const sources = await prisma.source.findMany({ where: { active: true, rssUrl: { not: null } } });
  const results: SourceIngestResult[] = [];

  for (const source of sources) {
    const result: SourceIngestResult = {
      sourceId: source.id,
      sourceName: source.name,
      status: "ok",
      itemsFound: 0,
      articlesCreated: 0,
      duplicatesSkipped: 0,
      aiSummariesGenerated: 0
    };

    try {
      const categorySlug = source.primaryCategory ? categorySlugBySourceCategory[source.primaryCategory] : undefined;
      if (!categorySlug) {
        result.status = "skipped";
        result.error = "Source has no article-compatible primary category configured.";
        await prisma.source.update({ where: { id: source.id }, data: { lastCheckedAt: new Date() } });
        results.push(result);
        continue;
      }

      const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!category) {
        result.status = "skipped";
        result.error = `Mapped category "${categorySlug}" does not exist.`;
        await prisma.source.update({ where: { id: source.id }, data: { lastCheckedAt: new Date() } });
        results.push(result);
        continue;
      }

      const items = await ingestRssFeed(source.rssUrl!, source.name);
      result.itemsFound = items.length;

      for (const item of items) {
        const existing = await prisma.article.findUnique({ where: { originalUrl: item.originalUrl } });
        if (existing) {
          result.duplicatesSkipped += 1;
          continue;
        }

        const slug = await uniqueSlug(slugify(item.title));
        const fallbackSummary = item.excerpt?.trim() || item.title;
        let aiSummary = fallbackSummary;
        let status: ArticleStatus = ArticleStatus.draft;

        try {
          const generated = await summarizeClubStory({ title: item.title, excerpt: item.excerpt, source: source.name });
          const trimmed = generated?.trim();
          if (trimmed && trimmed !== AI_UNCONFIGURED_MESSAGE) {
            aiSummary = trimmed;
            status = ArticleStatus.reviewed;
            result.aiSummariesGenerated += 1;
          }
        } catch (aiError) {
          console.error(`[ingest] AI summary failed for ${item.originalUrl}:`, aiError);
        }

        await prisma.article.create({
          data: {
            title: item.title,
            slug,
            originalUrl: item.originalUrl,
            publishedAt: item.publishedAt ?? new Date(),
            originalExcerpt: item.excerpt ?? null,
            aiSummary,
            status,
            sourceId: source.id,
            categoryId: category.id
          }
        });

        result.articlesCreated += 1;
      }

      await prisma.source.update({
        where: { id: source.id },
        data: {
          lastCheckedAt: new Date(),
          ...(result.articlesCreated > 0 ? { lastSuccessfulImportAt: new Date() } : {})
        }
      });
    } catch (error) {
      result.status = "error";
      result.error = error instanceof Error ? error.message : "Unknown ingestion error.";
      console.error(`[ingest] Source "${source.name}" failed:`, error);
      try {
        await prisma.source.update({ where: { id: source.id }, data: { lastCheckedAt: new Date() } });
      } catch (updateError) {
        console.error(`[ingest] Failed to record lastCheckedAt for "${source.name}":`, updateError);
      }
    }

    results.push(result);
  }

  return {
    sourcesChecked: results.length,
    itemsFound: results.reduce((sum, item) => sum + item.itemsFound, 0),
    articlesCreated: results.reduce((sum, item) => sum + item.articlesCreated, 0),
    duplicatesSkipped: results.reduce((sum, item) => sum + item.duplicatesSkipped, 0),
    aiSummariesGenerated: results.reduce((sum, item) => sum + item.aiSummariesGenerated, 0),
    sources: results
  };
}
