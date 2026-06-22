const BUSINESS_IMPACT_TAXONOMY = [
  { key: "operations", label: "Operational Impact", match: ["operations", "governance", "management"] },
  {
    key: "financial",
    label: "Financial Implications",
    match: ["capital", "investment", "acquisition", "m&a", "deal", "transaction", "ownership", "renovation", "construction", "expansion", "budget", "capital plan"]
  },
  {
    key: "leadership",
    label: "Leadership Implications",
    match: ["leadership", "executive", "hiring", "talent", "recruiting", "staffing", "workforce", "labor", "succession"]
  },
  { key: "technology", label: "Technology Implications", match: ["technology", "software", "ai", "data", "systems", "digital", "automation"] },
  {
    key: "member-experience",
    label: "Member Experience Implications",
    match: ["member experience", "service", "hospitality", "membership", "amenity", "amenities", "dining", "programming"]
  }
] as const;

export type BusinessImpactArea = { key: string; label: string; tags: string[] };

/**
 * Buckets an article's own tags into business-impact categories. Only categories with at least one
 * matching tag are returned — purely a relabeling of existing data, no fabricated facts or scores.
 */
export function businessImpactForArticle(tags: string[]): BusinessImpactArea[] {
  const areas: BusinessImpactArea[] = [];

  for (const category of BUSINESS_IMPACT_TAXONOMY) {
    const matchedTags = tags.filter((tag) => category.match.some((keyword) => tag.toLowerCase().includes(keyword)));
    if (matchedTags.length) areas.push({ key: category.key, label: category.label, tags: matchedTags });
  }

  return areas;
}

/** Deterministic one-sentence rollup of the matched impact areas, for the Executive Brief card. */
export function businessImpactSummary(areas: BusinessImpactArea[]): string {
  if (!areas.length) return "This story is informational and does not carry a distinct operational, financial, or leadership signal on its own.";
  const labels = areas.map((area) => area.label.replace(" Implications", "").replace(" Impact", ""));
  const joined = labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}` : labels[0];
  return `This story carries ${joined.toLowerCase()} implications for private club leaders.`;
}
