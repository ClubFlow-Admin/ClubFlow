export type ImportanceTier = "Breaking" | "Major" | "Important" | "Standard" | "Brief";

const TIERS: { min: number; tier: ImportanceTier }[] = [
  { min: 90, tier: "Breaking" },
  { min: 75, tier: "Major" },
  { min: 60, tier: "Important" },
  { min: 40, tier: "Standard" },
  { min: 0, tier: "Brief" }
];

/** Maps a 0-100 importanceScore to an editorial tier. Score 50 (the field default) safely resolves to "Standard". */
export function importanceTier(score: number): ImportanceTier {
  return TIERS.find(({ min }) => score >= min)?.tier ?? "Standard";
}

export type PriorityGroup = "Breaking" | "High Priority" | "Standard Coverage" | "Low Priority";

const GROUP_BY_TIER: Record<ImportanceTier, PriorityGroup> = {
  Breaking: "Breaking",
  Major: "High Priority",
  Important: "Standard Coverage",
  Standard: "Standard Coverage",
  Brief: "Low Priority"
};

/** Buckets the existing 5-tier importanceTier() into the 4 newsroom priority sections used in the Intake Queue. No new scoring — purely a display grouping over the existing score. */
export function priorityGroup(score: number): PriorityGroup {
  return GROUP_BY_TIER[importanceTier(score)];
}

export const priorityGroupOrder: PriorityGroup[] = ["Breaking", "High Priority", "Standard Coverage", "Low Priority"];
