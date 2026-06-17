import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Newspaper } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { FilterBar } from "@/components/filter-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryNav } from "@/lib/categories";
import { getArticles, getCategories, getSources } from "@/lib/articles";
import { imageForCategory } from "@/lib/images";

type SectionFeedPageProps = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  categorySlug: string;
  searchParams: Record<string, string | undefined>;
};

export async function SectionFeedPage({
  title,
  eyebrow,
  description,
  href,
  categorySlug,
  searchParams
}: SectionFeedPageProps) {
  const sectionImage = imageForCategory(categorySlug);
  const [categories, sources, articles] = await Promise.all([
    getCategories(),
    getSources(),
    getArticles({
      category: categorySlug,
      query: searchParams.query,
      source: searchParams.source,
      clubName: searchParams.clubName,
      location: searchParams.location,
      from: searchParams.from,
      to: searchParams.to,
      status: "published"
    })
  ]);

  return (
    <main>
      <section className="border-b bg-white">
        <div className="container-shell py-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/" className="no-underline">
              <ArrowLeft className="h-4 w-4" />
              Home Feed
            </Link>
          </Button>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="text-xs font-bold uppercase text-primary">{eyebrow}</div>
              <h1 className="mt-2 text-4xl font-black leading-tight">{title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
            </div>
            <Card className="overflow-hidden">
              <div className="relative h-40 w-full">
                <Image src={sectionImage} alt="" fill sizes="360px" className="object-cover" />
              </div>
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-black">
                  <Newspaper className="h-4 w-4 text-primary" />
                  Section Snapshot
                </div>
                <div className="text-4xl font-black">{articles.length}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Published stories in this section.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container-shell py-8">
        <div className="mb-5 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {categoryNav.map((item) => (
              <Link
                href={item.href}
                key={item.href + item.label}
                className="rounded-md border bg-white px-3 py-2 text-sm font-semibold no-underline hover:border-primary hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <FilterBar categories={categories} sources={sources} defaults={searchParams} action={href} />
        <div className="mt-6 grid gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {!articles.length ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No published stories match this section and filter set yet.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
  );
}
