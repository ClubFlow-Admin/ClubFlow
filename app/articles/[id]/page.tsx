import { notFound } from "next/navigation";
import { ArticleBriefing } from "@/components/article-briefing";
import { getArticles, getPublishedArticleBySlug } from "@/lib/articles";
import { publicHrefForCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getPublishedArticleBySlug(id);
  if (!article) notFound();

  const related = (await getArticles({ category: article.category.slug, status: "published" })).filter((item) => item.id !== article.id).slice(0, 3);
  const sectionHref = publicHrefForCategory(article.category.slug);

  return <ArticleBriefing article={article} related={related} sectionHref={sectionHref} />;
}
