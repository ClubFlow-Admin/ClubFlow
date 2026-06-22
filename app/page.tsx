import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, BriefcaseBusiness, Building2, Clock, Compass, Flame, Handshake, Headphones, MapPin, Newspaper, PiggyBank, Trophy, UserRoundPlus, Wrench } from "lucide-react";
import { CompactArticleRow } from "@/components/article-card";
import { DailyBrief } from "@/components/daily-brief";
import { NewsletterForm } from "@/components/newsletter-form";
import { getArticles } from "@/lib/articles";
import { clubFlowTake } from "@/lib/executive-brief";
import { imageForArticle } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { estimateReadingMinutes, formatLocation } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SECTION_DIRECTORY = [
  { icon: Newspaper, label: "Industry", description: "Market, membership, and governance signals.", href: "/industry" },
  { icon: Building2, label: "Developments", description: "Clubhouse, course, and amenity projects.", href: "/developments" },
  { icon: UserRoundPlus, label: "Executive Moves", description: "Leadership appointments and transitions.", href: "/executive-moves" },
  { icon: BriefcaseBusiness, label: "Jobs", description: "Open roles across private clubs.", href: "/jobs" },
  { icon: Wrench, label: "Technology", description: "Software, data, and operating systems.", href: "/technology" },
  { icon: Handshake, label: "Mergers & Acquisitions", description: "Ownership changes and management deals.", href: "/mergers-acquisitions" },
  { icon: PiggyBank, label: "Capital Investments", description: "Capital plans and major asset spending.", href: "/capital-investments" },
  { icon: Trophy, label: "Club Rankings", description: "Lists, benchmarks, and watchlists.", href: "/club-rankings" },
  { icon: Headphones, label: "Podcasts", description: "Conversations with club industry leaders.", href: "/podcasts" },
  { icon: Compass, label: "ClubOpsPro", description: "Consulting, playbooks, and implementation.", href: "/clubopspro" }
] as const;

