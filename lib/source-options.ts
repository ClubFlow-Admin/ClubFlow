export const sourceTypes = [
  { value: "trade-publication", label: "Trade publication" },
  { value: "association", label: "Association" },
  { value: "club-resort-website", label: "Club/resort website" },
  { value: "real-estate-development", label: "Real estate/development source" },
  { value: "jobs", label: "Jobs source" },
  { value: "press-release", label: "Press release source" },
  { value: "technology-vendor", label: "Technology vendor" },
  { value: "podcast-media", label: "Podcast/media" },
  { value: "other", label: "Other" }
] as const;

export const sourceCategories = [
  { value: "industry", label: "Industry" },
  { value: "developments", label: "Developments" },
  { value: "executive-moves", label: "Executive Moves" },
  { value: "jobs", label: "Jobs" },
  { value: "technology", label: "Technology" },
  { value: "mergers-acquisitions", label: "M&A" },
  { value: "capital-investments", label: "Capital Investments" },
  { value: "club-rankings", label: "Club Rankings" },
  { value: "podcasts", label: "Podcasts" },
  { value: "clubopspro", label: "ClubOpsPro" }
] as const;

export const sourcePriorities = [
  { value: 100, label: "Critical" },
  { value: 75, label: "High" },
  { value: 50, label: "Standard" },
  { value: 25, label: "Low" }
] as const;

export function sourceTypeLabel(value: string) {
  return sourceTypes.find((item) => item.value === value)?.label ?? "Other";
}

export function sourceCategoryLabel(value: string | null) {
  return sourceCategories.find((item) => item.value === value)?.label ?? "Unassigned";
}

export function sourcePriorityLabel(value: number) {
  return sourcePriorities.find((item) => item.value === value)?.label ?? `Priority ${value}`;
}
