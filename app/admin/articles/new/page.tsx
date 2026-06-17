import { createArticle } from "@/app/admin/actions";
import { AdminTabs } from "@/components/admin-tabs";
import { AdminArticleForm } from "@/components/admin-article-form";
import { getCategories, getSources } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, sources, mediaAssets] = await Promise.all([
    getCategories(),
    getSources(),
    prisma.mediaAsset.findMany({ orderBy: { title: "asc" } })
  ]);

  return (
    <main className="container-shell py-8">
      <AdminTabs />
      <div className="mb-6">
        <div className="text-xs font-bold uppercase text-primary">Admin</div>
        <h1 className="mt-1 text-3xl font-black">Add Article</h1>
      </div>
      <AdminArticleForm action={createArticle} categories={categories} mediaAssets={mediaAssets} sources={sources} />
    </main>
  );
}
