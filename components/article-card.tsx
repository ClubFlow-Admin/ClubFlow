import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, MapPin } from "lucide-react";
import type { ArticleWithRelations } from "@/lib/articles";
import { imageForArticle } from "@/lib/images";
import { formatLocation } from "@/lib/utils";

function StoryMeta({ article, inverse = false }: { article: ArticleWithRelations; inverse?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[.1em] ${inverse ? "text-white/55" : "text-muted-foreground"}`}>
      <span className={inverse ? "text-emerald-300" : "text-primary"}>{article.category.name}</span>
      <span aria-hidden="true">/</span>
      <span>{article.source.name}</span>
      <span aria-hidden="true">/</span>
      <time dateTime={article.publishedAt.toISOString()}>{format(article.publishedAt, "MMM d, yyyy")}</time>
    </div>
  );
}

export function FeaturedArticleCard({ article, priority = false }: { article: ArticleWithRelations; priority?: boolean }) {
  const location = formatLocation(article.city, article.state);
  return (
    <article className="group grid overflow-hidden border bg-white lg:grid-cols-[1.08fr_.92fr]">
      <Link href={`/articles/${article.slug}`} className="relative block min-h-[260px] overflow-hidden no-underline sm:min-h-[340px]">
        <Image src={imageForArticle(article)} alt="" fill priority={priority} unoptimized sizes="(min-width:1024px) 52vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.025]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
      </Link>
      <div className="flex flex-col justify-center p-5 sm:p-8">
        <StoryMeta article={article} />
        <Link href={`/articles/${article.slug}`} className="no-underline">
          <h2 className="font-serif mt-4 text-balance text-3xl font-black leading-[1.08] transition group-hover:text-primary sm:text-4xl">{article.title}</h2>
        </Link>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{article.aiSummary}</p>
        {(article.clubName || location) ? <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">{article.clubName ? <span>{article.clubName}</span> : null}{location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span> : null}</div> : null}
        <Link href={`/articles/${article.slug}`} className="mt-6 inline-flex items-center gap-2 border-t pt-4 text-sm font-black text-primary no-underline">Read intelligence brief <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}

export function CompactArticleRow({ article, showCategory = true, inverse = false }: { article: ArticleWithRelations; showCategory?: boolean; inverse?: boolean }) {
  return (
    <article className={`group grid gap-2 border-b py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-start ${inverse ? "border-white/15" : ""}`}>
      <div>
        {showCategory ? <StoryMeta article={article} inverse={inverse} /> : <div className={`text-[11px] font-bold uppercase tracking-[.1em] ${inverse ? "text-white/50" : "text-muted-foreground"}`}>{article.source.name}</div>}
        <Link href={`/articles/${article.slug}`} className="no-underline"><h3 className={`mt-1 font-serif text-lg font-black leading-snug transition ${inverse ? "text-white group-hover:text-emerald-300" : "group-hover:text-primary"}`}>{article.title}</h3></Link>
      </div>
      <Link href={`/articles/${article.slug}`} aria-label={`Read ${article.title}`} className={`mt-1 hidden no-underline sm:block ${inverse ? "text-emerald-300" : "text-primary"}`}><ArrowRight className="h-4 w-4" /></Link>
    </article>
  );
}

export function SectionArticleCard({ article }: { article: ArticleWithRelations }) {
  const location = formatLocation(article.city, article.state);
  return (
    <article className="group flex h-full flex-col border bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg sm:p-6">
      <StoryMeta article={article} />
      <Link href={`/articles/${article.slug}`} className="no-underline"><h2 className="font-serif mt-3 text-2xl font-black leading-tight transition group-hover:text-primary">{article.title}</h2></Link>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.aiSummary}</p>
      {(article.clubName || location) ? <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">{article.clubName ? <span>{article.clubName}</span> : null}{location ? <span>{location}</span> : null}</div> : null}
      <Link href={`/articles/${article.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-black uppercase tracking-[.08em] text-primary no-underline">Read brief <ArrowRight className="h-3.5 w-3.5" /></Link>
    </article>
  );
}

export function ArticleCard({ article }: { article: ArticleWithRelations }) {
  return <SectionArticleCard article={article} />;
}
