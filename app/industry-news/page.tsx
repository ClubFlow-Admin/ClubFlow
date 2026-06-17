import { SectionFeedPage } from "@/components/section-feed-page";
import { sectionPages } from "@/lib/categories";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function IndustryNewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const section = sectionPages["industry-news"];

  return <SectionFeedPage {...section} categorySlug={section.slug} searchParams={params} />;
}
