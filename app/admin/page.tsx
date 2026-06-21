import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, Cpu, Headphones, Landmark, Newspaper, Sparkles, Trophy, UserRoundPlus } from "lucide-react";
import { AdminTabs } from "@/components/admin-tabs";
import { adminSections, type AdminSection } from "@/lib/admin-sections";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const icons = [Newspaper, Building2, UserRoundPlus, BriefcaseBusiness, Cpu, BarChart3, Landmark, Trophy, Headphones, Sparkles];
async function counts(section: AdminSection) {
  if (section.kind === "article") return { total: await prisma.article.count({ where: { category: { slug: section.categorySlug } } }), published: await prisma.article.count({ where: { category: { slug: section.categorySlug }, status: "published" } }) };
  if (section.kind === "job") return { total: await prisma.jobPosting.count(), published: await prisma.jobPosting.count({ where: { status: "published" } }) };
  if (section.kind === "executiveMove") return { total: await prisma.executiveMove.count(), published: await prisma.executiveMove.count({ where: { status: "published" } }) };
  if (section.kind === "ranking") return { total: await prisma.rankingEntry.count(), published: await prisma.rankingEntry.count({ where: { status: "published" } }) };
  return { total: await prisma.podcastEpisode.count(), published: await prisma.podcastEpisode.count({ where: { status: "published" } }) };
}
export default async function AdminDashboard() {
  const sectionCounts = await Promise.all(adminSections.map(counts));
  const total = sectionCounts.reduce((sum, item) => sum + item.total, 0);
  const published = sectionCounts.reduce((sum, item) => sum + item.published, 0);
  return <main className="container-shell py-8"><AdminTabs /><section className="mb-8 grid gap-6 border bg-ink p-7 text-white lg:grid-cols-[1fr_auto]"><div><div className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">ClubFlow Newsroom</div><h1 className="font-serif mt-2 text-4xl font-black">Publishing Dashboard</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Choose a content desk below. Each workspace is locked to its public section, so editors cannot accidentally publish into the wrong channel.</p></div><div className="grid grid-cols-2 gap-px bg-white/15"><Metric label="All content" value={total} /><Metric label="Published" value={published} /></div></section><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{adminSections.map((section, index) => { const Icon=icons[index]; const count=sectionCounts[index]; return <Link key={section.slug} href={`/admin/${section.slug}`} className="group intelligence-card p-6 no-underline hover:border-primary"><div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" /></div><h2 className="font-serif mt-5 text-2xl font-black group-hover:text-primary">{section.label}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{section.description}</p><div className="mt-5 flex gap-4 border-t pt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground"><span>{count.total} total</span><span className="text-primary">{count.published} published</span></div></Link>; })}</div></main>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="min-w-28 bg-ink p-5"><div className="number-tabular text-3xl font-black">{value}</div><div className="mt-1 text-xs font-bold uppercase text-white/50">{label}</div></div>; }
