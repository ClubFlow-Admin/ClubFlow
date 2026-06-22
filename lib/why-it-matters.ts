import type { ArticleWithRelations } from "@/lib/articles";

/**
 * Deterministic, category-themed executive takeaways used until OpenAI generates these per-article.
 * Swap the body of whyItMattersFor for an AI-backed lookup later — callers don't need to change.
 */
const CATEGORY_INSIGHTS: Record<string, string[]> = {
  "industry-news": [
    "Membership demand signals continue to firm up initiation pricing and waitlist leverage across destination clubs.",
    "Shifting member expectations are pushing boards to revisit governance and amenity priorities sooner than planned.",
    "Demand-side trends like this typically precede pricing and policy moves at comparable clubs within a season."
  ],
  "developments-renovations": [
    "Large capital projects like this signal continued confidence in premium club demand despite higher construction costs.",
    "Clubhouse and amenity investment at this scale raises the competitive bar for comparable clubs in the same market.",
    "Long-term facility bets like this reflect boards underwriting member demand well beyond the current cycle."
  ],
  technology: [
    "Technology adoption here is shifting from back-office efficiency toward visibly improving the member experience.",
    "Automation moves like this typically compress labor costs first and reshape staffing models over the following year.",
    "Early operating-technology bets like this often become the baseline competitors are measured against within 12-18 months."
  ],
  "executive-moves": [
    "Leadership changes like this are a leading indicator of strategic direction shifts at the club or company involved.",
    "Moves like this reshape the recruiting market for comparable roles at peer clubs almost immediately.",
    "Executive transitions at this level often precede broader organizational or operating-model changes."
  ],
  jobs: [
    "Open roles like this point to sustained hiring demand and a tightening talent market for comparable positions.",
    "Recruiting activity at this level signals clubs are competing harder for a shrinking pool of qualified operators.",
    "Hiring patterns like this are an early signal of where clubs are investing in operating capacity next."
  ],
  "capital-investments": [
    "Capital commitments like this reflect board-level confidence in long-term club positioning, not just maintenance.",
    "Reserve and capital-plan moves at this scale typically set the benchmark other clubs use in their own planning.",
    "Investment decisions like this usually signal a multi-year modernization push rather than a one-off project."
  ],
  "mergers-acquisitions": [
    "Deals like this accelerate consolidation pressure and raise the scale threshold needed to compete independently.",
    "Ownership and management changes at this scale tend to reset pricing and positioning across the local market.",
    "Transactions like this are a signal that platform buyers see durable value in well-run private clubs."
  ]
};

const DEFAULT_INSIGHTS = [
  "Developments like this shape how club leaders benchmark performance, investment, and strategy against peers.",
  "Signals like this are worth tracking as they typically influence planning conversations at comparable clubs."
];

function hashToInt(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/** Deterministic per-article pick so the same story always shows the same executive takeaway. */
export function whyItMattersFor(article: ArticleWithRelations): string {
  const pool = CATEGORY_INSIGHTS[article.category.slug] ?? DEFAULT_INSIGHTS;
  const index = hashToInt(article.id) % pool.length;
  return pool[index];
}
