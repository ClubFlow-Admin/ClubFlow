import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, MapPin } from "lucide-react";
import { SectionArticleCard } from "@/components/article-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { getArticles, getPublishedArticleBySlug } from "@/lib/articles";
import { publicHrefForCategory } from "@/lib/categories";
import { imageForArticle } from "@/lib/images";
import { formatLocation } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DEFAULT_WHY_IT_MATTERS =
  "This development adds to the operating, investment, and leadership signals ClubFlow tracks across the private golf-club industry. Club leaders can use the brief to inform planning, benchmarking, and conversations with boards and partners.";

function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return <>{paragraphs.map((paragraph, index) => <p key={index} className={className}>{paragraph}</p>)}</>;
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getPublishedArticleBySlug(id);
  if (!article) notFound();

  const related = (await getArticles({ category: article.category.slug, status: "published" })).filter((item) => item.id !== article.id).slice(0, 3);
  const sectionHref = publicHrefForCategory(article.category.slug);
  const location = formatLocation(article.city, article.state);
  const whatHappened = article.aiWhatHappened || article.originalExcerpt;
  const whyItMatters = article.aiWhyItMatters || DEFAULT_WHY_IT_MATTERS;

  return <main>
    <article>
      <header className="border-b bg-white">
        <div className="container-shell py-10 sm:py-14">
          <Link href={sectionHref} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.09em] text-primary no-underline"><ArrowLeft className="h-3.5 w-3.5" /> Back to {article.category.name}</Link>
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.11em] text-primary"><span>{article.category.name}</span><span className="text-muted-foreground">/</span><span className="text-muted-foreground">Intelligence brief</span></div>
            <h1 className="font-serif mt-4 text-balance text-4xl font-black leading-[1.05] sm:text-5xl lg:text-[3.25rem]">{article.title}</h1>
            {article.dek ? <p className="mt-4 text-balance text-xl leading-8 text-muted-foreground">{article.dek}</p> : null}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-5 text-xs font-bold uppercase tracking-[.08em] text-muted-foreground">
              <span>By {article.author || "ClubFlow Intelligence Desk"}</span>
              <time dateTime={article.publishedAt.toISOString()}>{format(article.publishedAt, "MMMM d, yyyy")}</time>
              <span>Source: {article.source.name}</span>
              {article.clubName ? <span>{article.clubName}</span> : null}
              {location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span> : null}
            </div>
          </div>
        </div>
      </header>

      <div className="container-shell grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,680px)_280px] lg:justify-center lg:gap-12">
        <div className="mx-auto w-full max-w-[680px]">
          <div className="relative h-[260px] overflow-hidden border sm:h-[420px]"><Image src={imageForArticle(article)} alt="" fill priority unoptimized sizes="(min-width:1024px) 680px, 100vw" className="object-cover" /></div>

          <div className="article-prose mt-10">
            <div className="border-l-4 border-primary bg-white py-1 pl-5 sm:pl-6">
              <div className="kicker">Executive summary</div>
              <Paragraphs text={article.aiSummary} className="mt-3 text-lg font-medium leading-8 text-foreground" />
            </div>

            {whatHappened ? <section className="mt-10"><h2>What happened</h2><Paragraphs text={whatHappened} /></section> : null}

            <section className="mt-10"><h2>Why it matters</h2><Paragraphs text={whyItMatters} /></section>

            {article.aiKeyTakeaways.length ? (
              <aside className="mt-10 rounded-md border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
                <div className="text-xs font-black uppercase tracking-[.12em] text-amber-800">Key takeaways</div>
                <ul className="mt-3 grid gap-2.5">
                  {article.aiKeyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-[15px] leading-7 text-amber-950">
                      <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-amber-700" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}

            {article.aiIndustryContext ? <section className="mt-10"><h2>Industry context</h2><Paragraphs text={article.aiIndustryContext} /></section> : null}

            <div className="mt-10 flex flex-wrap gap-2 border-t pt-8">{article.tags.map((tag) => <span key={tag} className="border bg-white px-2.5 py-1 text-xs font-bold text-muted-foreground">{tag}</span>)}</div>
            <a href={article.originalUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-3 text-sm font-black text-white no-underline">View original source <ExternalLink className="h-4 w-4" /></a>
          </div>
        </div>

        <aside className="h-fit border-t-4 border-primary bg-white p-5 lg:sticky lg:top-5">
          <div className="kicker">Briefing data</div>
          <dl className="mt-4 divide-y text-sm">
            <Meta label="Desk" value={article.category.name} />
            <Meta label="Source" value={article.source.name} />
            <Meta label="Published" value={format(article.publishedAt, "MMM d, yyyy")} />
            <Meta label="Relevance score" value={`${article.importanceScore}/100`} />
            {location ? <Meta label="Location" value={location} /> : null}
          </dl>
          {article.clubs.length || article.companies.length || article.people.length ? (
            <div className="mt-5 border-t pt-5">
              <div className="text-xs font-black uppercase tracking-[.1em] text-muted-foreground">Mentioned</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {article.clubs.map((club) => <span key={club.id} className="border bg-muted/40 px-2 py-1 text-xs font-bold">{club.name}</span>)}
                {article.companies.map((company) => <span key={company.id} className="border bg-muted/40 px-2 py-1 text-xs font-bold">{company.name}</span>)}
                {article.people.map((person) => <span key={person.id} className="border bg-muted/40 px-2 py-1 text-xs font-bold">{person.firstName} {person.lastName}</span>)}
              </div>
            </div>
          ) : null}
          <div className="mt-5 border-t pt-5"><div className="text-xs font-black uppercase tracking-[.1em] text-muted-foreground">ClubFlow standard</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Concise, decision-ready reporting focused exclusively on golf clubs, resorts, operators, and industry partners.</p></div>
        </aside>
      </div>
    </article>

    {related.length ? <section className="border-y bg-white"><div className="container-shell py-10"><div className="section-rule"><div><div className="kicker">Continue the briefing</div><h2 className="font-serif mt-1 text-3xl font-black">Related stories</h2></div><Link href={sectionHref} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-primary no-underline">Back to desk <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="mt-6 grid gap-4 md:grid-cols-3">{related.map((item) => <SectionArticleCard key={item.id} article={item} />)}</div></div></section> : null}
    <section className="container-shell py-10"><div className="grid gap-6 bg-primary p-6 text-white sm:p-8 lg:grid-cols-[1fr_420px] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">The ClubFlow briefing</div><h2 className="font-serif mt-2 text-3xl font-black">Get the private club industry brief in your inbox.</h2><p className="mt-2 text-sm leading-6 text-white/70">The week&apos;s leadership moves, capital projects, developments, jobs, and operating intelligence.</p></div><NewsletterForm /></div></section>
  </main>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[90px_1fr] gap-3 py-3"><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="font-bold">{value}</dd></div>; }
