import { SectionFeedPage } from "@/components/section-feed-page";
import { sectionPages } from "@/lib/categories";

export const dynamic = "force-dynamic";
export default async function MergersAcquisitionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const section = sectionPages["mergers-acquisitions"];
  return <SectionFeedPage {...section} categorySlug={section.slug} searchParams={await searchParams} />;
}
