import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, Compass, Flame, Handshake, Headphones, Newspaper, PiggyBank, Trophy, UserRoundPlus, Wrench } from "lucide-react";
import { CompactArticleRow } from "@/components/article-card";
import { DailyBrief } from "@/components/daily-brief";
import { NewsletterForm } from "@/components/newsletter-form";
import { getArticles } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

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
  const [articles, jobs, moves, developmentProjects] = await Promise.all([
    getArticles({ status: "published" }),
    prisma.jobPosting.findMany({ where: { status: "published" }, orderBy: { postedAt: "desc" }, take: 3 }),
    prisma.executiveMove.findMany({ where: { status: "published" }, orderBy: [{ effectiveAt: "desc" }, { updatedAt: "desc" }], take: 3 }),
    prisma.developmentProject.count()
  ]);
  const ticker = articles.slice(0, 8);
  const byCategory = (slug: string, count = 3) => articles.filter((article) => article.category.slug === slug).slice(0, count);
  const industryPreview = byCategory("industry-news");
  const developmentsPreview = byCategory("developments-renovations");
  const technologyPreview = byCategory("technology");
  const capitalPreview = byCategory("capital-investments");

  return <main>
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(52,211,153,.12),transparent_65%)]" />
      <div className="container-shell relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
        <div className="fade-up"><div className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">ClubFlow Executive Intelligence</div><h1 className="font-serif mt-4 max-w-5xl text-balance text-4xl font-black leading-[1.02] sm:text-6xl">Golf industry intelligence for private clubs, resorts, and club leaders.</h1><p className="mt-6 max-w-3xl text-base leading-7 text-white/68 sm:text-xl sm:leading-8">Track the people, projects, investments, jobs, technology, and decisions shaping the private golf club industry.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="#clubflow-daily" className="rounded-sm bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 no-underline transition hover:bg-emerald-300">View ClubFlow Daily</Link><Link href="/newsletter" className="rounded-sm border border-white/30 px-5 py-3 text-sm font-black text-white no-underline transition hover:border-white">Subscribe to Newsletter</Link></div></div>
        <div className="fade-up border border-white/15 bg-white/[.035] p-5 sm:p-6"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-emerald-300"><BarChart3 className="h-4 w-4" /> Market pulse</div><div className="mt-5 grid grid-cols-2 gap-px bg-white/15"><Pulse value={articles.length} label="Published briefs" /><Pulse value={developmentProjects} label="Projects tracked" /><Pulse value={moves.length} label="Recent moves" /><Pulse value={jobs.length} label="Open roles" /></div><p className="mt-4 text-xs leading-5 text-white/45">Decision-ready coverage across the business of private golf clubs.</p></div>
      </div>
      {ticker.length ? (
        <div className="relative border-t border-white/10 bg-black/25">
          <div className="overflow-hidden py-2.5">
            <div className="ticker-track">
              {[...ticker, ...ticker].map((article, index) => (
                <Link key={`${article.id}-${index}`} href={`/articles/${article.slug}`} className="flex items-center gap-2 whitespace-nowrap px-6 text-xs font-bold text-white/75 no-underline hover:text-emerald-300">
                  <span className="flex items-center gap-1 text-emerald-300"><Flame className="h-3 w-3" /> BREAKING</span>
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>

    <DailyBrief articles={articles} />

    <section className="border-b bg-muted/25"><div className="container-shell py-12 sm:py-16">
      <div className="section-rule"><div><div className="kicker">Section directory</div><h2 className="font-serif mt-1 text-3xl font-black">Jump straight into any desk.</h2></div></div>
      <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SECTION_DIRECTORY.map((section)=><SectionDirectoryCard key={section.href} {...section} />)}
      </div>
    </div></section>

    <section className="bg-white"><div className="container-shell py-12 sm:py-16">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <SectionPreviewPanel icon={Newspaper} eyebrow="Market watch" title="Industry" href="/industry">
          {industryPreview.length ? industryPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={Building2} eyebrow="Capital projects" title="Developments" href="/developments">
          {developmentsPreview.length ? developmentsPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={UserRoundPlus} eyebrow="Leadership" title="Executive Moves" href="/executive-moves">
          {moves.length ? moves.map((move)=><div key={move.id} className="grid grid-cols-[1fr_auto] gap-3 border-b py-3 last:border-0"><div><div className="font-serif text-base font-black leading-snug">{move.executive}</div><div className="mt-1 text-xs font-bold text-primary">{move.newRole} · {move.clubName}</div></div></div>) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={Wrench} eyebrow="Systems & data" title="Technology" href="/technology">
          {technologyPreview.length ? technologyPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={PiggyBank} eyebrow="Capital monitor" title="Capital Investments" href="/capital-investments">
          {capitalPreview.length ? capitalPreview.map((article)=><CompactArticleRow key={article.id} article={article} showCategory={false} />) : <EmptyPreview />}
        </SectionPreviewPanel>
        <SectionPreviewPanel icon={BriefcaseBusiness} eyebrow="Talent market" title="Jobs" href="/jobs">
          {jobs.length ? jobs.map((job)=><div key={job.id} className="border-b py-3 last:border-0"><div className="font-serif text-base font-black leading-snug">{job.title}</div><div className="mt-1 text-xs font-bold text-primary">{job.clubName} · {[job.city,job.state].filter(Boolean).join(", ")}</div></div>) : <EmptyPreview />}
        </SectionPreviewPanel>
      </div>
    </div></section>

    <section className="border-t bg-white"><div className="container-shell py-10 sm:py-12"><div className="grid gap-8 bg-primary p-6 text-white sm:p-8 lg:grid-cols-[1fr_440px] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.16em] text-emerald-200">The ClubFlow Briefing</div><h2 className="font-serif mt-2 text-3xl font-black">Get the private club industry brief in your inbox.</h2><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/70">{["Weekly industry recap","Executive moves","Capital projects","New developments","Jobs & leadership opportunities"].map((item)=><span key={item}>✓ {item}</span>)}</div></div><NewsletterForm /></div></div></section>
  </main>;
}

function Pulse({value,label}:{value:number;label:string}) { return <div className="bg-ink p-4"><div className="number-tabular text-2xl font-black text-white">{value}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/45">{label}</div></div>; }
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
  return <section className="card-lift flex flex-col border bg-white p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4"><div><div className="kicker">{eyebrow}</div><h3 className="font-serif mt-1 text-xl font-black">{title}</h3></div><Icon className="h-5 w-5 text-primary" /></div>
    <div className="mt-3 flex-1">{children}</div>
    <div className="mt-3 border-t pt-4"><MoreLink href={href} label={ctaLabel} /></div>
  </section>;
}
