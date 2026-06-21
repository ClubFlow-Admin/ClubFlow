import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, Cpu, Landmark, Newspaper, Users } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { getArticles } from "@/lib/articles";
import { imageForArticle } from "@/lib/images";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const sections = [
  ["Latest Industry News", "industry-news", "/industry"],
  ["Latest Developments", "developments-renovations", "/developments"],
  ["Capital Investments", "capital-investments", "/capital-investments"],
  ["M&A Deal Desk", "mergers-acquisitions", "/mergers-acquisitions"],
  ["Technology Watch", "technology", "/technology"]
] as const;

export default async function HomePage() {
  const [articles, jobs, moves, developments, rankings] = await Promise.all([
    getArticles({ status: "published" }),
    prisma.jobPosting.findMany({ orderBy: { postedAt: "desc" } }),
    prisma.executiveMove.findMany({ orderBy: { effectiveAt: "desc" } }),
    prisma.developmentProject.count(),
    prisma.rankingEntry.findMany({ orderBy: [{ category: "asc" }, { rank: "asc" }], take: 5 })
  ]);
  const topStory = articles[0];
  const byCategory = (slug: string) => articles.filter((article) => article.category.slug === slug).slice(0, 3);
  const capitalCount = articles.filter((article) => article.category.slug === "capital-investments").length;
  const techCount = articles.filter((article) => article.category.slug === "technology").length;

  return (
    <main>
      <section className="bg-ink text-white">
        <div className="container-shell grid gap-8 py-10 lg:grid-cols-[1.45fr_0.75fr]">
          <div>
            <div className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Today&apos;s Club Industry Brief</div>
            <h1 className="font-serif max-w-4xl text-balance text-4xl font-black leading-[1.05] sm:text-5xl">The intelligence layer for the private club economy.</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">News, leadership moves, capital projects, technology, jobs, and deal signals—organized for people making decisions across the club industry.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#briefing" className="rounded-sm bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 no-underline">Open today&apos;s briefing</Link>
              <Link href="/newsletter" className="rounded-sm border border-white/30 px-5 py-3 text-sm font-black text-white no-underline">Get ClubFlow daily</Link>
            </div>
          </div>
          <div className="border border-white/15 bg-white/[.04] p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-300"><BarChart3 className="h-4 w-4" /> Market pulse</div>
            <div className="mt-5 space-y-4">
              <PulseRow label="Member demand" value="Firm" tone="text-emerald-300" />
              <PulseRow label="Capital activity" value="Elevated" tone="text-amber-300" />
              <PulseRow label="Executive hiring" value="Active" tone="text-sky-300" />
              <PulseRow label="Technology adoption" value="Accelerating" tone="text-violet-300" />
            </div>
            <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-5 text-white/50">Directional demo indicators based on ClubFlow&apos;s seeded preview dataset.</p>
          </div>
        </div>
      </section>

      <section className="container-shell -mt-px py-6">
        <div className="metric-grid">
          <Metric icon={Newspaper} label="New Stories" value={articles.length} href="/industry" />
          <Metric icon={Users} label="Executive Moves" value={moves.length} href="/executive-moves" />
          <Metric icon={BriefcaseBusiness} label="New Jobs" value={jobs.length} href="/jobs" />
          <Metric icon={Building2} label="Active Developments" value={developments} href="/developments" />
          <Metric icon={Landmark} label="Capital Projects" value={capitalCount} href="/capital-investments" />
          <Metric icon={Cpu} label="Technology Updates" value={techCount} href="/technology" />
        </div>
      </section>

      <section id="briefing" className="container-shell py-6">
        <div className="section-rule"><div><div className="kicker">Lead intelligence</div><h2 className="font-serif mt-1 text-3xl font-black">Featured Story</h2></div><span className="hidden text-xs font-bold uppercase tracking-widest text-muted-foreground sm:block">Updated throughout the day</span></div>
        {topStory ? (
          <article className="mt-6 grid overflow-hidden border bg-white lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[320px]"><Image src={imageForArticle(topStory)} alt="" fill priority className="object-cover" sizes="(min-width:1024px) 55vw, 100vw" /></div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <div className="kicker">{topStory.category.name} · Score {topStory.importanceScore}</div>
              <h3 className="font-serif mt-3 text-balance text-3xl font-black leading-tight">{topStory.title}</h3>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{topStory.aiSummary}</p>
              <div className="mt-6 flex items-center justify-between gap-4 border-t pt-4 text-sm"><span className="font-bold">{topStory.source.name}</span><Link href={`/articles/${topStory.slug}`} className="inline-flex items-center gap-1 font-black text-primary no-underline">Read intelligence brief <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
          </article>
        ) : <EmptyState />}
      </section>

      <section className="container-shell grid gap-8 py-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-10">
          {sections.map(([title, slug, href]) => <StoryStrip key={slug} title={title} href={href} articles={byCategory(slug)} />)}
        </div>
        <aside className="grid h-fit gap-6">
          <div className="intelligence-card p-5"><div className="kicker">Leadership ticker</div><h2 className="font-serif mt-1 text-2xl font-black">Executive Moves</h2><div className="mt-4 divide-y">{moves.slice(0, 5).map((move) => <div key={move.id} className="py-3"><div className="font-black">{move.executive}</div><div className="mt-1 text-sm text-muted-foreground">{move.newRole} · {move.clubName}</div></div>)}</div><MoreLink href="/executive-moves" label="All executive moves" /></div>
          <div className="intelligence-card p-5"><div className="kicker">Talent market</div><h2 className="font-serif mt-1 text-2xl font-black">Open Roles</h2><div className="mt-4 divide-y">{jobs.slice(0, 4).map((job) => <div key={job.id} className="py-3"><div className="font-black">{job.title}</div><div className="mt-1 text-sm text-muted-foreground">{job.clubName} · {job.state}</div></div>)}</div><MoreLink href="/jobs" label="Browse all jobs" /></div>
          <div className="intelligence-card p-5"><div className="kicker">Preview data</div><h2 className="font-serif mt-1 text-2xl font-black">Club Rankings</h2><div className="mt-4 space-y-3">{rankings.map((entry) => <div key={entry.id} className="flex gap-3"><span className="number-tabular text-xl font-black text-primary">{entry.rank}</span><div><div className="font-bold">{entry.clubName}</div><div className="text-xs text-muted-foreground">{entry.category}</div></div></div>)}</div><MoreLink href="/club-rankings" label="Explore rankings" /></div>
        </aside>
      </section>

      <section className="container-shell grid gap-5 py-8 md:grid-cols-2">
        <div className="bg-primary p-7 text-white"><div className="text-xs font-black uppercase tracking-[.16em] text-emerald-200">The briefing</div><h2 className="font-serif mt-2 text-3xl font-black">One sharp read on the club market.</h2><p className="mt-3 text-sm leading-6 text-white/75">Get notable stories, moves, projects, and opportunities delivered in a decision-ready format.</p><div className="mt-5 max-w-md"><NewsletterForm /></div></div>
        <div className="border bg-white p-7"><div className="kicker">ClubFlow partner</div><h2 className="font-serif mt-2 text-3xl font-black">Turn intelligence into better operations.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">ClubOpsPro provides consulting, playbooks, SOPs, and implementation support for club leaders.</p><Link href="/clubopspro" className="mt-5 inline-flex items-center gap-2 font-black text-primary no-underline">Explore ClubOpsPro <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </main>
  );
}

