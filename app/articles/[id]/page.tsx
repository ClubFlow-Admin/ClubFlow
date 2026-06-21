import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, ExternalLink, MapPin } from "lucide-react";
import { SectionArticleCard } from "@/components/article-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { getArticles, getPublishedArticleBySlug } from "@/lib/articles";
import { publicHrefForCategory } from "@/lib/categories";
import { imageForArticle } from "@/lib/images";
import { formatLocation } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getPublishedArticleBySlug(id);
  if (!article) notFound();

  const related = (await getArticles({ category: article.category.slug, status: "published" })).filter((item) => item.id !== article.id).slice(0, 3);
  const sectionHref = publicHrefForCategory(article.category.slug);
  const location = formatLocation(article.city, article.state);

  return <main>
    <article>
      <header className="border-b bg-white"><div className="container-shell py-8 sm:py-12"><Link href={sectionHref} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.09em] text-primary no-underline"><ArrowLeft className="h-3.5 w-3.5" /> Back to {article.category.name}</Link><div className="mt-8 max-w-5xl"><div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.11em] text-primary"><span>{article.category.name}</span><span className="text-muted-foreground">/</span><span className="text-muted-foreground">Intelligence brief</span></div><h1 className="font-serif mt-4 text-balance text-4xl font-black leading-[1.02] sm:text-6xl">{article.title}</h1><p className="mt-5 max-w-4xl text-lg leading-8 text-muted-foreground sm:text-xl">{article.aiSummary}</p><div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4 text-xs font-bold uppercase tracking-[.08em] text-muted-foreground"><span>By {article.author || "ClubFlow Intelligence Desk"}</span><time dateTime={article.publishedAt.toISOString()}>{format(article.publishedAt, "MMMM d, yyyy")}</time><span>Source: {article.source.name}</span>{article.clubName ? <span>{article.clubName}</span> : null}{location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span> : null}</div></div></div></header>

      <div className="container-shell grid gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,760px)_280px] lg:justify-center">
        <div><div className="relative h-[260px] overflow-hidden border sm:h-[430px]"><Image src={imageForArticle(article)} alt="" fill priority unoptimized sizes="(min-width:1024px) 760px, 100vw" className="object-cover" /></div><div className="article-prose mt-8"><div className="border-l-4 border-primary bg-white p-5 sm:p-6"><div className="kicker">Executive summary</div><p className="mt-3 text-lg font-semibold leading-8">{article.aiSummary}</p></div>{article.originalExcerpt ? <section className="mt-8"><h2>What happened</h2><p>{article.originalExcerpt}</p></section> : null}<section className="mt-8"><h2>Why it matters</h2><p>This development adds to the operating, investment, and leadership signals ClubFlow tracks across the private golf-club industry. Club leaders can use the brief to inform planning, benchmarking, and conversations with boards and partners.</p></section><div className="mt-8 flex flex-wrap gap-2">{article.tags.map((tag) => <span key={tag} className="border bg-white px-2.5 py-1 text-xs font-bold text-muted-foreground">{tag}</span>)}</div><a href={article.originalUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-3 text-sm font-black text-white no-underline">View original source <ExternalLink className="h-4 w-4" /></a></div></div>
        <aside className="h-fit border-t-4 border-primary bg-white p-5 lg:sticky lg:top-5"><div className="kicker">Briefing data</div><dl className="mt-4 divide-y text-sm"><Meta label="Desk" value={article.category.name} /><Meta label="Source" value={article.source.name} /><Meta label="Published" value={format(article.publishedAt, "MMM d, yyyy")} /><Meta label="Relevance score" value={`${article.importanceScore}/100`} />{location ? <Meta label="Location" value={location} /> : null}</dl><div className="mt-6 border-t pt-5"><div className="text-xs font-black uppercase tracking-[.1em] text-muted-foreground">ClubFlow standard</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Concise, decision-ready reporting focused exclusively on golf clubs, resorts, operators, and industry partners.</p></div></aside>
      </div>
    </article>

    {related.length ? <section className="border-y bg-white"><div className="container-shell py-10"><div className="section-rule"><div><div className="kicker">Continue the briefing</div><h2 className="font-serif mt-1 text-3xl font-black">Related stories</h2></div><Link href={sectionHref} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-primary no-underline">Back to desk <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="mt-6 grid gap-4 md:grid-cols-3">{related.map((item) => <SectionArticleCard key={item.id} article={item} />)}</div></div></section> : null}
    <section className="container-shell py-10"><div className="grid gap-6 bg-primary p-6 text-white sm:p-8 lg:grid-cols-[1fr_420px] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">The ClubFlow briefing</div><h2 className="font-serif mt-2 text-3xl font-black">Get the private club industry brief in your inbox.</h2><p className="mt-2 text-sm leading-6 text-white/70">The week&apos;s leadership moves, capital projects, developments, jobs, and operating intelligence.</p></div><NewsletterForm /></div></section>
  </main>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[90px_1fr] gap-3 py-3"><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="font-bold">{value}</dd></div>; }
