import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublishedArticleBySlug } from "@/lib/articles";
import { imageForArticle } from "@/lib/images";
import { formatLocation } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getPublishedArticleBySlug(id);

  if (!article) {
    notFound();
  }

  const location = formatLocation(article.city, article.state);
  const imageSrc = imageForArticle(article);

  return (
    <main className="container-shell py-8">
      <Button asChild variant="ghost" className="mb-5">
        <Link href="/" className="no-underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>
      </Button>
      <article className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="relative h-[360px] w-full">
            <Image src={imageSrc} alt="" fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
          </div>
          <CardContent className="p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge className="border-primary/30 bg-primary/10 text-primary">{article.category.name}</Badge>
              <span className="text-sm font-semibold text-muted-foreground">{article.source.name}</span>
              <span className="text-sm text-muted-foreground">{format(article.publishedAt, "MMMM d, yyyy")}</span>
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">{article.title}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {article.author ? <span>By {article.author}</span> : null}
              {article.clubName ? <span>{article.clubName}</span> : null}
              {location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {location}
                </span>
              ) : null}
            </div>
            <section className="mt-8 rounded-lg border-l-4 border-primary bg-muted p-5">
              <div className="mb-2 text-xs font-black uppercase text-primary">AI Summary</div>
              <p className="leading-7">{article.aiSummary}</p>
            </section>
            {article.originalExcerpt ? (
              <section className="mt-8">
                <h2 className="text-lg font-black">Original Excerpt</h2>
                <p className="mt-2 leading-7 text-muted-foreground">{article.originalExcerpt}</p>
              </section>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="rounded-sm bg-secondary px-2 py-1 text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
            <Button asChild className="mt-8">
              <a href={article.originalUrl} target="_blank" rel="noreferrer" className="no-underline">
                Read Original <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
        <aside className="grid h-fit gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-bold uppercase text-muted-foreground">Importance Score</div>
              <div className="mt-2 text-4xl font-black">{article.importanceScore}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Editorial signal for how relevant this story may be to private club leaders.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-bold uppercase text-primary">Featured Resource</div>
              <h2 className="mt-2 font-black">Club Ops Pro placeholder</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Future partner resources can live here while article pages remain focused on news and intelligence.
              </p>
            </CardContent>
          </Card>
        </aside>
      </article>
    </main>
  );
}
