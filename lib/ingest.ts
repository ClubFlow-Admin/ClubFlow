import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateEditorialBrief, type EditorialBrief } from "@/lib/openai";
import { ingestRssFeed } from "@/lib/rss";
import { slugify } from "@/lib/utils";

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
  entitiesLinked: number;
  error?: string;
};

export type IngestRunSummary = {
  sourcesChecked: number;
  itemsFound: number;
  articlesCreated: number;
  duplicatesSkipped: number;
  aiSummariesGenerated: number;
  entitiesLinked: number;
  sources: SourceIngestResult[];
};

type EntityIndex = {
  clubs: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  people: { id: string; firstName: string; lastName: string }[];
};

async function loadEntityIndex(): Promise<EntityIndex> {
  const [clubs, companies, people] = await Promise.all([
    prisma.club.findMany({ select: { id: true, name: true } }),
    prisma.company.findMany({ select: { id: true, name: true } }),
    prisma.person.findMany({ select: { id: true, firstName: true, lastName: true } })
  ]);
  return { clubs, companies, people };
}

function matchEntityIds(candidates: EditorialBrief["entities"], index: EntityIndex) {
  const normalize = (value: string) => value.trim().toLowerCase();

  const clubNames = new Set(candidates.clubs.map(normalize));
  const companyNames = new Set(candidates.companies.map(normalize));
  const peopleNames = new Set(candidates.people.map(normalize));

  const clubIds = index.clubs.filter((club) => clubNames.has(normalize(club.name))).map((club) => club.id);
  const companyIds = index.companies.filter((company) => companyNames.has(normalize(company.name))).map((company) => company.id);
  const personIds = index.people
    .filter((person) => peopleNames.has(normalize(`${person.firstName} ${person.lastName}`)))
    .map((person) => person.id);

  return { clubIds, companyIds, personIds };
}

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
  const entityIndex = await loadEntityIndex();
  const results: SourceIngestResult[] = [];

  for (const source of sources) {
    const result: SourceIngestResult = {
      sourceId: source.id,
      sourceName: source.name,
      status: "ok",
      itemsFound: 0,
      articlesCreated: 0,
      duplicatesSkipped: 0,
      aiSummariesGenerated: 0,
      entitiesLinked: 0
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

        let dek: string | null = null;
        let aiSummary = fallbackSummary;
        let aiWhatHappened: string | null = null;
        let aiWhyItMatters: string | null = null;
        let aiKeyTakeaways: string[] = [];
        let aiIndustryContext: string | null = null;
        let city: string | null = null;
        let state: string | null = null;
        let status: ArticleStatus = ArticleStatus.draft;
        let clubIds: string[] = [];
        let companyIds: string[] = [];
        let personIds: string[] = [];

        // AI processing never throws (generateEditorialBrief returns null on any
        // failure), but the surrounding try/catch is defense-in-depth so a bad
        // entity match or unexpected error here still can't fail the whole import.
        try {
          const brief = await generateEditorialBrief({ title: item.title, excerpt: item.excerpt, source: source.name });
          if (brief) {
            dek = brief.dek || null;
            aiSummary = brief.executiveSummary || fallbackSummary;
            aiWhatHappened = brief.whatHappened || null;
            aiWhyItMatters = brief.whyItMatters || null;
            aiKeyTakeaways = brief.keyTakeaways;
            aiIndustryContext = brief.industryContext || null;
            city = brief.location.city || null;
            state = brief.location.state || null;
            status = ArticleStatus.reviewed;
            result.aiSummariesGenerated += 1;

            const matched = matchEntityIds(brief.entities, entityIndex);
            clubIds = matched.clubIds;
            companyIds = matched.companyIds;
            personIds = matched.personIds;
            if (clubIds.length || companyIds.length || personIds.length) {
              result.entitiesLinked += 1;
            }
          }
        } catch (aiError) {
          console.error(`[ingest] AI processing failed for ${item.originalUrl}:`, aiError);
        }

        await prisma.article.create({
          data: {
            title: item.title,
            dek,
            slug,
            originalUrl: item.originalUrl,
            publishedAt: item.publishedAt ?? new Date(),
            originalExcerpt: item.excerpt ?? null,
            aiSummary,
            aiWhatHappened,
            aiWhyItMatters,
            aiKeyTakeaways,
            aiIndustryContext,
            city,
            state,
            status,
            sourceId: source.id,
            categoryId: category.id,
            clubs: clubIds.length ? { connect: clubIds.map((id) => ({ id })) } : undefined,
            companies: companyIds.length ? { connect: companyIds.map((id) => ({ id })) } : undefined,
            people: personIds.length ? { connect: personIds.map((id) => ({ id })) } : undefined
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
    entitiesLinked: results.reduce((sum, item) => sum + item.entitiesLinked, 0),
    sources: results
  };
}
