import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { AdminTabs } from "@/components/admin-tabs";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SourceHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await prisma.source.findUnique({ where: { id } });
  if (!source) notFound();

  const runs = await prisma.importRun.findMany({ where: { sourceId: id }, orderBy: { startedAt: "desc" }, take: 50 });

  return (
    <main className="container-shell py-8">
      <AdminTabs />
      <div className="mb-6">
        <Link href="/admin/sources" className="inline-flex items-center gap-1 text-sm font-semibold text-primary no-underline">
          <ArrowLeft className="h-4 w-4" /> Back to Sources
        </Link>
        <h1 className="font-serif mt-2 text-4xl font-black">Import History — {source.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Most recent 50 intake runs for this source.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Items Found</th>
              <th className="px-4 py-3">Items Created</th>
              <th className="px-4 py-3">Duplicates Skipped</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b align-top last:border-0">
                <td className="px-4 py-3">{format(run.startedAt, "MMM d, yyyy, h:mm a")}</td>
                <td className="px-4 py-3">
                  {run.status === "ok" ? (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800"><CheckCircle2 className="mr-1 h-3 w-3" />OK</Badge>
                  ) : (
                    <Badge className="border-red-200 bg-red-50 text-red-800"><XCircle className="mr-1 h-3 w-3" />Error</Badge>
                  )}
                </td>
                <td className="px-4 py-3 font-black">{run.itemsFound}</td>
                <td className="px-4 py-3 font-black">{run.itemsCreated}</td>
                <td className="px-4 py-3 font-black">{run.duplicatesSkipped}</td>
                <td className="px-4 py-3 max-w-sm text-xs text-muted-foreground">{run.errorMessage ?? "—"}</td>
              </tr>
            ))}
            {!runs.length ? (
              <tr><td colSpan={6} className="p-12 text-center text-sm text-muted-foreground">No import runs yet for this source.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
