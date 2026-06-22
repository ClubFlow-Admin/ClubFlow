import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clock, ExternalLink, Flag, Handshake, MapPin, PiggyBank, UserRoundPlus, Users, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { SectionArticleCard } from "@/components/article-card";
import { NewsletterForm } from "@/components/newsletter-form";
import type { ArticleWithRelations } from "@/lib/articles";
import { businessImpactForArticle, businessImpactSummary } from "@/lib/business-impact";
import { companyRoutePrefix } from "@/lib/entities";
import { imageForArticle, resolveArticleImages } from "@/lib/images";
import { estimateReadingMinutes, formatLocation, isValidExternalSourceUrl } from "@/lib/utils";

const DEFAULT_WHY_IT_MATTERS =
  "This development adds to the operating, investment, and leadership signals ClubFlow tracks across the private golf-club industry. Club leaders can use the brief to inform planning, benchmarking, and conversations with boards and partners.";

const DESK_ICON: Record<string, typeof Building2> = {
  "executive-moves": UserRoundPlus,
  "developments-renovations": Building2,
  technology: Wrench,
  "capital-investments": PiggyBank,
  "mergers-acquisitions": Handshake
};

type RelatedDesk = { slug: string; label: string; href: string; articles: ArticleWithRelations[] };

function Paragraphs({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return <>{paragraphs.map((paragraph, index) => <p key={index} className={className}>{paragraph}</p>)}</>;
}

export function ArticleBriefing({
  article,
  related,
  relatedDesks = [],
  sectionHref,
  banner
}: {
  article: ArticleWithRelations;
  related: ArticleWithRelations[];
  relatedDesks?: RelatedDesk[];
  sectionHref: string;
  banner?: ReactNode;
}) {
  const location = formatLocation(article.city, article.state);
  const whatHappened = article.aiWhatHappened || article.originalExcerpt;
  const whyItMatters = article.aiWhyItMatters || DEFAULT_WHY_IT_MATTERS;
  const hasRealSource = isValidExternalSourceUrl(article.originalUrl);
  const deck = article.dek || article.aiSummary.split(/(?<=[.!?])\s+/)[0];
  const keyTakeaways = article.aiKeyTakeaways.slice(0, 5);
  const businessImpact = businessImpactForArticle(article.tags);
  const readingMinutes = estimateReadingMinutes(article.aiSummary, whatHappened, whyItMatters, article.aiIndustryContext);
  const summaryParagraphs = article.aiSummary.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const whatHappenedParagraphs = whatHappened ? whatHappened.split(/\n+/).map((p) => p.trim()).filter(Boolean) : [];
  const pullQuote = keyTakeaways.length && whatHappenedParagraphs.length > 1 ? keyTakeaways[0] : null;
  const primaryTopic = article.tags[0] ?? null;
  const hasCompanies = article.companies.length > 0;
  const hasClubs = article.clubs.length > 0;
  const hasPeople = article.people.length > 0;
  const hasRelatedIntelligence = relatedDesks.length > 0 || hasCompanies || hasClubs || hasPeople || related.length > 0;
  const heroImage = imageForArticle(article, 1440, 960);
  const relatedImages = resolveArticleImages(related, 900, 600);

  const tocItems = [
    { id: "executive-brief", label: "Executive brief" },
    { id: "main-story", label: "Main story" },
    article.aiIndustryContext ? { id: "industry-context", label: "Industry context" } : null,
    businessImpact.length ? { id: "business-impact", label: "Business impact" } : null,
    hasRelatedIntelligence ? { id: "related-intelligence", label: "Related intelligence" } : null
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
          <div className="relative mx-auto mt-10 h-[280px] max-w-3xl overflow-hidden rounded-md border shadow-lg sm:h-[420px]"><Image src={heroImage.src} alt={heroImage.alt} fill priority unoptimized sizes="(min-width:1024px) 720px, 100vw" className="object-cover" /></div>
          {heroImage.credit ? <p className="mx-auto mt-2 max-w-3xl text-right text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{heroImage.credit}</p> : null}
        </div>
      </header>

      <section id="executive-brief" className="border-b bg-white">
        <div className="container-shell py-10 sm:py-12">
          <div className="mx-auto max-w-3xl">
            <div className="kicker">Executive brief</div>
            <div className="executive-brief-callout mt-4 grid gap-6 sm:grid-cols-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[.08em] text-primary">Why this matters</div>
                <p className="mt-2 text-sm leading-6 text-foreground/85">{whyItMatters.split(/\n+/)[0]}</p>
              </div>
              {keyTakeaways.length ? (
                <div>
                  <div className="text-xs font-black uppercase tracking-[.08em] text-primary">Key takeaway</div>
                  <p className="mt-2 text-sm leading-6 text-foreground/85">{keyTakeaways[0]}</p>
                </div>
              ) : null}
              <div>
                <div className="text-xs font-black uppercase tracking-[.08em] text-primary">Business impact</div>
                <p className="mt-2 text-sm leading-6 text-foreground/85">{businessImpactSummary(businessImpact)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-shell grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,720px)_280px] lg:justify-center lg:gap-14">
        <div className="mx-auto w-full max-w-[720px]">
          <div id="main-story" className="article-prose">
            <section>
              {summaryParagraphs.map((paragraph, index) => (
                <p key={index} className={index === 0 ? "drop-cap" : undefined}>{paragraph}</p>
              ))}
            </section>

            {keyTakeaways.length ? (
              <section className="mt-12">
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
              <section className="mt-12 with-divider">
                <h2 className="editorial-h2">What happened</h2>
                <p>{whatHappenedParagraphs[0]}</p>
                {pullQuote ? <blockquote className="pull-quote my-8">&ldquo;{pullQuote}&rdquo;</blockquote> : null}
                {whatHappenedParagraphs.slice(1).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </section>
            ) : null}

            {article.aiIndustryContext ? <section id="industry-context" className="mt-12 with-divider"><h2 className="editorial-h2">Industry context</h2><Paragraphs text={article.aiIndustryContext} /></section> : null}

            {businessImpact.length ? (
              <section id="business-impact" className="mt-12">
                <h2 className="editorial-h2">Business impact</h2>
                <div className="impact-panel mt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {businessImpact.map((area) => (
                      <div key={area.key}>
                        <div className="text-xs font-black uppercase tracking-[.08em] text-primary">{area.label}</div>
                        <p className="mt-1.5 text-sm leading-6 text-foreground/80">{area.tags.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {hasRealSource ? (
              <a href={article.originalUrl} target="_blank" rel="noreferrer" className="mt-12 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-3 text-sm font-black text-white no-underline">View original source <ExternalLink className="h-4 w-4" /></a>
            ) : (
              <p className="mt-12 inline-flex items-center gap-2 rounded-sm border border-dashed px-5 py-3 text-sm font-bold text-muted-foreground">Demo article — no external source available.</p>
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
            <div className="kicker">Key facts</div>
            <dl className="mt-4 divide-y text-sm">
              <Meta label="Category" value={article.category.name} />
              {hasCompanies ? <Meta label="Companies" value={article.companies.map((c) => c.name).join(", ")} /> : null}
              {article.clubName ? <Meta label="Club" value={article.clubName} /> : hasClubs ? <Meta label="Club" value={article.clubs.map((c) => c.name).join(", ")} /> : null}
              {location ? <Meta label="Location" value={location} /> : null}
              {primaryTopic ? <Meta label="Topic" value={primaryTopic} /> : null}
              {article.tags.length ? <Meta label="Tags" value={article.tags.join(", ")} /> : null}
              <Meta label="Reading time" value={`${readingMinutes} min`} />
              <Meta label="Published" value={format(article.publishedAt, "MMM d, yyyy")} />
            </dl>
            <div className="mt-5 border-t pt-5"><div className="text-xs font-black uppercase tracking-[.1em] text-muted-foreground">ClubFlow standard</div><p className="mt-2 text-xs leading-5 text-muted-foreground">Concise, decision-ready reporting focused exclusively on golf clubs, resorts, operators, and industry partners.</p></div>
          </div>
        </aside>
      </div>
    </article>

    {hasRelatedIntelligence ? (
      <section id="related-intelligence" className="border-y bg-muted/25">
        <div className="container-shell py-12 sm:py-16">
          <div className="section-rule"><div><div className="kicker">Related intelligence</div><h2 className="font-serif mt-1 text-3xl font-black">Continue the briefing.</h2></div><Link href={sectionHref} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-primary no-underline">Back to desk <ArrowRight className="h-3.5 w-3.5" /></Link></div>

          {relatedDesks.length ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedDesks.map((desk) => {
                const Icon = DESK_ICON[desk.slug] ?? Building2;
                return (
                  <div key={desk.slug} className="border bg-white p-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-primary"><Icon className="h-4 w-4" />{desk.label}</div>
                    <div className="mt-3 divide-y">
                      {desk.articles.map((item) => (
                        <Link key={item.id} href={`/articles/${item.slug}`} className="block py-2.5 no-underline first:pt-0 last:pb-0">
                          <h3 className="font-serif text-sm font-black leading-snug text-foreground transition hover:text-primary">{item.title}</h3>
                        </Link>
                      ))}
                    </div>
                    <Link href={desk.href} className="mt-3 inline-flex items-center gap-2 border-t pt-3 text-xs font-black uppercase tracking-[.06em] text-primary no-underline">View desk <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                );
              })}
            </div>
          ) : null}

          {hasCompanies || hasClubs || hasPeople ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {hasCompanies ? (
                <div>
                  <div className="kicker">Related companies</div>
                  <div className="mt-3 grid gap-3">
                    {article.companies.map((company) => <Link key={company.id} href={`${companyRoutePrefix(company.industry)}/${company.slug}`} className="entity-card block no-underline"><div className="flex items-center gap-2.5 text-sm font-black text-foreground"><Building2 className="h-4 w-4 text-primary" />{company.name}</div></Link>)}
                  </div>
                </div>
              ) : null}
              {hasClubs ? (
                <div>
                  <div className="kicker">Related clubs</div>
                  <div className="mt-3 grid gap-3">
                    {article.clubs.map((club) => <Link key={club.id} href={`/clubs/${club.slug}`} className="entity-card block no-underline"><div className="flex items-center gap-2.5 text-sm font-black text-foreground"><Flag className="h-4 w-4 text-primary" />{club.name}</div></Link>)}
                  </div>
                </div>
              ) : null}
              {hasPeople ? (
                <div>
                  <div className="kicker">Related executives</div>
                  <div className="mt-3 grid gap-3">
                    {article.people.map((person) => <Link key={person.id} href={`/executives/${person.slug}`} className="entity-card block no-underline"><div className="flex items-center gap-2.5 text-sm font-black text-foreground"><Users className="h-4 w-4 text-primary" />{person.firstName} {person.lastName}</div></Link>)}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {related.length ? (
            <div className="mt-8">
              <div className="kicker">Related articles</div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">{relatedImages.map(({ article: item, ...image }) => <SectionArticleCard key={item.id} article={item} image={image} />)}</div>
            </div>
          ) : null}
        </div>
      </section>
    ) : null}

    <section className="container-shell py-12"><div className="grid gap-6 bg-primary p-6 text-white sm:p-8 lg:grid-cols-[1fr_420px] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">The ClubFlow briefing</div><h2 className="font-serif mt-2 text-3xl font-black">Subscribe to the ClubFlow Briefing.</h2><p className="mt-2 text-sm leading-6 text-white/70">The week&apos;s leadership moves, capital projects, developments, jobs, and operating intelligence.</p><Link href={sectionHref} className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] text-emerald-200 no-underline">Explore related intelligence <ArrowRight className="h-3.5 w-3.5" /></Link></div><NewsletterForm /></div></section>
  </main>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="grid grid-cols-[90px_1fr] gap-3 py-3"><dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="font-bold">{value}</dd></div>; }
