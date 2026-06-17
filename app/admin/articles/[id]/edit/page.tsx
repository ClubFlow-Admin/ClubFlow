import { notFound } from "next/navigation";
import { updateArticle } from "@/app/admin/actions";
import { AdminTabs } from "@/components/admin-tabs";
import { AdminArticleForm } from "@/components/admin-article-form";
import { getCategories, getSources } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const [article, categories, sources, mediaAssets] = await Promise.all([
    prisma.article.findUnique({ where: { id }, include: { category: true, source: true, heroImage: true } }),
    getCategories(),
    getSources(),
    prisma.mediaAsset.findMany({ orderBy: { title: "asc" } })
  ]);

  if (!article) {
    notFound();
  }

  return (
    <main className="container-shell py-8">
      <AdminTabs />
      <div className="mb-6">
        <div className="text-xs font-bold uppercase text-primary">Admin</div>
        <h1 className="mt-1 text-3xl font-black">Edit Article</h1>
      </div>
      <AdminArticleForm
        action={updateArticle.bind(null, article.id)}
        article={article}
        categories={categories}
        mediaAssets={mediaAssets}
        sources={sources}
      />
    </main>
  );
}
