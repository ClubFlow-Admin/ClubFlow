export const adminSections = [
  { slug: "industry", label: "Industry", description: "Industry news, membership, governance, finance, and market signals.", kind: "article", categorySlug: "industry-news", publicHref: "/industry" },
  { slug: "developments", label: "Club Developments", description: "Development, renovation, clubhouse, course, and amenity stories.", kind: "article", categorySlug: "developments-renovations", publicHref: "/developments" },
  { slug: "executive-moves", label: "Executive Moves", description: "Leadership appointments and transitions across private clubs.", kind: "executiveMove", publicHref: "/executive-moves" },
  { slug: "jobs", label: "Jobs", description: "Open leadership and operating roles across the club industry.", kind: "job", publicHref: "/jobs" },
  { slug: "technology", label: "Technology", description: "Software, AI, data, security, and operating technology stories.", kind: "article", categorySlug: "technology", publicHref: "/technology" },
  { slug: "mergers-acquisitions", label: "Mergers & Acquisitions", description: "Transactions, ownership changes, and management agreements.", kind: "article", categorySlug: "mergers-acquisitions", publicHref: "/mergers-acquisitions" },
  { slug: "capital-investments", label: "Capital Investments", description: "Capital plans, reserve strategy, and major asset investments.", kind: "article", categorySlug: "capital-investments", publicHref: "/capital-investments" },
  { slug: "club-rankings", label: "Club Rankings", description: "ClubFlow rankings, watchlists, scores, and editorial rationale.", kind: "ranking", publicHref: "/club-rankings" },
  { slug: "podcasts", label: "Podcasts", description: "Podcast shows, episode concepts, descriptions, and publishing status.", kind: "podcast", publicHref: "/podcasts" },
  { slug: "clubopspro", label: "ClubOpsPro", description: "ClubOpsPro consulting, playbooks, resources, and partner content.", kind: "article", categorySlug: "clubopspro", publicHref: "/clubopspro" }
] as const;

export type AdminSection = (typeof adminSections)[number];
export type AdminSectionKind = AdminSection["kind"];

export function getAdminSection(slug: string) {
  return adminSections.find((section) => section.slug === slug);
}

export function adminSectionForCategory(categorySlug: string) {
  return adminSections.find((section) => section.kind === "article" && section.categorySlug === categorySlug);
}

export function adminEditHref(sectionSlug: string, id: string) {
  const section = getAdminSection(sectionSlug);
  return section ? `/admin/${section.slug}/${id}/edit` : undefined;
}

export function articleAdminEditHref(categorySlug: string, id: string) {
  const section = adminSectionForCategory(categorySlug);
  return section ? adminEditHref(section.slug, id) : undefined;
}
