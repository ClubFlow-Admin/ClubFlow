import Link from "next/link";
import { format } from "date-fns";
import { Edit, Plus, Trash2 } from "lucide-react";
import { deleteArticle } from "@/app/admin/actions";
import { AdminTabs } from "@/components/admin-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [articles, subscriberCount] = await Promise.all([
    prisma.article.findMany({
      include: { category: true, source: true },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.newsletterSubscriber.count({ where: { active: true } })
  ]);

  const counts = {
    draft: articles.filter((article) => article.status === "draft").length,
    reviewed: articles.filter((article) => article.status === "reviewed").length,
    published: articles.filter((article) => article.status === "published").length
  };

  return (
    <main className="container-shell py-8">
      <AdminTabs />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase text-primary">Admin Dashboard</div>
          <h1 className="mt-1 text-3xl font-black">Review and Publish Stories</h1>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new" className="no-underline">
            <Plus className="h-4 w-4" />
            Add Article
          </Link>
        </Button>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Metric label="Draft" value={counts.draft} />
        <Metric label="Reviewed" value={counts.reviewed} />
        <Metric label="Published" value={counts.published} />
        <Metric label="Subscribers" value={subscriberCount} />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Story</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b last:border-0">
                    <td className="px-4 py-4">
                      <div className="font-bold">{article.title}</div>
                      <div className="text-xs text-muted-foreground">{article.clubName ?? "Industry-wide"}</div>
                    </td>
                    <td className="px-4 py-4">{article.category.name}</td>
                    <td className="px-4 py-4">{article.source.name}</td>
                    <td className="px-4 py-4">
                      <Badge className="bg-white">{article.status}</Badge>
                    </td>
                    <td className="px-4 py-4">{format(article.publishedAt, "MMM d, yyyy")}</td>
                    <td className="px-4 py-4 font-bold">{article.importanceScore}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/articles/${article.id}/edit`} className="no-underline">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <form action={deleteArticle.bind(null, article.id)}>
                          <Button type="submit" size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-black">{value}</div>
      </CardContent>
    </Card>
  );
}
