import Link from "next/link";
import { CheckCircle2, Edit, PauseCircle, PlayCircle, Plus, Search, Trash2, UserRound } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { deletePerson, setPersonStatus } from "@/app/admin/people/actions";
import { AdminTabs } from "@/components/admin-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "all" } = await searchParams;
  const search = q.trim();
  const filters: Prisma.PersonWhereInput[] = [];
  if (search) filters.push({ OR: [
    { firstName: { contains: search, mode: "insensitive" } },
    { lastName: { contains: search, mode: "insensitive" } },
    { currentOrganization: { contains: search, mode: "insensitive" } },
    { title: { contains: search, mode: "insensitive" } }
  ] });
  if (status === "active") filters.push({ status: "active" });
  if (status === "inactive") filters.push({ status: "inactive" });
  const where: Prisma.PersonWhereInput = { AND: filters };
  const [people, total, active] = await Promise.all([
    prisma.person.findMany({ where, include: { _count: { select: { articles: true } } }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    prisma.person.count(),
    prisma.person.count({ where: { status: "active" } })
  ]);

  return <main className="container-shell py-8"><AdminTabs />
    <section className="mb-6 border bg-ink p-7 text-white">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">ClubFlow Intelligence Graph</div><h1 className="font-serif mt-2 text-4xl font-black">People</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">Club executives, superintendents, architects, and vendor leaders for future profile pages, executive move history, and article connections.</p></div><Button asChild><Link href="/admin/people/new" className="no-underline"><Plus className="h-4 w-4" /> Add Person</Link></Button></div>
      <div className="mt-6 grid grid-cols-3 gap-px bg-white/15"><Stat label="Total People" value={total} /><Stat label="Active" value={active} /><Stat label="Inactive" value={total - active} /></div>
    </section>

    <form action="/admin/people" className="mb-5 grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-[minmax(220px,1fr)_minmax(150px,auto)_auto]">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Search people…" className="pl-9" /></div>
      <Filter name="status" value={status} options={[{ value: "all", label: "All statuses" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
      <Button type="submit" variant="outline">Filter</Button>
    </form>

    <div className="overflow-x-auto rounded-lg border bg-white"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="border-b bg-muted text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Organization</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Articles</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>
      {people.map((person) => <tr key={person.id} className="border-b align-top last:border-0">
        <td className="px-4 py-4"><div className="font-black">{person.firstName} {person.lastName}</div>{person.linkedInUrl ? <a href={person.linkedInUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-primary">LinkedIn</a> : null}</td>
        <td className="px-4 py-4">{person.title || "—"}</td>
        <td className="px-4 py-4">{person.currentOrganization || "—"}</td>
        <td className="px-4 py-4">{person.status === "active" ? <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800"><CheckCircle2 className="mr-1 h-3 w-3" />Active</Badge> : <Badge className="border-slate-200 bg-white text-slate-700">Inactive</Badge>}</td>
        <td className="px-4 py-4 font-black">{person._count.articles}</td>
        <td className="px-4 py-4"><div className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline"><Link href={`/admin/people/${person.id}/edit`} className="no-underline"><Edit className="h-4 w-4" /> Edit</Link></Button>
          <form action={setPersonStatus.bind(null, person.id, person.status === "active" ? "inactive" : "active")}><Button type="submit" size="sm" variant="ghost">{person.status === "active" ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}{person.status === "active" ? "Deactivate" : "Activate"}</Button></form>
          <form action={deletePerson.bind(null, person.id)}><Button type="submit" size="sm" variant="ghost"><Trash2 className="h-4 w-4" /> Delete</Button></form>
        </div></td>
      </tr>)}
      {!people.length ? <tr><td colSpan={6} className="p-12 text-center"><UserRound className="mx-auto h-8 w-8 text-muted-foreground" /><div className="mt-3 font-serif text-xl font-black">No people found</div><p className="mt-1 text-sm text-muted-foreground">Add a club executive, superintendent, architect, or vendor leader, or adjust the current filters.</p></td></tr> : null}
    </tbody></table></div>
  </main>;
}

function Filter({ name, value, options }: { name: string; value: string; options: ReadonlyArray<{ value: string; label: string }> }) { return <select name={name} defaultValue={value} className="h-10 rounded-md border bg-background px-3 text-sm">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>; }
function Stat({ label, value }: { label: string; value: number }) { return <div className="bg-ink p-4"><div className="number-tabular text-2xl font-black">{value}</div><div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/50">{label}</div></div>; }
