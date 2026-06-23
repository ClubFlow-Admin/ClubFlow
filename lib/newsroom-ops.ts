import { startOfMonth, startOfWeek } from "date-fns";
import { computeSourceHealth } from "@/lib/source-health";
import { prisma } from "@/lib/prisma";
import { getAllSourceStats, statsFor } from "@/lib/source-stats";

export type NewsroomOpsSummary = {
  mostProductiveSources: { name: string; articlesTotal: number }[];
  sourcesFailingImports: { name: string; errorRuns: number; totalRuns: number }[];
  sourcesNeedingAttention: { name: string; reason: string }[];
  storiesThisWeek: number;
  storiesThisMonth: number;
  averageImportsPerActiveSource: number;
};

/**
 * Operational (not editorial) rollup for the Sources page — distinct from the Intake
 * Queue's editorial dashboard. Everything here is computed from existing Source/
 * ImportRun/IntakeItem rows via the same health logic used on the audit page.
 */
export async function getNewsroomOpsSummary(): Promise<NewsroomOpsSummary> {
  const [sources, statsMap, storiesThisWeek, storiesThisMonth] = await Promise.all([
    prisma.source.findMany(),
    getAllSourceStats(),
    prisma.intakeItem.count({ where: { createdAt: { gte: startOfWeek(new Date()) } } }),
    prisma.intakeItem.count({ where: { createdAt: { gte: startOfMonth(new Date()) } } })
  ]);

  const activeSources = sources.filter((source) => source.active);
  const rows = sources.map((source) => ({ source, stats: statsFor(statsMap, source.id) }));

  const mostProductiveSources = rows
    .filter((row) => row.stats.articlesTotal > 0)
    .sort((a, b) => b.stats.articlesTotal - a.stats.articlesTotal)
    .slice(0, 5)
    .map((row) => ({ name: row.source.name, articlesTotal: row.stats.articlesTotal }));

  const sourcesFailingImports = rows
    .filter((row) => computeSourceHealth(row.source, row.stats) === "feed_broken")
    .map((row) => ({ name: row.source.name, errorRuns: row.stats.errorRuns, totalRuns: row.stats.totalRuns }));

  const sourcesNeedingAttention = rows
    .filter((row) => row.source.active)
    .map((row) => {
      const health = computeSourceHealth(row.source, row.stats);
      if (health === "needs_review") return { name: row.source.name, reason: row.source.needsReview ? "Flagged by editor" : "Configured but never run" };
      if (health === "manual_only") return { name: row.source.name, reason: "No automated feed configured" };
      if (health === "feed_missing") return { name: row.source.name, reason: "Feed availability marked unavailable" };
      return null;
    })
    .filter((entry): entry is { name: string; reason: string } => entry !== null);

  const totalImports = rows.reduce((sum, row) => sum + row.stats.intakeItemsTotal, 0);
  const averageImportsPerActiveSource = activeSources.length > 0 ? Math.round((totalImports / activeSources.length) * 10) / 10 : 0;

  return { mostProductiveSources, sourcesFailingImports, sourcesNeedingAttention, storiesThisWeek, storiesThisMonth, averageImportsPerActiveSource };
}
