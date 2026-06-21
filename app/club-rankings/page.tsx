import { Award, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const categories = ["Top Private Clubs to Watch", "Best New Developments", "Most Innovative Clubs", "Best Clubhouse Renovations", "Top Technology Adopters"];

export default async function ClubRankingsPage() {
  const entries = await prisma.rankingEntry.findMany({ orderBy: [{ category: "asc" }, { rank: "asc" }] });
  return <main>
    <section className="border-b bg-ink text-white"><div className="container-shell py-12"><div className="text-xs font-black uppercase tracking-[.18em] text-amber-300">ClubFlow Lists</div><h1 className="font-serif mt-3 text-balance text-4xl font-black sm:text-5xl">Club Rankings & Watchlists</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-white/65">A preview of the data products ClubFlow is developing to surface innovation, investment, and momentum across private clubs.</p><div className="mt-6 inline-flex items-center gap-2 border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200"><Info className="h-4 w-4" /> Demo preview data—not an editorial award or final ranking.</div></div></section>
    <section className="container-shell grid gap-8 py-10">{categories.map((category) => { const list = entries.filter((entry) => entry.category === category); return <section key={category} className="intelligence-card"><div className="flex items-center gap-3 border-b bg-muted/40 p-5"><Award className="h-5 w-5 text-primary" /><h2 className="font-serif text-2xl font-black">{category}</h2></div><div className="divide-y">{list.map((entry) => <article key={entry.id} className="grid gap-3 p-5 sm:grid-cols-[60px_1fr_auto]"><div className="number-tabular text-3xl font-black text-primary">#{entry.rank}</div><div><h3 className="text-lg font-black">{entry.clubName}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.rationale}</p><div className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{entry.city}, {entry.state}</div></div>{entry.score ? <div className="text-right"><div className="number-tabular text-2xl font-black">{entry.score}</div><div className="text-[10px] font-bold uppercase text-muted-foreground">Preview score</div></div> : null}</article>)}{!list.length ? <div className="p-6 text-sm text-muted-foreground">Research for this watchlist is in progress.</div> : null}</div></section>; })}</section>
  </main>;
}
