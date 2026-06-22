import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, BarChart3, SearchX } from "lucide-react";
import { CompactArticleRow, FeaturedArticleCard, SectionArticleCard } from "@/components/article-card";
import { FilterBar } from "@/components/filter-bar";
import { categoryNav } from "@/lib/categories";
import { getArticles, getCategories, getSources } from "@/lib/articles";

type SectionFeedPageProps = { title: string; eyebrow: string; description: string; href: string; categorySlug: string; searchParams: Record<string, string | undefined> };

export async function SectionFeedPage({ title, eyebrow, description, href, categorySlug, searchParams }: SectionFeedPageProps) {
  const [categories, sources, articles] = await Promise.all([
    getCategories(),
    getSources(),
    getArticles({ category: categorySlug, query: searchParams.query, source: searchParams.source, clubName: searchParams.clubName, location: searchParams.location, from: searchParams.from, to: searchParams.to, status: "published" })
  ]);
  const featured = articles[0];
  const latest = articles.slice(1, 5);
  const archive = articles.slice(5);
  const lastUpdated = articles[0]?.publishedAt;

  return <main>
    <section className="border-b bg-ink text-white">
      <div className="container-shell py-10 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-white/55 no-underline hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> ClubFlow home</Link>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
          <div><div className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">{eyebrow}</div><h1 className="font-serif mt-3 text-balance text-4xl font-black leading-none sm:text-5xl">{title}</h1><p className="mt-4 max-w-3xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">{description}</p></div>
          <div className="grid grid-cols-2 gap-px border border-white/15 bg-white/15"><DeskStat value={articles.length} label="Published briefs" /><DeskStat value={lastUpdated ? format(lastUpdated,"MMM d") : "—"} label="Latest update" /></div>
        </div>
      </div>
    </section>

    <section className="container-shell py-8">
      <div className="mb-5 flex gap-1 overflow-x-auto border-b pb-3">{categoryNav.map((item)=><Link href={item.href} key={item.href} className={`whitespace-nowrap px-3 py-2 text-xs font-black uppercase tracking-[.06em] no-underline ${item.href===href?"bg-ink text-white":"text-muted-foreground hover:bg-muted hover:text-primary"}`}>{item.label}</Link>)}</div>
      <FilterBar categories={categories} sources={sources} defaults={searchParams} action={href} />

      {featured ? <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_.75fr]"><FeaturedArticleCard article={featured} priority /><aside className="border bg-ink px-5 text-white sm:px-6"><div className="border-b border-white/15 py-5"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-emerald-300"><BarChart3 className="h-4 w-4" /> Latest from this desk</div></div>{latest.map((article)=><CompactArticleRow key={article.id} article={article} inverse />)}{!latest.length?<p className="py-6 text-sm text-white/55">More intelligence is being indexed.</p>:null}</aside></div> : (
        <div className="mt-8 flex flex-col items-center border bg-white px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground"><SearchX className="h-6 w-6" /></div>
          <h3 className="font-serif mt-5 text-2xl font-black">No briefs match this filter set</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try widening your date range, clearing a filter, or checking back as ClubFlow indexes new private-club industry coverage.</p>
          <a href={href} className="mt-5 inline-flex items-center gap-2 rounded-sm border px-4 py-2 text-xs font-black uppercase tracking-[.08em] text-primary no-underline hover:border-primary">Clear filters</a>
        </div>
      )}

      {archive.length ? <section className="mt-12"><div className="section-rule"><div><div className="kicker">Desk archive</div><h2 className="font-serif mt-1 text-3xl font-black">More intelligence</h2></div><span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Newest first</span></div><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{archive.map((article)=><SectionArticleCard key={article.id} article={article} />)}</div></section> : null}
    </section>
  </main>;
}

function DeskStat({value,label}:{value:string|number;label:string}) { return <div className="bg-ink p-4"><div className="number-tabular text-2xl font-black">{value}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-white/45">{label}</div></div>; }
