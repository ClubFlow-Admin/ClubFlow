import Link from "next/link";
import Image from "next/image";
import { BarChart3, BriefcaseBusiness, Sparkles, Users } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { FilterBar } from "@/components/filter-bar";
import { NewsletterForm } from "@/components/newsletter-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { categoryNav } from "@/lib/categories";
import { getArticles, getCategories, getSources } from "@/lib/articles";
import { photoAssets } from "@/lib/images";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [categories, sources, articles] = await Promise.all([
    getCategories(),
    getSources(),
    getArticles({
      category: params.category,
      query: params.query,
      source: params.source,
      clubName: params.clubName,
      location: params.location,
      from: params.from,
      to: params.to,
      status: "published"
    })
  ]);

  const topStory = articles[0];
  const rest = articles.slice(1);

  return (
    <main>
      <section className="border-b bg-white">
        <div className="container-shell grid gap-8 py-10 lg:grid-cols-[1.15fr_0.95fr]">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border bg-muted px-3 py-1 text-xs font-bold uppercase text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Manual-first news intelligence MVP
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
              ClubFlow tracks the private club stories operators need before the next board packet.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              Aggregate, review, summarize, and publish news across country clubs, golf clubs, yacht clubs, city clubs,
              and resort clubs. Built for GMs, COOs, department heads, board members, consultants, and vendors.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="#feed" className="no-underline">
                  View Feed
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/newsletter" className="no-underline">
                  Get the Newsletter
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="relative h-[320px] overflow-hidden rounded-lg border bg-card shadow-sm">
              <Image
                src={photoAssets.hero}
                alt="Private club clubhouse terrace at golden hour"
                fill
                priority
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            </div>
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-black">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Intelligence Snapshot
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-2xl font-black">{articles.length}</div>
                    <div className="text-xs text-muted-foreground">Published</div>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-2xl font-black">{categories.length}</div>
                    <div className="text-xs text-muted-foreground">Sections</div>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="text-2xl font-black">{sources.length}</div>
                    <div className="text-xs text-muted-foreground">Sources</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/25">
              <CardContent className="p-5">
                <div className="mb-2 text-xs font-bold uppercase text-primary">Featured Resource</div>
                <h2 className="text-lg font-black">Partner content area</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Reserved for future Club Ops Pro resources, courses, templates, and operating playbooks without
                  confusing ClubFlow&apos;s news positioning.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-black">
                  <Users className="h-4 w-4 text-primary" />
                  Newsletter
                </div>
                <NewsletterForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="feed" className="container-shell py-8">
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
        <FilterBar categories={categories} sources={sources} defaults={params} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4">
            {topStory ? <ArticleCard article={topStory} /> : null}
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
            {!articles.length ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No published stories match those filters.
                </CardContent>
              </Card>
            ) : null}
          </div>
          <aside className="grid h-fit gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-black">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  Operator Brief
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Each story is designed to answer what happened, why it matters, and which clubs or departments should
                  pay attention.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-xs font-bold uppercase text-muted-foreground">Coming Next</div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>RSS ingestion queue</li>
                  <li>Daily and weekly newsletter builder</li>
                  <li>Saved searches and source scoring</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
