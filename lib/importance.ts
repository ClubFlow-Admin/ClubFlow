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
