const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "at", "by", "from",
  "is", "are", "was", "were", "be", "as", "it", "its", "this", "that", "into", "after", "over"
]);

function titleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word))
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export type DuplicateCandidate = {
  id: string;
  title: string;
  originalUrl: string;
  publishedAt: Date;
  sourceId: string;
};

export type DuplicateMatch = {
  candidateId: string;
  confidence: number;
};

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

/**
 * Scores a new item against existing Articles/IntakeItems to flag likely duplicates
 * (e.g. the same wire story picked up by two trade publications, or a republish).
 * Exact URL match is the only deterministic signal; everything else (headline overlap,
 * publish-date proximity, same source) is weighted evidence, not proof — confidence is
 * a 0-100 score for an editor to weigh, never an automatic reject.
 */
export function detectDuplicate(
  item: { title: string; originalUrl: string; publishedAt: Date; sourceId: string },
  candidates: DuplicateCandidate[]
): DuplicateMatch | null {
  if (candidates.length === 0) return null;

  const itemTokens = titleTokens(item.title);
  let best: DuplicateMatch | null = null;

  for (const candidate of candidates) {
    if (candidate.originalUrl === item.originalUrl) {
      return { candidateId: candidate.id, confidence: 100 };
    }

    const similarity = jaccardSimilarity(itemTokens, titleTokens(candidate.title));
    const hoursApart = Math.abs(item.publishedAt.getTime() - candidate.publishedAt.getTime());
    const closeInTime = hoursApart <= FORTY_EIGHT_HOURS_MS;
    const sameSource = candidate.sourceId === item.sourceId;

    let confidence = Math.round(similarity * 100);
    if (closeInTime) confidence += 10;
    if (sameSource) confidence += 5;
    confidence = Math.min(confidence, 99);

    if (!best || confidence > best.confidence) {
      best = { candidateId: candidate.id, confidence };
    }
  }

  return best;
}
