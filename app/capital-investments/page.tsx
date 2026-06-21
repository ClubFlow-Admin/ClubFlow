import { SectionFeedPage } from "@/components/section-feed-page";
import { sectionPages } from "@/lib/categories";

export const dynamic = "force-dynamic";
export default async function CapitalInvestmentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const section = sectionPages["capital-investments"];
  return <SectionFeedPage {...section} categorySlug={section.slug} searchParams={await searchParams} />;
}
