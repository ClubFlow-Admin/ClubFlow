import { prisma } from "@/lib/prisma";
import { generateEditorialBrief, type EditorialBrief } from "@/lib/openai";
import { ingestRssFeed, type IngestedFeedItem } from "@/lib/rss";
import { fetchViaGoogleNews } from "@/lib/google-news-fetcher";
import { estimateImportance } from "@/lib/importance-scoring";
import { detectDuplicate, type DuplicateCandidate } from "@/lib/duplicate-detection";
import type { Source } from "@prisma/client";

/**
 * Maps a Source's editorial `primaryCategory` to the public Category slug an approved
 * Article would land under. Only categories with a real public article section are
 * listed — sources covering executive-moves/jobs/club-rankings/podcasts are intentionally
 * excluded since those are structured content types, not Article rows (see admin-sections.ts).
 */
export const categorySlugBySourceCategory: Record<string, string> = {
  industry: "industry-news",
  developments: "developments-renovations",
  technology: "technology",
  "mergers-acquisitions": "mergers-acquisitions",
  "capital-investments": "capital-investments",
  clubopspro: "clubopspro"
};

type RawIntakeCandidate = IngestedFeedItem & { originalPublisherName?: string };

type SourceFetcher = (source: Source) => Promise<RawIntakeCandidate[]>;

async function fetchViaRss(source: Source): Promise<RawIntakeCandidate[]> {
  if (!source.rssUrl) return [];
  return ingestRssFeed(source.rssUrl, source.name);
}

/**
 * Registry of fetchers keyed by Source.sourceType. To support a new source type later
 * (LinkedIn company pages, government planning documents, club websites, email tips, PDF
 * press releases, etc.), implement a SourceFetcher and add one line here — runIntake()
 * and everything downstream (dedup, suggestions, the queue UI) needs no changes.
 */
