import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, BarChart3, BriefcaseBusiness, Check, Newspaper, Trophy, UserRoundPlus } from "lucide-react";
import { CompactArticleRow, FeaturedArticleCard, SectionArticleCard } from "@/components/article-card";
import { NewsletterForm } from "@/components/newsletter-form";
import { getArticles } from "@/lib/articles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, jobs, moves, developmentProjects, rankings] = await Promise.all([
    getArticles({ status: "published" }),
    prisma.jobPosting.findMany({ where: { status: "published" }, orderBy: { postedAt: "desc" }, take: 6 }),
    prisma.executiveMove.findMany({ where: { status: "published" }, orderBy: [{ effectiveAt: "desc" }, { updatedAt: "desc" }], take: 6 }),
    prisma.developmentProject.count(),
    prisma.rankingEntry.findMany({ where: { status: "published" }, orderBy: [{ category: "asc" }, { rank: "asc" }], take: 5 })
  ]);
  const topStory = articles[0];
  const briefing = articles.slice(0, 5);
  const secondary = articles.slice(1, 3);
  const headlines = articles.slice(3, 7);
  const byCategory = (slug: string, count = 4) => articles.filter((article) => article.category.slug === slug).slice(0, count);
  const developments = byCategory("developments-renovations");
  const capital = byCategory("capital-investments");
  const technology = byCategory("technology", 3);
  const deals = byCategory("mergers-acquisitions");

  return <main>
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(52,211,153,.12),transparent_65%)]" />
      <div className="container-shell relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
        <div><div className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">ClubFlow Executive Intelligence</div><h1 className="font-serif mt-4 max-w-5xl text-balance text-4xl font-black leading-[1.02] sm:text-6xl">Golf industry intelligence for private clubs, resorts, and club leaders.</h1><p className="mt-6 max-w-3xl text-base leading-7 text-white/68 sm:text-xl sm:leading-8">Track the people, projects, investments, jobs, technology, and decisions shaping the private golf club industry.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="#todays-brief" className="rounded-sm bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 no-underline hover:bg-emerald-300">View Today&apos;s Brief</Link><Link href="/newsletter" className="rounded-sm border border-white/30 px-5 py-3 text-sm font-black text-white no-underline hover:border-white">Subscribe to Newsletter</Link></div></div>
        <div className="border border-white/15 bg-white/[.035] p-5 sm:p-6"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-emerald-300"><BarChart3 className="h-4 w-4" /> Market pulse</div><div className="mt-5 grid grid-cols-2 gap-px bg-white/15"><Pulse value={articles.length} label="Published briefs" /><Pulse value={developmentProjects} label="Projects tracked" /><Pulse value={moves.length} label="Recent moves" /><Pulse value={jobs.length} label="Open roles" /></div><p className="mt-4 text-xs leading-5 text-white/45">Decision-ready coverage across the business of private golf clubs.</p></div>
      </div>
    </section>

    <section id="todays-brief" className="border-b bg-white"><div className="container-shell grid lg:grid-cols-[230px_1fr]"><div className="border-b py-6 lg:border-b-0 lg:border-r lg:pr-6"><div className="kicker">Today&apos;s ClubFlow Brief</div><h2 className="font-serif mt-2 text-2xl font-black">The morning read for club decision-makers.</h2><p className="mt-3 text-xs leading-5 text-muted-foreground">Top signals, ranked by relevance to operators, boards, partners, and investors.</p></div><div className="grid gap-x-6 py-2 sm:grid-cols-2 lg:px-6 xl:grid-cols-3">{briefing.map((article)=><CompactArticleRow key={article.id} article={article} />)}</div></div></section>

    <section className="container-shell py-10 sm:py-12">
      <SectionHeading eyebrow="Lead intelligence" title="What club leaders need to know now" href="/industry" />
      {topStory ? <div className="mt-6"><FeaturedArticleCard article={topStory} priority /></div> : null}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_.9fr]">{secondary.map((article)=><SectionArticleCard key={article.id} article={article} />)}<div className="border bg-muted/35 px-5"><div className="border-b py-4 text-xs font-black uppercase tracking-[.14em] text-primary">Also on the wire</div>{headlines.map((article)=><CompactArticleRow key={article.id} article={article} />)}</div></div>
    </section>

    <section className="border-y bg-white"><div className="container-shell py-10 sm:py-12"><SectionHeading eyebrow="Development intelligence" title="Club Development Tracker" href="/developments" />{developments.length?<div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><SectionArticleCard article={developments[0]} /><div className="border-y">{developments.slice(1).map((article)=><CompactArticleRow key={article.id} article={article} />)}</div></div>:null}</div></section>

    <section className="container-shell grid gap-10 py-10 sm:py-12 lg:grid-cols-2">
      <div><SectionHeading eyebrow="Capital monitor" title="Investment & Capital Projects" href="/capital-investments" /> <div className="mt-5 border-t">{capital.map((article)=><CompactArticleRow key={article.id} article={article} />)}</div></div>
      <div><SectionHeading eyebrow="Systems & data" title="Technology Watch" href="/technology" /><div className="mt-5 grid gap-4 sm:grid-cols-2">{technology.slice(0,2).map((article)=><SectionArticleCard key={article.id} article={article} />)}</div>{technology[2]?<div className="mt-1"><CompactArticleRow article={technology[2]} /></div>:null}</div>
    </section>

    <section className="bg-ink text-white"><div className="container-shell grid gap-8 py-10 sm:py-12 lg:grid-cols-[.75fr_1.25fr]"><div><div className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">Transaction intelligence</div><h2 className="font-serif mt-2 text-3xl font-black">Golf & Club Deal Desk</h2><p className="mt-3 text-sm leading-6 text-white/55">Ownership changes, portfolio activity, management agreements, and capital entering the private-club market.</p><MoreLink href="/mergers-acquisitions" label="Open the deal desk" inverse /></div><div className="grid gap-x-7 sm:grid-cols-2">{deals.map((article)=><CompactArticleRow key={article.id} article={article} inverse />)}</div></div></section>

    <section className="container-shell grid gap-8 py-10 sm:py-12 xl:grid-cols-[1fr_1fr_.8fr]">
      <IntelligencePanel icon={UserRoundPlus} eyebrow="Leadership moves" title="Who is moving where" href="/executive-moves">{moves.slice(0,5).map((move)=><div key={move.id} className="grid grid-cols-[1fr_auto] gap-3 border-b py-3 last:border-0"><div><div className="font-serif text-lg font-black">{move.executive}</div><div className="mt-1 text-xs font-bold text-primary">{move.newRole} · {move.clubName}</div></div><time className="text-[10px] font-bold uppercase text-muted-foreground">{move.effectiveAt?format(move.effectiveAt,"MMM d"):"New"}</time></div>)}</IntelligencePanel>
      <IntelligencePanel icon={BriefcaseBusiness} eyebrow="Talent market" title="Club Leadership Jobs" href="/jobs">{jobs.slice(0,5).map((job)=><div key={job.id} className="border-b py-3 last:border-0"><div className="font-serif text-lg font-black">{job.title}</div><div className="mt-1 text-xs font-bold text-primary">{job.clubName} · {[job.city,job.state].filter(Boolean).join(", ")}</div></div>)}</IntelligencePanel>
      <IntelligencePanel icon={Trophy} eyebrow="Rankings & watchlists" title="Clubs on the radar" href="/club-rankings">{rankings.map((entry)=><div key={entry.id} className="flex gap-3 border-b py-3 last:border-0"><span className="number-tabular w-7 text-xl font-black text-primary">{entry.rank}</span><div><div className="font-black">{entry.clubName}</div><div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{entry.category}</div></div></div>)}</IntelligencePanel>
    </section>

    <section className="border-y bg-white"><div className="container-shell grid gap-8 py-10 sm:py-12 lg:grid-cols-[.85fr_1.15fr]"><div><div className="kicker">Why ClubFlow</div><h2 className="font-serif mt-3 text-balance text-3xl font-black sm:text-4xl">The business of golf clubs, in one intelligence layer.</h2></div><div><p className="text-lg leading-8 text-muted-foreground">ClubFlow tracks the business of golf clubs in one place — leadership changes, new developments, capital projects, technology adoption, rankings, and operating intelligence.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{["Private-club market signals","Leadership and talent movement","Capital and development activity","Technology and operating intelligence"].map((item)=><div key={item} className="flex items-center gap-3 text-sm font-black"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}</div></div></div></section>

    <section className="container-shell py-10 sm:py-12"><div className="grid gap-8 bg-primary p-6 text-white sm:p-8 lg:grid-cols-[1fr_440px] lg:items-center"><div><div className="text-xs font-black uppercase tracking-[.16em] text-emerald-200">The ClubFlow Briefing</div><h2 className="font-serif mt-2 text-3xl font-black">Get the private club industry brief in your inbox.</h2><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-white/70">{["Weekly industry recap","Executive moves","Capital projects","New developments","Jobs & leadership opportunities"].map((item)=><span key={item}>✓ {item}</span>)}</div></div><NewsletterForm /></div></section>
  </main>;
}

