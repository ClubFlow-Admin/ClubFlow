import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { ArticleWithRelations } from "@/lib/articles";
import { imageForArticle } from "@/lib/images";
import { formatLocation } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ArticleCard({ article }: { article: ArticleWithRelations }) {
  const location = formatLocation(article.city, article.state);
  const imageSrc = imageForArticle(article);

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <Link href={`/articles/${article.slug}`} className="block no-underline">
          <div className="relative h-full min-h-[180px] w-full">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(min-width: 768px) 220px, 100vw"
            className="object-cover"
          />
          </div>
        </Link>
        <CardContent className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="border-primary/30 bg-primary/10 text-primary">{article.category.name}</Badge>
            <span className="text-xs font-semibold text-muted-foreground">{article.source.name}</span>
            <span className="text-xs text-muted-foreground">{format(article.publishedAt, "MMM d, yyyy")}</span>
            <span className="text-xs font-semibold text-muted-foreground">Score {article.importanceScore}</span>
          </div>
          <Link href={`/articles/${article.slug}`} className="group no-underline">
            <h2 className="text-xl font-black leading-snug group-hover:text-primary">{article.title}</h2>
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{article.aiSummary}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
              {article.clubName ? <span>{article.clubName}</span> : null}
              {location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              ) : null}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/articles/${article.slug}`} className="no-underline">
                Read More <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
