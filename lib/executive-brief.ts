/**
 * Deterministic "ClubFlow Take" used for the hero's Today's Executive Brief until OpenAI generates
 * this per-day. Swap the body of clubFlowTake for an AI-backed summary later — callers don't change.
 */
export type CategoryActivityCounts = {
  capital: number;
  moves: number;
  jobs: number;
  technology: number;
  deals: number;
};

const THEME_COPY: Record<keyof CategoryActivityCounts, { noun: string; insight: string }> = {
  capital: {
    noun: "capital investment",
    insight: "operators continue investing for long-term member demand despite higher construction costs"
  },
  moves: {
    noun: "leadership turnover",
    insight: "clubs are actively repositioning leadership to match strategic priorities"
  },
  jobs: {
    noun: "hiring demand",
    insight: "the talent market for experienced club operators remains tight"
  },
  technology: {
    noun: "digital transformation",
    insight: "clubs are prioritizing member-facing technology over pure back-office efficiency"
  },
  deals: {
    noun: "consolidation",
    insight: "platform buyers continue to see durable value in well-run private clubs"
  }
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Picks the one or two loudest signals across today's homepage categories and frames an executive sentence. */
export function clubFlowTake(counts: CategoryActivityCounts): string {
  const ranked = (Object.entries(counts) as [keyof CategoryActivityCounts, number][])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!ranked.length) {
    return "Coverage is light today — check back as more private club industry activity is published.";
  }

  const [topKey, topCount] = ranked[0];
  const top = THEME_COPY[topKey];
  const second = ranked[1];

  if (second && second[1] >= topCount * 0.6) {
    const secondTheme = THEME_COPY[second[0]];
    return `${capitalize(top.noun)} and ${secondTheme.noun} remain elevated across private clubs today, suggesting ${top.insight}.`;
  }

  return `${capitalize(top.noun)} is the dominant signal across private clubs today, suggesting ${top.insight}.`;
}