export default async function HomePage() {
  const [articles, jobs, moves, rankings, podcasts, jobCount, moveCount] = await Promise.all([
    getArticles({ status: "published" }),
    prisma.jobPosting.findMany({ where: { status: "published" }, orderBy: { postedAt: "desc" }, take: 3 }),
    prisma.executiveMove.findMany({ where: { status: "published" }, orderBy: [{ effectiveAt: "desc" }, { updatedAt: "desc" }], take: 3 }),
    prisma.rankingEntry.findMany({ where: { status: "published" }, orderBy: [{ category: "asc" }, { rank: "asc" }], take: 3 }),
    prisma.podcastEpisode.findMany({ where: { status: "published" }, orderBy: { createdAt: "asc" }, take: 3 }),
    prisma.jobPosting.count({ where: { status: "published" } }),
    prisma.executiveMove.count({ where: { status: "published" } })
  ]);

  // The hero leads with the biggest Industry story (the desk that matters most to club leaders day to day);
  // only falls back to the overall top story when Industry has nothing published yet.
  const heroArticle = articles.find((article) => article.category.slug === "industry-news") ?? articles[0];
  const remaining = heroArticle ? articles.filter((article) => article.id !== heroArticle.id) : articles;
  const ticker = articles.slice(0, 8);
  const byCategory = (slug: string, count = 3) => remaining.filter((article) => article.category.slug === slug).slice(0, count);
  const industryPreview = byCategory("industry-news");
  const developmentsPreview = byCategory("developments-renovations");
  const technologyPreview = byCategory("technology");
  const dealsPreview = byCategory("mergers-acquisitions");
  const capitalPreview = byCategory("capital-investments");

  // Snapshot counts reuse the articles/jobs/moves already fetched above — no extra article queries.
  const capitalCount = articles.filter((article) => article.category.slug === "capital-investments").length;
  const technologyCount = articles.filter((article) => article.category.slug === "technology").length;
  const dealsCount = articles.filter((article) => article.category.slug === "mergers-acquisitions").length;

  const heroLocation = heroArticle ? formatLocation(heroArticle.city, heroArticle.state) : "";
  const heroImage = heroArticle ? imageForArticle(heroArticle, 1400, 1000) : null;
  const heroReadingMinutes = heroArticle ? estimateReadingMinutes(heroArticle.aiSummary, heroArticle.aiWhatHappened, heroArticle.aiWhyItMatters, heroArticle.aiIndustryContext) : 0;
  const todaysTake = clubFlowTake({ capital: capitalCount, moves: moveCount, jobs: jobCount, technology: technologyCount, deals: dealsCount });

  return <main>
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(52,211,153,.12),transparent_65%)]" />
      {heroArticle && heroImage ? (
        <div className="container-shell relative grid gap-8 py-10 sm:py-14 lg:grid-cols-[7fr_3fr] lg:items-start">
          <Link href={`/articles/${heroArticle.slug}?from=home`} className="fade-up group block no-underline">
            <div className="relative h-[220px] overflow-hidden rounded-sm sm:h-[340px] lg:h-[420px]">
              <Image src={heroImage.src} alt={heroImage.alt} fill priority unoptimized sizes="(min-width:1024px) 65vw, 100vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute left-4 top-4"><span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-[.1em] bg-emerald-400/15 text-emerald-300">{heroArticle.category.name}</span></div>
            </div>
            <h2 className="font-serif mt-5 text-balance text-3xl font-black leading-[1.05] transition group-hover:text-emerald-300 sm:text-4xl lg:text-5xl">{heroArticle.title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">{heroArticle.dek || heroArticle.aiSummary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-[.08em] text-white/55">
              <time dateTime={heroArticle.publishedAt.toISOString()}>{format(heroArticle.publishedAt, "MMM d, yyyy")}</time>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{heroReadingMinutes} min read</span>
              {heroArticle.clubName ? <><span aria-hidden="true">·</span><span>{heroArticle.clubName}</span></> : null}
              {heroLocation ? <><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{heroLocation}</span></> : null}
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-emerald-300 no-underline transition group-hover:gap-3">Read Intelligence Brief <ArrowRight className="h-4 w-4" /></span>
          </Link>
          <div className="fade-up border border-white/15 bg-white/[.035] p-6 sm:p-7">
            <div className="text-xs font-black uppercase tracking-[.15em] text-emerald-300">Today&apos;s Executive Brief</div>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[.1em] text-white/45">What We&apos;re Seeing Today</p>
            <div className="mt-6 divide-y divide-white/10">
              <BriefRow label="Capital Investment" detail={`${capitalCount} projects announced`} />
              <BriefRow label="Leadership" detail={`${moveCount} executive appointments`} />
              <BriefRow label="Hiring" detail={`${jobCount} leadership openings`} />
              <BriefRow label="Technology" detail={`${technologyCount} technology stories`} />
              <BriefRow label="M&A" detail={`${dealsCount} acquisitions`} />
            </div>
            <div className="mt-6 border-t border-white/15 pt-5">
              <div className="text-[10px] font-black uppercase tracking-[.1em] text-emerald-300">ClubFlow Take</div>
              <p className="mt-2 text-sm leading-6 text-white/75">{todaysTake}</p>
            </div>
          </div>
        </div>
      ) : null}
      {ticker.length ? (
        <div className="relative border-t border-white/10 bg-black/25">
          <div className="overflow-hidden py-2.5">
            <div className="ticker-track">
              {[...ticker, ...ticker].map((article, index) => (
                <Link key={`${article.id}-${index}`} href={`/articles/${article.slug}?from=home`} className="flex items-center gap-2 whitespace-nowrap px-6 text-xs font-bold text-white/75 no-underline hover:text-emerald-300">
                  <span className="flex items-center gap-1 text-emerald-300"><Flame className="h-3 w-3" /> BREAKING</span>
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>

    <DailyBrief articles={remaining} />

    <section className="border-b bg-muted/25"><div className="container-shell py-9 sm:py-11">
      <div className="section-rule"><div><div className="kicker">Section directory</div><h2 className="font-serif mt-1 text-3xl font-black">Jump straight into any desk.</h2></div></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SECTION_DIRECTORY.map((section)=><SectionDirectoryCard key={section.href} {...section} />)}
      </div>
    </div></section>

    <section className="bg-white"><div className="container-shell py-9 sm:py-11">
      <div className="section-rule"><div><div className="kicker">The newsroom</div><h2 className="font-serif mt-1 text-3xl font-black">Every desk, at a glance.</h2></div></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SectionPreviewPanel icon={Newspaper} eyebrow="Market watch" title="Industry" href="/industry">
          {industryPreview.length ? industryPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} from="home" />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={Building2} eyebrow="Capital projects" title="Developments" href="/developments">
          {developmentsPreview.length ? developmentsPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} from="home" />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={UserRoundPlus} eyebrow="Leadership" title="Executive Moves" href="/executive-moves">
          {moves.length ? moves.map((move)=><div key={move.id} className="grid grid-cols-[1fr_auto] gap-3 border-b py-2.5 last:border-0"><div><div className="font-serif text-base font-black leading-snug">{move.executive}</div><div className="mt-1 text-xs font-bold text-primary">{move.newRole} · {move.clubName}</div></div></div>) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={BriefcaseBusiness} eyebrow="Talent market" title="Jobs" href="/jobs">
          {jobs.length ? jobs.map((job)=><div key={job.id} className="border-b py-2.5 last:border-0"><div className="font-serif text-base font-black leading-snug">{job.title}</div><div className="mt-1 text-xs font-bold text-primary">{job.clubName} · {[job.city,job.state].filter(Boolean).join(", ")}</div></div>) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={Wrench} eyebrow="Systems & data" title="Technology" href="/technology">
          {technologyPreview.length ? technologyPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} from="home" />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={Handshake} eyebrow="Deal desk" title="Mergers & Acquisitions" href="/mergers-acquisitions">
          {dealsPreview.length ? dealsPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} from="home" />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={PiggyBank} eyebrow="Capital monitor" title="Capital Investments" href="/capital-investments">
          {capitalPreview.length ? capitalPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} from="home" />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={Trophy} eyebrow="Rankings & watchlists" title="Club Rankings" href="/club-rankings">
          {rankings.length ? rankings.map((entry)=><div key={entry.id} className="flex gap-3 border-b py-2.5 last:border-0"><span className="number-tabular w-6 text-lg font-black text-primary">{entry.rank}</span><div><div className="font-black leading-snug">{entry.clubName}</div><div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{entry.category}</div></div></div>) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={Headphones} eyebrow="Audio briefings" title="Podcasts" href="/podcasts">
          {podcasts.length ? podcasts.map((episode)=><div key={episode.id} className="border-b py-2.5 last:border-0"><div className="font-serif text-base font-black leading-snug">{episode.title}</div><div className="mt-1 text-xs font-bold text-primary">{episode.showName}{episode.comingSoon?" · Coming soon":""}</div></div>) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={Compass} eyebrow="Consulting partner" title="ClubOpsPro" href="/clubopspro" ctaLabel="Explore ClubOpsPro">
          <p className="py-2.5 text-sm leading-6 text-muted-foreground">Consulting, playbooks, SOPs, and implementation support that turns ClubFlow&apos;s signal into action inside your operation.</p>
        </SectionPreviewPanel>
      </div>
    </div></section>

    <section className="border-t bg-white"><div className="container-shell py-9 sm:py-11"><div className="grid gap-8 bg-primary p-6 text-white sm:p-8 lg:grid-cols-[1fr_440px] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.16em] text-emerald-200">The ClubFlow Briefing</div><h2 className="font-serif mt-2 text-3xl font-black">Get the private club industry brief in your inbox.</h2><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/70">{["Weekly industry recap","Executive moves","Capital projects","New developments","Jobs & leadership opportunities"].map((item)=><span key={item}>✓ {item}</span>)}</div></div><NewsletterForm /></div></div></section>
  </main>;
}

function BriefRow({label,detail}:{label:string;detail:string}) { return <div className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0"><span className="text-sm font-bold text-white/85">{label}</span><span className="text-xs text-white/50">{detail}</span></div>; }
function MoreLink({href,label,inverse=false}:{href:string;label:string;inverse?:boolean}) { return <Link href={href} className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] no-underline ${inverse?"text-emerald-300":"text-primary"}`}>{label}<ArrowRight className="h-3.5 w-3.5" /></Link>; }
function EmptyPreview() { return <p className="py-4 text-sm text-muted-foreground">Nothing published in this desk yet.</p>; }
function SectionDirectoryCard({icon:Icon,label,description,href}:{icon:typeof Newspaper;label:string;description:string;href:string}) {
  return <Link href={href} className="card-lift group flex flex-col gap-3 border bg-white p-5 no-underline">
    <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white"><Icon className="h-4.5 w-4.5" /></span>
    <span className="font-serif text-base font-black leading-snug text-foreground transition group-hover:text-primary">{label}</span>
    <span className="text-xs leading-5 text-muted-foreground">{description}</span>
  </Link>;
}
function SectionPreviewPanel({icon:Icon,eyebrow,title,href,ctaLabel="View all",children}:{icon:typeof Newspaper;eyebrow:string;title:string;href:string;ctaLabel?:string;children:React.ReactNode}) {
  return <section className="card-lift flex flex-col border bg-white p-5">
    <div className="flex items-start justify-between gap-4"><div><div className="kicker">{eyebrow}</div><h3 className="font-serif mt-1 text-xl font-black">{title}</h3></div><Icon className="h-5 w-5 text-primary" /></div>
    <div className="mt-2.5 flex-1">{children}</div>
    <div className="mt-2.5 border-t pt-3"><MoreLink href={href} label={ctaLabel} /></div>
  </section>;
}
