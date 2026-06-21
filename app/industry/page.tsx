import { SectionFeedPage } from "@/components/section-feed-page";
import { sectionPages } from "@/lib/categories";

export const dynamic = "force-dynamic";
export default async function IndustryPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const section = sectionPages["industry-news"];
  return <SectionFeedPage {...section} href="/industry" categorySlug={section.slug} searchParams={await searchParams} />;
}
