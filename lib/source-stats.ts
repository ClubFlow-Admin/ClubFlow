import { prisma } from "@/lib/prisma";

export type SourceStats = {
  totalRuns: number;
  okRuns: number;
  errorRuns: number;
  successRate: number | null;
  articlesTotal: number;
  firstArticleAt: Date | null;
  lastArticleAt: Date | null;
  storiesPerMonth: number | null;
  intakeItemsTotal: number;
  duplicateItemsTotal: number;
  duplicateRate: number | null;
};

const EMPTY_STATS: SourceStats = {
  totalRuns: 0,
  okRuns: 0,
  errorRuns: 0,
  successRate: null,
  articlesTotal: 0,
  firstArticleAt: null,
  lastArticleAt: null,
  storiesPerMonth: null,
  intakeItemsTotal: 0,
  duplicateItemsTotal: 0,
  duplicateRate: null
};

/**
 * Bulk, non-N+1 aggregation of every signal we actually have for source health/quality:
 * ImportRun success/error history, Article output volume and cadence, and IntakeItem
 * duplicate rate. Read-only — used by the Source Health audit page and the Newsroom
 * Operations panel. Returns a stats object per sourceId; sources with no history get
 * EMPTY_STATS (nulls rather than fabricated zeros where a rate is undefined).
 */
export async function getAllSourceStats(): Promise<Map<string, SourceStats>> {
  const [runStats, errorRunStats, articleAgg, intakeAgg, duplicateAgg] = await Promise.all([
    prisma.importRun.groupBy({ by: ["sourceId"], _count: true }),
    prisma.importRun.groupBy({ by: ["sourceId"], where: { status: "error" }, _count: true }),
    prisma.article.groupBy({ by: ["sourceId"], _count: true, _min: { publishedAt: true }, _max: { publishedAt: true } }),
    prisma.intakeItem.groupBy({ by: ["sourceId"], _count: true }),
    prisma.intakeItem.groupBy({ by: ["sourceId"], where: { duplicateConfidence: { gte: 70 } }, _count: true })
  ]);

  const map = new Map<string, SourceStats>();

  for (const run of runStats) {
    map.set(run.sourceId, { ...EMPTY_STATS, totalRuns: run._count });
  }
  for (const run of errorRunStats) {
    const existing = map.get(run.sourceId) ?? { ...EMPTY_STATS };
    existing.errorRuns = run._count;
    map.set(run.sourceId, existing);
  }
  for (const entry of map.values()) {
    entry.okRuns = entry.totalRuns - entry.errorRuns;
    entry.successRate = entry.totalRuns > 0 ? Math.round((entry.okRuns / entry.totalRuns) * 100) : null;
  }

  for (const article of articleAgg) {
    const existing = map.get(article.sourceId) ?? { ...EMPTY_STATS };
    existing.articlesTotal = article._count;
    existing.firstArticleAt = article._min.publishedAt;
    existing.lastArticleAt = article._max.publishedAt;
    if (article._min.publishedAt && article._max.publishedAt && article._count > 0) {
      const spanMonths = Math.max(
        1,
        (article._max.publishedAt.getTime() - article._min.publishedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      existing.storiesPerMonth = Math.round((article._count / spanMonths) * 10) / 10;
    }
    map.set(article.sourceId, existing);
  }

  for (const intake of intakeAgg) {
    const existing = map.get(intake.sourceId) ?? { ...EMPTY_STATS };
    existing.intakeItemsTotal = intake._count;
    map.set(intake.sourceId, existing);
  }
  for (const dup of duplicateAgg) {
    const existing = map.get(dup.sourceId) ?? { ...EMPTY_STATS };
    existing.duplicateItemsTotal = dup._count;
    map.set(dup.sourceId, existing);
  }
  for (const entry of map.values()) {
    entry.duplicateRate = entry.intakeItemsTotal > 0 ? Math.round((entry.duplicateItemsTotal / entry.intakeItemsTotal) * 100) : null;
  }

  return map;
}

export function statsFor(map: Map<string, SourceStats>, sourceId: string): SourceStats {
  return map.get(sourceId) ?? EMPTY_STATS;
}
