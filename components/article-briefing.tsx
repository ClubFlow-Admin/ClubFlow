import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clock, ExternalLink, Flag, MapPin, Users } from "lucide-react";
import type { ReactNode } from "react";
import { SectionArticleCard } from "@/components/article-card";
import { NewsletterForm } from "@/components/newsletter-form";
import type { ArticleWithRelations } from "@/lib/articles";
import { imageForArticle } from "@/lib/images";
import { impactAreasForTags } from "@/lib/impact";
import { estimateReadingMinutes, formatLocation, isValidExternalSourceUrl } from "@/lib/utils";

const DEFAULT_WHY_IT_MATTERS =
  "This development adds to the operating, investment, and leadership signals ClubFlow tracks across the private golf-club industry. Club leaders can use the brief to inform planning, benchmarking, and conversations with boards and partners.";

function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return <>{paragraphs.map((paragraph, index) => <p key={index} className={className}>{paragraph}</p>)}</>;
}

export function ArticleBriefing({
  article,
  related,
  sectionHref,
  banner
}: {
  article: ArticleWithRelations;
  related: ArticleWithRelations[];
  sectionHref: string;
  banner?: ReactNode;
}) {
  const location = formatLocation(article.city, article.state);
  const whatHappened = article.aiWhatHappened || article.originalExcerpt;
  const whyItMatters = article.aiWhyItMatters || DEFAULT_WHY_IT_MATTERS;
  const hasRealSource = isValidExternalSourceUrl(article.originalUrl);
  const deck = article.dek || article.aiSummary.split(/(?<=[.!?])\s+/)[0];
  const keyTakeaways = article.aiKeyTakeaways.slice(0, 5);
  const impactAreas = impactAreasForTags(article.tags);
  const readingMinutes = estimateReadingMinutes(article.aiSummary, whatHappened, whyItMatters, article.aiIndustryContext);
  const whatHappenedParagraphs = whatHappened ? whatHappened.split(/\n+/).map((p) => p.trim()).filter(Boolean) : [];
  const pullQuote = keyTakeaways.length && whatHappenedParagraphs.length > 1 ? keyTakeaways[0] : null;
  const hasEntities = Boolean(article.companies.length || article.clubs.length || article.people.length);

  const tocItems = [
    { id: "executive-summary", label: "Executive summary" },
    keyTakeaways.length ? { id: "key-takeaways", label: "Key takeaways" } : null,
    whatHappened ? { id: "what-happened", label: "What happened" } : null,
    article.aiIndustryContext ? { id: "industry-context", label: "Industry context" } : null,
    impactAreas.length ? { id: "financial-impact", label: "Financial & operational impact" } : null,
    { id: "why-it-matters", label: "Why it matters" },
    hasEntities ? { id: "related-entities", label: "Related companies, clubs & executives" } : null
  ].filter(Boolean) as { id: string; label: string }[];

  return <main className="bg-background">
    {banner}
    <article>
      <header className="border-b bg-white">
        <div className="container-shell py-12 sm:py-16">
          <Link href={sectionHref} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.09em] text-primary no-underline"><ArrowLeft className="h-3.5 w-3.5" /> Back to {article.category.name}</Link>
          <div className="mx-auto mt-9 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.11em] text-primary"><span>{article.category.name}</span><span className="text-muted-foreground">/</span><span className="text-muted-foreground">Intelligence brief</span></div>
            <h1 className="font-serif mt-5 text-balance text-4xl font-black leading-[1.05] sm:text-5xl lg:text-[3.5rem]">{article.title}</h1>
            {deck ? <p className="mt-6 text-balance text-xl leading-8 text-muted-foreground sm:text-2xl">{deck}</p> : null}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-6 text-xs font-bold uppercase tracking-[.08em] text-muted-foreground">
              <time dateTime={article.publishedAt.toISOString()}>{format(article.publishedAt, "MMMM d, yyyy")}</time>
              <span>Source: {article.source.name}</span>
              <span>{article.category.name}</span>
              {location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span> : null}
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{readingMinutes} min read</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-shell grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,720px)_280px] lg:justify-center lg:gap-14">
        <div className="mx-auto w-full max-w-[720px]">
          <div className="relative h-[280px] overflow-hidden rounded-md border shadow-lg sm:h-[460px]"><Image src={imageForArticle(article)} alt="" fill priority unoptimized sizes="(min-width:1024px) 720px, 100vw" className="object-cover" /></div>

          <div className="article-prose mt-14">
            <section id="executive-summary">
              <div className="kicker">Executive summary</div>
              <div className="premium-callout mt-4"><Paragraphs text={article.aiSummary} /></div>
            </section>

            {keyTakeaways.length ? (
              <section id="key-takeaways" className="mt-12">
                <div className="kicker">Key takeaways</div>
                <div className="takeaway-panel mt-4">
                  <ul className="grid gap-3.5">
                    {keyTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-3 text-[16px] leading-7 text-amber-950">
                        <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-amber-700" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {whatHappenedParagraphs.length ? (
              <section id="what-happened" className="mt-12 with-divider">
                <h2 className="editorial-h2">What happened</h2>
                <p>{whatHappenedParagraphs[0]}</p>
                {pullQuote ? <blockquote className="pull-quote my-8">&ldquo;{pullQuote}&rdquo;</blockquote> : null}
                {whatHappenedParagraphs.slice(1).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </section>
            ) : null}

            {article.aiIndustryContext ? <section id="industry-context" className="mt-12 with-divider"><h2 className="editorial-h2">Industry context</h2><Paragraphs text={article.aiIndustryContext} /></section> : null}

            {impactAreas.length ? (
              <section id="financial-impact" className="mt-12">
                <h2 className="editorial-h2">Financial &amp; operational impact</h2>
                <div className="impact-panel mt-4">
                  <div className="flex flex-wrap gap-2.5">
                    {impactAreas.map((area) => <span key={area.key} className="border border-primary/20 bg-primary/[.06] px-3 py-1.5 text-xs font-black uppercase tracking-[.06em] text-primary">{area.label}</span>)}
                  </div>
                </div>
              </section>
            ) : null}

            <section id="why-it-matters" className="mt-12 with-divider"><h2 className="editorial-h2">Why it matters</h2><Paragraphs text={whyItMatters} /></section>

            {hasEntities ? (
              <section id="related-entities" className="mt-12">
                {article.companies.length ? (
                  <div className="mb-8">
                    <h2 className="editorial-h2">Related companies</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {article.companies.map((company) => <div key={company.id} className="entity-card"><div className="flex items-center gap-2.5 text-sm font-black"><Building2 className="h-4 w-4 text-primary" />{company.name}</div></div>)}
                    </div>
                  </div>
                ) : null}

                {article.clubs.length ? (
                  <div className="mb-8">
                    <h2 className="editorial-h2">Related clubs</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {article.clubs.map((club) => <div key={club.id} className="entity-card"><div className="flex items-center gap-2.5 text-sm font-black"><Flag className="h-4 w-4 text-primary" />{club.name}</div></div>)}
                    </div>
                  </div>
                ) : null}

                {article.people.length ? (
                  <div>
                    <h2 className="editorial-h2">Related executives</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {article.people.map((person) => <div key={person.id} className="entity-card"><div className="flex items-center gap-2.5 text-sm font-black"><Users className="h-4 w-4 text-primary" />{person.firstName} {person.lastName}</div></div>)}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            <div className="mt-12 flex flex-wrap gap-2 border-t pt-8">{article.tags.map((tag) => <span key={tag} className="border bg-white px-2.5 py-1 text-xs font-bold text-muted-foreground">{tag}</span>)}</div>
            {hasRealSource ? (
              <a href={article.originalUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-3 text-sm font-black text-white no-underline">View original source <ExternalLink className="h-4 w-4" /></a>
            ) : (
              <p className="mt-8 inline-flex items-center gap-2 rounded-sm border border-dashed px-5 py-3 text-sm font-bold text-muted-foreground">Demo article — no external source available.</p>
            )}
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-5 lg:sticky lg:top-5">
          {tocItems.length > 1 ? (
            <nav className="hidden border-t-4 border-primary bg-white p-5 lg:block">
              <div className="kicker">On this brief</div>
              <ul className="mt-3 grid gap-2 text-sm">
                {tocItems.map((item) => <li key={item.id}><a href={`#${item.id}`} className="font-semibold text-foreground/80 no-underline hover:text-primary">{item.label}</a></li>)}
              </ul>
            </nav>
          ) : null}

          <div className="border-t-4 border-primary bg-white p-5">
            <div className="kicker">Briefing data</div>
            <dl className="mt-4 divide-y text-sm">
              <Meta label="Desk" value={article.category.name} />
              <Meta label="Source" value={article.source.name} />
              <Meta label="Published" value={format(article.publishedAt, "MMM d, yyyy")} />
              <Meta label="Read time" value={`${readingMinutes} min`} />
              <Meta label="Relevance score" value={`${article.importanceScore}/100`} />
              {location ? <Meta label="Location" value={location} /> : null}
            </dl>
            <div className="mt-5 border-t pt-5"><div className="text-xs font-black uppercase tracking-[.1em] text-muted-foreground">ClubFlow standard</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Concise, decision-ready reporting focused exclusively on golf clubs, resorts, operators, and industry partners.</p></div>
          </div>

          {related.length ? (
            <div className="border bg-white p-5">
              <div className="kicker">Up next on this desk</div>
              <div className="mt-3 divide-y">
                {related.map((item) => (
                  <Link key={item.id} href={`/articles/${item.slug}`} className="block py-3 no-underline first:pt-3 last:pb-0">
                    <h3 className="font-serif text-sm font-black leading-snug text-foreground transition hover:text-primary">{item.title}</h3>
                    <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{item.source.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </article>

    {related.length ? <section className="border-y bg-white"><div className="container-shell py-12"><div className="section-rule"><div><div className="kicker">Continue the briefing</div><h2 className="font-serif mt-1 text-3xl font-black">Related stories</h2></div><Link href={sectionHref} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-primary no-underline">Back to desk <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="mt-6 grid gap-4 md:grid-cols-3">{related.map((item) => <SectionArticleCard key={item.id} article={item} />)}</div></div></section> : null}
    <section className="container-shell py-12"><div className="grid gap-6 bg-primary p-6 text-white sm:p-8 lg:grid-cols-[1fr_420px] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">The ClubFlow briefing</div><h2 className="font-serif mt-2 text-3xl font-black">Get the private club industry brief in your inbox.</h2><p className="mt-2 text-sm leading-6 text-white/70">The week&apos;s leadership moves, capital projects, developments, jobs, and operating intelligence.</p></div><NewsletterForm /></div></section>
  </main>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[90px_1fr] gap-3 py-3"><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="font-bold">{value}</dd></div>; }