const fetchersByType: Partial<Record<string, SourceFetcher>> = {
  "trade-publication": fetchViaRss,
  association: fetchViaRss,
  "club-resort-website": fetchViaRss,
  "real-estate-development": fetchViaRss,
  jobs: fetchViaRss,
  "press-release": fetchViaRss,
  "technology-vendor": fetchViaRss,
  "podcast-media": fetchViaRss,
  other: fetchViaRss,
  // Tier-3 fallback (see lib/google-news-fetcher.ts) — used only when a source has no
  // first-party feed. Swapping a source back to a real feed just means changing its
  // sourceType/rssUrl; no code change needed here.
  "google-news-fallback": fetchViaGoogleNews
  // "newsroom-feed" and "website-feed" intentionally have no fetcher yet — runIntake()
  // skips them with a clear "fetcher not implemented" result instead of erroring.
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

function matchEntityNames(candidates: EditorialBrief["entities"], index: EntityIndex) {
  const normalize = (value: string) => value.trim().toLowerCase();

  const clubNames = new Set(candidates.clubs.map(normalize));
  const companyNames = new Set(candidates.companies.map(normalize));
  const peopleNames = new Set(candidates.people.map(normalize));

  const matchedClubs = index.clubs.filter((club) => clubNames.has(normalize(club.name))).map((club) => club.name);
  const matchedCompanies = index.companies
    .filter((company) => companyNames.has(normalize(company.name)))
    .map((company) => company.name);
  const matchedPeople = index.people
    .filter((person) => peopleNames.has(normalize(`${person.firstName} ${person.lastName}`)))
    .map((person) => `${person.firstName} ${person.lastName}`);

  return [...matchedClubs, ...matchedCompanies, ...matchedPeople];
}

async function findSuggestedHeroImageUrl(categorySlug: string | undefined): Promise<string | null> {
  if (!categorySlug) return null;
  const asset = await prisma.mediaAsset.findFirst({ where: { category: categorySlug }, orderBy: { createdAt: "desc" } });
  return asset?.url ?? null;
}

export type SourceIntakeResult = {
  sourceId: string;
  sourceName: string;
  status: "ok" | "skipped" | "error";
  itemsFound: number;
  itemsCreated: number;
  duplicatesSkipped: number;
  error?: string;
};

export type IntakeRunSummary = {
  sourcesChecked: number;
  itemsFound: number;
  itemsCreated: number;
  duplicatesSkipped: number;
  sources: SourceIntakeResult[];
};

async function runIntakeForSource(source: Source, entityIndex: EntityIndex): Promise<SourceIntakeResult> {
  const result: SourceIntakeResult = {
    sourceId: source.id,
    sourceName: source.name,
    status: "ok",
    itemsFound: 0,
    itemsCreated: 0,
    duplicatesSkipped: 0
  };

  const startedAt = new Date();

  try {
    const fetcher = fetchersByType[source.sourceType];
    if (!fetcher || source.feedAvailability !== "available" || !source.rssUrl) {
      result.status = "skipped";
      result.error = !fetcher
        ? `No fetcher implemented yet for source type "${source.sourceType}".`
        : "Source has no available feed configured.";
      await prisma.source.update({ where: { id: source.id }, data: { lastCheckedAt: new Date() } });
      await prisma.importRun.create({
        data: {
          sourceId: source.id,
          startedAt,
          finishedAt: new Date(),
          status: "ok",
          itemsFound: 0,
          itemsCreated: 0,
          duplicatesSkipped: 0,
          errorMessage: result.error
        }
      });
      return result;
    }

    const items = await fetcher(source);
    result.itemsFound = items.length;

    const recentCandidates = await loadRecentDuplicateCandidates(source.id);

    for (const item of items) {
      const existingArticle = await prisma.article.findUnique({ where: { originalUrl: item.originalUrl } });
      const existingIntakeItem = await prisma.intakeItem.findUnique({ where: { originalUrl: item.originalUrl } });
      if (existingArticle || existingIntakeItem) {
        result.duplicatesSkipped += 1;
        continue;
      }

      const publishedAt = item.publishedAt ?? new Date();
      const fallbackSummary = item.excerpt?.trim() || item.title;

      let executiveSummary = fallbackSummary;
      let matchedEntityNames: string[] = [];

      try {
        const brief = await generateEditorialBrief({ title: item.title, excerpt: item.excerpt, source: source.name });
        if (brief) {
          executiveSummary = brief.executiveSummary || fallbackSummary;
          matchedEntityNames = matchEntityNames(brief.entities, entityIndex);
        }
      } catch (aiError) {
        console.error(`[intake] AI processing failed for ${item.originalUrl}:`, aiError);
      }

      const suggestedCategorySlug = source.primaryCategory ? categorySlugBySourceCategory[source.primaryCategory] : undefined;
      const suggestedImportance = estimateImportance({
        sourcePriority: source.priority,
        title: item.title,
        excerpt: item.excerpt,
        entityMatchCount: matchedEntityNames.length
      });
      const suggestedHeroImageUrl = await findSuggestedHeroImageUrl(suggestedCategorySlug);

      const duplicateMatch = detectDuplicate(
        { title: item.title, originalUrl: item.originalUrl, publishedAt, sourceId: source.id },
        recentCandidates
      );

      await prisma.intakeItem.create({
        data: {
          sourceId: source.id,
          originalUrl: item.originalUrl,
          title: item.title,
          publishedAt,
          rawExcerpt: item.excerpt ?? null,
          originalPublisherName: item.originalPublisherName ?? null,
          suggestedCategorySlug,
          suggestedTags: matchedEntityNames,
          suggestedImportance,
          executiveSummary,
          suggestedHeroImageUrl,
          duplicateConfidence: duplicateMatch?.confidence ?? 0,
          duplicateOfArticleId: duplicateMatch?.candidateId.startsWith("article:")
            ? duplicateMatch.candidateId.slice("article:".length)
            : null,
          duplicateOfIntakeItemId: duplicateMatch?.candidateId.startsWith("intake:")
            ? duplicateMatch.candidateId.slice("intake:".length)
            : null
        }
      });

      result.itemsCreated += 1;
    }

    await prisma.source.update({
      where: { id: source.id },
      data: {
        lastCheckedAt: new Date(),
        ...(result.itemsCreated > 0 ? { lastSuccessfulImportAt: new Date() } : {})
      }
    });

    await prisma.importRun.create({
      data: {
        sourceId: source.id,
        startedAt,
        finishedAt: new Date(),
        status: "ok",
        itemsFound: result.itemsFound,
        itemsCreated: result.itemsCreated,
        duplicatesSkipped: result.duplicatesSkipped
      }
    });
  } catch (error) {
    result.status = "error";
    result.error = error instanceof Error ? error.message : "Unknown intake error.";
    console.error(`[intake] Source "${source.name}" failed:`, error);
    try {
      await prisma.source.update({ where: { id: source.id }, data: { lastCheckedAt: new Date() } });
      await prisma.importRun.create({
        data: {
          sourceId: source.id,
          startedAt,
          finishedAt: new Date(),
          status: "error",
          itemsFound: result.itemsFound,
          itemsCreated: result.itemsCreated,
          duplicatesSkipped: result.duplicatesSkipped,
          errorMessage: result.error
        }
      });
    } catch (updateError) {
      console.error(`[intake] Failed to record failure for "${source.name}":`, updateError);
    }
  }

  return result;
}

/**
 * Loads recent Articles + pending IntakeItems from the same source as duplicate-detection
 * candidates. Prefixes ids with "article:"/"intake:" so runIntakeForSource can route a match
 * back to the correct foreign key without a second lookup.
 */
async function loadRecentDuplicateCandidates(sourceId: string): Promise<DuplicateCandidate[]> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [articles, intakeItems] = await Promise.all([
    prisma.article.findMany({
      where: { sourceId, publishedAt: { gte: since } },
      select: { id: true, title: true, originalUrl: true, publishedAt: true, sourceId: true }
    }),
    prisma.intakeItem.findMany({
      where: { sourceId, publishedAt: { gte: since }, status: { in: ["pending", "scheduled"] } },
      select: { id: true, title: true, originalUrl: true, publishedAt: true, sourceId: true }
    })
  ]);

  return [
    ...articles.map((article) => ({ ...article, id: `article:${article.id}` })),
    ...intakeItems.map((item) => ({ ...item, id: `intake:${item.id}` }))
  ];
}

export async function runIntake(): Promise<IntakeRunSummary> {
  const sources = await prisma.source.findMany({ where: { active: true } });
  const entityIndex = await loadEntityIndex();

  const results: SourceIntakeResult[] = [];
  for (const source of sources) {
    results.push(await runIntakeForSource(source, entityIndex));
  }

  return summarize(results);
}

export async function runIntakeForSourceId(sourceId: string): Promise<SourceIntakeResult> {
  const source = await prisma.source.findUniqueOrThrow({ where: { id: sourceId } });
  const entityIndex = await loadEntityIndex();
  return runIntakeForSource(source, entityIndex);
}

function summarize(results: SourceIntakeResult[]): IntakeRunSummary {
  return {
    sourcesChecked: results.length,
    itemsFound: results.reduce((sum, item) => sum + item.itemsFound, 0),
    itemsCreated: results.reduce((sum, item) => sum + item.itemsCreated, 0),
    duplicatesSkipped: results.reduce((sum, item) => sum + item.duplicatesSkipped, 0),
    sources: results
  };
}
