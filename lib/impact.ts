const IMPACT_TAXONOMY = [
  { key: "capital", label: "Capital Projects", match: ["capital", "renovation", "construction", "expansion", "clubhouse", "amenity", "amenities"] },
  { key: "technology", label: "Technology", match: ["technology", "software", "ai", "data", "systems", "digital"] },
  { key: "staffing", label: "Staffing & Talent", match: ["staffing", "talent", "hiring", "labor", "workforce", "leadership"] },
  { key: "member-experience", label: "Member Experience", match: ["member experience", "service", "hospitality", "membership"] },
  { key: "operations", label: "Operations", match: ["operations", "governance", "management"] },
  { key: "investment", label: "Investment", match: ["investment", "acquisition", "m&a", "deal", "transaction", "ownership"] }
] as const;

export type ImpactArea = { key: string; label: string };

/**
 * Surfaces existing article tags under a fixed financial/operational taxonomy
 * so the public page can highlight relevant impact areas without inventing
 * any new content — purely a relabeling of data the article already has.
 */
export function impactAreasForTags(tags: string[]): ImpactArea[] {
  const normalizedTags = tags.map((tag) => tag.toLowerCase());
  const matched: ImpactArea[] = [];

  for (const category of IMPACT_TAXONOMY) {
    const hit = category.match.some((keyword) => normalizedTags.some((tag) => tag.includes(keyword)));
    if (hit) matched.push({ key: category.key, label: category.label });
  }

  return matched;
}
