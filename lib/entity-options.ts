export const clubTypes = [
  { value: "private-club", label: "Private Club" },
  { value: "country-club", label: "Country Club" },
  { value: "destination-resort", label: "Destination Resort" },
  { value: "golf-community", label: "Golf Community" },
  { value: "daily-fee", label: "Daily Fee" },
  { value: "other", label: "Other" }
] as const;

export const companyIndustries = [
  { value: "club-management", label: "Club Management" },
  { value: "golf-real-estate", label: "Golf Real Estate" },
  { value: "technology-vendor", label: "Technology Vendor" },
  { value: "course-maintenance", label: "Course Maintenance & Turf" },
  { value: "architecture-design", label: "Architecture & Design" },
  { value: "hospitality-operations", label: "Hospitality Operations" },
  { value: "other", label: "Other" }
] as const;

export const entityStatuses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
] as const;

export function clubTypeLabel(value: string | null) {
  return clubTypes.find((item) => item.value === value)?.label ?? "Unspecified";
}

export function companyIndustryLabel(value: string | null) {
  return companyIndustries.find((item) => item.value === value)?.label ?? "Unspecified";
}
