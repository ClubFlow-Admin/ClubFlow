import type { Source } from "@prisma/client";
import type { SourceStats } from "@/lib/source-stats";

export type QualityFactor = { label: string; weight: number; score: number | null; note?: string };
export type SourceQuality = { score: number; factors: QualityFactor[]; unmeasuredNote: string };

const WEIGHTS = { reliability: 0.4, frequency: 0.2, relevance: 0.2, freshness: 0.1, duplicateRate: 0.1 };

function freshnessScore(lastSuccessfulImportAt: Date | null): number | null {
  if (!lastSuccessfulImportAt) return null;
  const daysSince = (Date.now() - lastSuccessfulImportAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 7) return 100;
  if (daysSince >= 90) return 0;
  return Math.round(100 - ((daysSince - 7) / (90 - 7)) * 100);
}

function frequencyScore(storiesPerMonth: number | null): number | null {
  if (storiesPerMonth === null) return null;
  const CAP = 8; // 2 stories/week treated as a fully productive source
  return Math.round(Math.min(1, storiesPerMonth / CAP) * 100);
}

/**
 * Transparent, computed-on-read quality score (0-100) built only from signals we actually
 * have: ImportRun success rate, Article output cadence, the source's own human-assigned
 * `priority` (industry relevance — reused, not invented), recency of last successful
 * import, and the source's duplicate rate among its IntakeItems. Factors with no signal
 * yet (no runs, no articles) contribute nothing rather than a guessed default, and the
 * overall score is renormalized over only the factors that have data.
 *
 * Deliberately NOT scored, because no real signal exists for them: "original reporting"
 * quality, "press release quality", and general "editorial quality." These require either
 * human review or AI content analysis, neither of which is wired up — see unmeasuredNote.
 */
export function computeSourceQuality(source: Source, stats: SourceStats): SourceQuality {
  const factors: QualityFactor[] = [
    { label: "Reliability (import success rate)", weight: WEIGHTS.reliability, score: stats.successRate },
    { label: "Publishing frequency", weight: WEIGHTS.frequency, score: frequencyScore(stats.storiesPerMonth) },
    { label: "Industry relevance (editorial priority)", weight: WEIGHTS.relevance, score: source.priority },
    { label: "Freshness (last successful import)", weight: WEIGHTS.freshness, score: freshnessScore(source.lastSuccessfulImportAt) },
    {
      label: "Duplicate rate (inverse)",
      weight: WEIGHTS.duplicateRate,
      score: stats.duplicateRate === null ? null : 100 - stats.duplicateRate
    }
  ];

  const scored = factors.filter((factor) => factor.score !== null) as Array<QualityFactor & { score: number }>;
  const totalWeight = scored.reduce((sum, factor) => sum + factor.weight, 0);
  const score = totalWeight > 0 ? Math.round(scored.reduce((sum, factor) => sum + factor.score * factor.weight, 0) / totalWeight) : 0;

  return {
    score,
    factors,
    unmeasuredNote:
      "Original reporting, press release quality, and general editorial quality are not scored — no automated signal exists for them yet (would require human review or AI content analysis, neither of which is wired up)."
  };
}