function PulseRow({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="flex items-center justify-between gap-4"><span className="text-sm text-white/65">{label}</span><span className={`text-sm font-black ${tone}`}>{value}</span></div>; }
function Metric({ icon: Icon, label, value, href }: { icon: typeof Newspaper; label: string; value: number; href: string }) { return <Link href={href} className="metric-cell group no-underline"><Icon className="h-4 w-4 text-primary" /><div className="number-tabular mt-4 text-3xl font-black">{value}</div><div className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground group-hover:text-primary">{label}</div></Link>; }
function StoryStrip({ title, href, articles }: { title: string; href: string; articles: Awaited<ReturnType<typeof getArticles>> }) { return <section><div className="section-rule"><h2 className="font-serif text-2xl font-black">{title}</h2><MoreLink href={href} label="View section" /></div><div className="mt-2 divide-y border-y bg-white">{articles.map((article) => <article key={article.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto]"><div><div className="text-[11px] font-black uppercase tracking-wider text-primary">{article.source.name}</div><Link href={`/articles/${article.slug}`} className="no-underline"><h3 className="mt-1 text-lg font-black leading-snug hover:text-primary">{article.title}</h3></Link><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{article.aiSummary}</p></div><div className="text-xs font-bold text-muted-foreground">Score {article.importanceScore}</div></article>)}{!articles.length ? <div className="p-5 text-sm text-muted-foreground">Coverage is being indexed for this desk.</div> : null}</div></section>; }
function MoreLink({ href, label }: { href: string; label: string }) { return <Link href={href} className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-primary no-underline">{label} <ArrowRight className="h-3.5 w-3.5" /></Link>; }
function EmptyState() { return <div className="mt-6 border bg-white p-8 text-center text-muted-foreground">The intelligence desk is preparing today&apos;s lead story.</div>; }
