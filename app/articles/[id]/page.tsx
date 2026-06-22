import { notFound } from "next/navigation";
import { ArticleBriefing } from "@/components/article-briefing";
import { getArticles, getPublishedArticleBySlug } from "@/lib/articles";
import { publicHrefForCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

const RELATED_DESKS = [
  { slug: "executive-moves", label: "Related Executive Moves", href: "/executive-moves" },
  { slug: "developments-renovations", label: "Related Developments", href: "/developments" },
  { slug: "technology", label: "Related Technology", href: "/technology" },
  { slug: "capital-investments", label: "Related Capital Projects", href: "/capital-investments" },
  { slug: "mergers-acquisitions", label: "Related M&A", href: "/mergers-acquisitions" }
] as const;

export default async function ArticleDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> }) {
  const { id } = await params;
  const { from } = await searchParams;
  const article = await getPublishedArticleBySlug(id);
  if (!article) notFound();

  // One published-articles fetch powers both the same-desk "related" list and the cross-desk
  // Related Intelligence groups below — avoids a separate query per desk.
  const others = (await getArticles({ status: "published" })).filter((item) => item.id !== article.id);
  const related = others.filter((item) => item.category.slug === article.category.slug).slice(0, 3);
  const relatedDesks = RELATED_DESKS.filter((desk) => desk.slug !== article.category.slug)
    .map((desk) => ({ ...desk, articles: others.filter((item) => item.category.slug === desk.slug).slice(0, 3) }))
    .filter((desk) => desk.articles.length > 0);

  const sectionHref = publicHrefForCategory(article.category.slug);

  return <ArticleBriefing article={article} related={related} relatedDesks={relatedDesks} sectionHref={sectionHref} from={from} />;
}
