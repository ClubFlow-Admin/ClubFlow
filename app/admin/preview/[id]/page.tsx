import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { ArticleBriefing } from "@/components/article-briefing";
import { articleAdminEditHref } from "@/lib/admin-sections";
import { getArticleByIdForPreview, getArticles } from "@/lib/articles";
import { publicHrefForCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AdminArticlePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleByIdForPreview(id);
  if (!article) notFound();

  const related = (await getArticles({ category: article.category.slug, status: "published" })).filter((item) => item.id !== article.id).slice(0, 3);
  const sectionHref = publicHrefForCategory(article.category.slug);
  const editHref = articleAdminEditHref(article.category.slug, article.id);

  const banner = (
    <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 bg-ink px-4 py-3 text-white sm:px-6">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em]">
        <Eye className="h-4 w-4 text-emerald-300" />
        Admin preview — status: <span className="text-emerald-300">{article.status}</span>
      </div>
      {editHref ? <Link href={editHref} className="rounded-sm border border-white/30 px-3 py-1.5 text-xs font-bold no-underline hover:border-white">Back to editor</Link> : null}
    </div>
  );

  return <ArticleBriefing article={article} related={related} sectionHref={sectionHref} banner={banner} />;
}
