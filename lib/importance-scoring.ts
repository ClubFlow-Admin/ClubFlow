const HIGH_SIGNAL_KEYWORDS = [
  "acquire", "acquires", "acquisition", "merger", "merges", "raises", "funding", "investment",
  "named ceo", "named president", "appoints", "appointed", "steps down", "resigns", "ipo",
  "opens", "opening", "groundbreaking", "breaks ground", "closes", "shuts down", "bankruptcy",
  "lawsuit", "partnership", "launches"
];

/**
 * Deterministic 0-100 importance estimate for an intake item, used only as an editorial
 * starting point (editors can change it before approving). Base is the source's own
 * editorial priority; keyword and entity-match signals nudge it. Same "deterministic,
 * documented, swappable for real AI later" pattern as lib/executive-brief.ts.
 */
export function estimateImportance(input: {
  sourcePriority: number;
  title: string;
  excerpt?: string | null;
  entityMatchCount: number;
}): number {
  let score = input.sourcePriority;

  const haystack = `${input.title} ${input.excerpt ?? ""}`.toLowerCase();
  if (HIGH_SIGNAL_KEYWORDS.some((keyword) => haystack.includes(keyword))) {
    score += 10;
  }

  if (input.entityMatchCount > 0) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
