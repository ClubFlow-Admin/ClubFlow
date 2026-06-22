import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import type { ArticleWithRelations } from "@/lib/articles";
import { imageForArticle, type ResolvedImage } from "@/lib/images";
import { estimateReadingMinutes, formatLocation } from "@/lib/utils";

function readingMinutesFor(article: ArticleWithRelations) {
  return estimateReadingMinutes(article.aiSummary, article.aiWhatHappened, article.aiWhyItMatters, article.aiIndustryContext);
}

function CategoryBadge({ name, inverse = false }: { name: string; inverse?: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-[.1em] ${inverse ? "bg-emerald-400/15 text-emerald-300" : "bg-primary/10 text-primary"}`}>
      {name}
    </span>
  );
}

function StoryMeta({ article, inverse = false }: { article: ArticleWithRelations; inverse?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[.1em] ${inverse ? "text-white/55" : "text-muted-foreground"}`}>
      <CategoryBadge name={article.category.name} inverse={inverse} />
      <span>{article.source.name}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt.toISOString()}>{format(article.publishedAt, "MMM d, yyyy")}</time>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{readingMinutesFor(article)} min</span>
    </div>
  );
}

export function FeaturedArticleCard({ article, priority = false, image }: { article: ArticleWithRelations; priority?: boolean; image?: ResolvedImage }) {
  const location = formatLocation(article.city, article.state);
  const resolved = image ?? imageForArticle(article, 1400, 1000);
  return (
    <article className="card-lift group grid overflow-hidden border bg-white lg:grid-cols-[1.08fr_.92fr]">
      <Link href={`/articles/${article.slug}`} className="relative block min-h-[280px] overflow-hidden no-underline sm:min-h-[400px]">
        <Image src={resolved.src} alt={resolved.alt} fill priority={priority} unoptimized sizes="(min-width:1024px) 52vw, 100vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute left-4 top-4"><CategoryBadge name={article.category.name} inverse /></div>
      </Link>
      <div className="flex flex-col justify-center p-6 sm:p-9">
        <StoryMeta article={article} />
        <Link href={`/articles/${article.slug}`} className="no-underline">
          <h2 className="font-serif mt-4 text-balance text-3xl font-black leading-[1.06] transition group-hover:text-primary sm:text-4xl">{article.title}</h2>
        </Link>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{article.dek || article.aiSummary}</p>
        {(article.clubName || location) ? <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">{article.clubName ? <span>{article.clubName}</span> : null}{location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span> : null}</div> : null}
        <Link href={`/articles/${article.slug}`} className="mt-6 inline-flex items-center gap-2 border-t pt-5 text-sm font-black text-primary no-underline transition group-hover:gap-3">Read intelligence brief <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </article>
  );
}

export function CompactArticleRow({ article, showCategory = true, inverse = false }: { article: ArticleWithRelations; showCategory?: boolean; inverse?: boolean }) {
  return (
    <article className={`group grid gap-2 border-b py-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-start ${inverse ? "border-white/15" : ""}`}>
      <div>
        {showCategory ? <StoryMeta article={article} inverse={inverse} /> : <div className={`text-[11px] font-bold uppercase tracking-[.1em] ${inverse ? "text-white/50" : "text-muted-foreground"}`}>{article.source.name}</div>}
        <Link href={`/articles/${article.slug}`} className="no-underline"><h3 className={`mt-1.5 font-serif text-lg font-black leading-snug transition ${inverse ? "text-white group-hover:text-emerald-300" : "group-hover:text-primary"}`}>{article.title}</h3></Link>
      </div>
      <Link href={`/articles/${article.slug}`} aria-label={`Read ${article.title}`} className={`mt-1 hidden no-underline transition sm:block ${inverse ? "text-emerald-300 group-hover:translate-x-0.5" : "text-primary group-hover:translate-x-0.5"}`}><ArrowRight className="h-4 w-4" /></Link>
    </article>
  );
}

export function SectionArticleCard({ article, image }: { article: ArticleWithRelations; image?: ResolvedImage }) {
  const location = formatLocation(article.city, article.state);
  const resolved = image ?? imageForArticle(article, 900, 600);
  return (
    <article className="card-lift group flex h-full flex-col overflow-hidden border bg-white">
      <Link href={`/articles/${article.slug}`} className="relative block h-44 overflow-hidden no-underline">
        <Image src={resolved.src} alt={resolved.alt} fill unoptimized sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-500 ease-out group-hover:scale-[1.05]" />
        <div className="absolute left-3 top-3"><CategoryBadge name={article.category.name} inverse /></div>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[.1em] text-muted-foreground">
          <span>{article.source.name}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt.toISOString()}>{format(article.publishedAt, "MMM d, yyyy")}</time>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{readingMinutesFor(article)} min</span>
        </div>
        <Link href={`/articles/${article.slug}`} className="no-underline"><h2 className="font-serif mt-2.5 text-2xl font-black leading-tight transition group-hover:text-primary">{article.title}</h2></Link>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.dek || article.aiSummary}</p>
        {(article.clubName || location) ? <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">{article.clubName ? <span>{article.clubName}</span> : null}{location ? <span>{location}</span> : null}</div> : null}
        <Link href={`/articles/${article.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-black uppercase tracking-[.08em] text-primary no-underline transition group-hover:gap-3">Read brief <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </article>
  );
}

export function ArticleCard({ article }: { article: ArticleWithRelations }) {
  return <SectionArticleCard article={article} />;
}
