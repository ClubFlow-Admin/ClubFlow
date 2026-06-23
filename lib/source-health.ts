import type { Source } from "@prisma/client";
import type { SourceStats } from "@/lib/source-stats";

export type SourceHealth = "healthy" | "inactive" | "manual_only" | "feed_missing" | "feed_broken" | "needs_review";

export const sourceHealthLabels: Record<SourceHealth, string> = {
  healthy: "Healthy",
  inactive: "Inactive",
  manual_only: "Manual Only",
  feed_missing: "Feed Missing",
  feed_broken: "Feed Broken",
  needs_review: "Needs Review"
};

const FEED_BROKEN_ERROR_RATE_THRESHOLD = 0.6;

/**
 * Pure, computed-on-read health classification — never stored, so it can't go stale.
 * Precedence: an editor's explicit "needs review" flag always wins; then inactive; then
 * the source's own honestly-recorded feed availability; then "untested" (configured with
 * a feed but never actually run, folded into needs_review since we have no evidence
 * either way); then a real failure pattern from ImportRun history; otherwise healthy.
 */
export function computeSourceHealth(source: Source, stats: SourceStats): SourceHealth {
  if (source.needsReview) return "needs_review";
  if (!source.active) return "inactive";
  if (source.feedAvailability === "manual") return "manual_only";
  if (source.feedAvailability === "unavailable") return "feed_missing";
  if (!source.rssUrl) return "feed_missing";
  if (stats.totalRuns === 0) return "needs_review";

  const errorRate = stats.errorRuns / stats.totalRuns;
  if (errorRate >= FEED_BROKEN_ERROR_RATE_THRESHOLD) return "feed_broken";

  return "healthy";
}

export function healthBadgeClass(health: SourceHealth): string {
  switch (health) {
    case "healthy":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "feed_broken":
      return "border-red-300 bg-red-50 text-red-800";
    case "feed_missing":
    case "manual_only":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "needs_review":
      return "border-amber-300 bg-amber-50 text-amber-800";
    case "inactive":
    default:
      return "border-slate-200 bg-white text-slate-500";
  }
}