function Pulse({value,label}:{value:number;label:string}) { return <div className="bg-ink p-4"><div className="number-tabular text-2xl font-black text-white">{value}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/45">{label}</div></div>; }
function SectionHeading({eyebrow,title,href}:{eyebrow:string;title:string;href:string}) { return <div className="section-rule"><div><div className="kicker">{eyebrow}</div><h2 className="font-serif mt-1 text-3xl font-black">{title}</h2></div><MoreLink href={href} label="View desk" /></div>; }
function MoreLink({href,label,inverse=false}:{href:string;label:string;inverse?:boolean}) { return <Link href={href} className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.08em] no-underline ${inverse?"text-emerald-300":"text-primary"}`}>{label}<ArrowRight className="h-3.5 w-3.5" /></Link>; }
function IntelligencePanel({icon:Icon,eyebrow,title,href,children}:{icon:typeof Newspaper;eyebrow:string;title:string;href:string;children:React.ReactNode}) { return <section className="border bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="kicker">{eyebrow}</div><h2 className="font-serif mt-1 text-2xl font-black">{title}</h2></div><Icon className="h-5 w-5 text-primary" /></div><div className="mt-4">{children}</div><div className="mt-4 border-t pt-4"><MoreLink href={href} label="View all" /></div></section>; }
