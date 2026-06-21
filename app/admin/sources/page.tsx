import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Edit, ExternalLink, PauseCircle, PlayCircle, Plus, Rss, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { setSourceActive } from "@/app/admin/sources/actions";
import { AdminTabs } from "@/components/admin-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { sourceCategories, sourceCategoryLabel, sourcePriorityLabel, sourceTypeLabel, sourceTypes } from "@/lib/source-options";

export const dynamic = "force-dynamic";

export default async function SourcesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; type?: string; category?: string }> }) {
  const { q = "", status = "all", type = "all", category = "all" } = await searchParams;
  const search = q.trim();
  const filters: Prisma.SourceWhereInput[] = [];
  if (search) filters.push({ OR: [
      { name: { contains: search, mode: "insensitive" } },
      { homepageUrl: { contains: search, mode: "insensitive" } },
      { rssUrl: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } }
  ] });
  if (status === "active") filters.push({ active: true });
  if (status === "inactive") filters.push({ active: false });
  if (type !== "all") filters.push({ sourceType: type });
  if (category !== "all") filters.push({ OR: [{ primaryCategory: category }, { categories: { has: category } }] });
  const where: Prisma.SourceWhereInput = { AND: filters };
  const [sources, total, active] = await Promise.all([
    prisma.source.findMany({ where, include: { _count: { select: { articles: true } } }, orderBy: [{ priority: "desc" }, { name: "asc" }] }),
    prisma.source.count(),
    prisma.source.count({ where: { active: true } })
  ]);

  return <main className="container-shell py-8"><AdminTabs />
    <section className="mb-6 border bg-ink p-7 text-white">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">ClubFlow Intelligence Network</div><h1 className="font-serif mt-2 text-4xl font-black">Source Management Center</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Track the golf and private-club sources that will power monitoring, RSS ingestion, and the future editorial review queue.</p></div><Button asChild><Link href="/admin/sources/new" className="no-underline"><Plus className="h-4 w-4" /> Add Source</Link></Button></div>
      <div className="mt-6 grid grid-cols-3 gap-px bg-white/15"><Stat label="Total Sources" value={total} /><Stat label="Active" value={active} /><Stat label="Inactive" value={total-active} /></div>
    </section>

    <form action="/admin/sources" className="mb-5 grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(150px,auto))_auto]">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Search sources…" className="pl-9" /></div>
      <Filter name="status" value={status} options={[{value:"all",label:"All statuses"},{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}]} />
      <Filter name="type" value={type} options={[{value:"all",label:"All source types"},...sourceTypes]} />
      <Filter name="category" value={category} options={[{value:"all",label:"All categories"},...sourceCategories]} />
      <Button type="submit" variant="outline">Filter</Button>
    </form>

    <div className="overflow-x-auto rounded-lg border bg-white"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="border-b bg-muted text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Source</th><th className="px-4 py-3">Coverage</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Monitoring</th><th className="px-4 py-3">Articles</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>
      {sources.map((source) => <tr key={source.id} className="border-b align-top last:border-0"><td className="px-4 py-4"><div className="font-black">{source.name}</div><div className="mt-1 flex gap-3 text-xs">{source.homepageUrl ? <a href={source.homepageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">Website <ExternalLink className="h-3 w-3" /></a> : <span className="text-muted-foreground">No website</span>}{source.rssUrl ? <a href={source.rssUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">RSS <Rss className="h-3 w-3" /></a> : <span className="text-muted-foreground">No RSS</span>}</div>{source.notes ? <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">{source.notes}</p> : null}</td><td className="px-4 py-4"><div className="font-semibold">{sourceTypeLabel(source.sourceType)}</div><div className="mt-1 text-xs text-muted-foreground">Primary: {sourceCategoryLabel(source.primaryCategory)}</div><div className="mt-2 flex max-w-xs flex-wrap gap-1">{source.categories.map((item)=><Badge key={item} className="border-slate-200 bg-white text-slate-700">{sourceCategoryLabel(item)}</Badge>)}</div></td><td className="px-4 py-4"><Badge className={source.priority>=75?"border-amber-200 bg-amber-50 text-amber-800":"border-slate-200 bg-slate-50 text-slate-700"}>{sourcePriorityLabel(source.priority)}</Badge></td><td className="px-4 py-4">{source.active?<Badge className="border-emerald-200 bg-emerald-50 text-emerald-800"><CheckCircle2 className="mr-1 h-3 w-3" />Active</Badge>:<Badge className="border-slate-200 bg-white text-slate-700">Inactive</Badge>}</td><td className="px-4 py-4 text-xs leading-5 text-muted-foreground"><div>Checked: {dateLabel(source.lastCheckedAt)}</div><div>Imported: {dateLabel(source.lastSuccessfulImportAt)}</div></td><td className="px-4 py-4 font-black">{source._count.articles}</td><td className="px-4 py-4"><div className="flex justify-end gap-2"><Button asChild size="sm" variant="outline"><Link href={`/admin/sources/${source.id}/edit`} className="no-underline"><Edit className="h-4 w-4" /> Edit</Link></Button><form action={setSourceActive.bind(null,source.id,!source.active)}><Button type="submit" size="sm" variant="ghost">{source.active?<PauseCircle className="h-4 w-4" />:<PlayCircle className="h-4 w-4" />}{source.active?"Deactivate":"Activate"}</Button></form></div></td></tr>)}
      {!sources.length?<tr><td colSpan={7} className="p-12 text-center"><Rss className="mx-auto h-8 w-8 text-muted-foreground" /><div className="mt-3 font-serif text-xl font-black">No sources found</div><p className="mt-1 text-sm text-muted-foreground">Add a golf-industry source or adjust the current filters.</p></td></tr>:null}
    </tbody></table></div>
  </main>;
}

function Filter({name,value,options}:{name:string;value:string;options:ReadonlyArray<{value:string;label:string}>}) { return <select name={name} defaultValue={value} className="h-10 rounded-md border bg-background px-3 text-sm">{options.map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select>; }
function Stat({label,value}:{label:string;value:number}) { return <div className="bg-ink p-4"><div className="number-tabular text-2xl font-black">{value}</div><div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/50">{label}</div></div>; }
function dateLabel(value:Date|null) { return value?format(value,"MMM d, yyyy, h:mm a"):"Never"; }
