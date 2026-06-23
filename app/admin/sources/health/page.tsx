import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { adoptFirstPartyFeed, setSourceNeedsReview } from "@/app/admin/sources/actions";
import { AdminTabs } from "@/components/admin-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { computeSourceHealth, healthBadgeClass, sourceHealthLabels } from "@/lib/source-health";
import { computeSourceQuality } from "@/lib/source-quality";
import { getAllSourceStats, statsFor } from "@/lib/source-stats";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function tierLabel(sourceType: string): string {
  if (sourceType === "google-news-fallback") return "Discovery (Google News)";
  return "Official";
}

function tierBadgeClass(sourceType: string): string {
  if (sourceType === "google-news-fallback") return "border-blue-200 bg-blue-50 text-blue-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export default async function SourceHealthPage() {
  const [sources, statsMap] = await Promise.all([
    prisma.source.findMany({ orderBy: [{ priority: "desc" }, { name: "asc" }] }),
    getAllSourceStats()
  ]);

  const rows = sources.map((source) => {
    const stats = statsFor(statsMap, source.id);
    const health = computeSourceHealth(source, stats);
    const quality = computeSourceQuality(source, stats);
    return { source, stats, health, quality };
  });

  const healthCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.health] = (acc[row.health] ?? 0) + 1;
    return acc;
  }, {});

  const recommendations = rows.filter((row) => row.source.firstPartyFeedCandidateUrl);

  return (
    <main className="container-shell py-8">
      <AdminTabs />

      <div className="mb-6">
        <Link href="/admin/sources" className="inline-flex items-center gap-1 text-sm font-semibold text-primary no-underline">
          <ArrowLeft className="h-4 w-4" /> Back to Sources
        </Link>
        <h1 className="font-serif mt-2 text-4xl font-black">Source Health Audit</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Health and quality are computed live from real import history, article output, and duplicate rate — nothing here is cached
          or guessed. Quality factors with no signal yet (no runs, no articles) are excluded from the score rather than defaulted.
        </p>
      </div>

      {recommendations.length ? (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-1.5 text-sm font-black text-blue-900">
            <Sparkles className="h-4 w-4" /> {recommendations.length} first-party feed{recommendations.length > 1 ? "s" : ""} found for sources currently on the Google News fallback
          </div>
          <p className="mt-1 text-xs text-blue-800">
            Discovered automatically while running intake — re-verified, never auto-switched. Review and adopt below.
          </p>
          <ul className="mt-3 space-y-2">
            {recommendations.map(({ source }) => (
              <li key={source.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-2 text-xs">
                <span>
                  <span className="font-bold">{source.name}</span> —{" "}
                  <a href={source.firstPartyFeedCandidateUrl!} target="_blank" rel="noreferrer" className="text-primary">
                    {source.firstPartyFeedCandidateUrl}
                  </a>
                </span>
                <form action={adoptFirstPartyFeed.bind(null, source.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    <ArrowUpRight className="h-3.5 w-3.5" /> Adopt First-Party Feed
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-muted/40 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.keys(sourceHealthLabels) as Array<keyof typeof sourceHealthLabels>).map((key) => (
          <div key={key} className="bg-white p-4">
            <div className="number-tabular text-2xl font-black">{healthCounts[key] ?? 0}</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{sourceHealthLabels[key]}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[1300px] text-left text-sm">
          <thead className="border-b bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Health</th>
              <th className="px-4 py-3">Quality</th>
              <th className="px-4 py-3">Success Rate</th>
              <th className="px-4 py-3">Stories/Month</th>
              <th className="px-4 py-3">Last Import</th>
              <th className="px-4 py-3">Needs Review</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ source, stats, health, quality }) => (
              <tr key={source.id} className="border-b align-top last:border-0">
                <td className="px-4 py-4">
                  <div className="font-black">{source.name}</div>
                  {source.organization ? <div className="text-xs text-muted-foreground">{source.organization}</div> : null}
                </td>
                <td className="px-4 py-4">
                  <Badge className={tierBadgeClass(source.sourceType)}>{tierLabel(source.sourceType)}</Badge>
                  {source.firstPartyFeedCandidateUrl ? (
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-blue-700">
                      <Sparkles className="h-3 w-3" /> Upgrade available
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  <Badge className={healthBadgeClass(health)}>{sourceHealthLabels[health]}</Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="font-black">{quality.score}</div>
                  <details className="mt-1 text-[11px] text-muted-foreground">
                    <summary className="cursor-pointer select-none">Factors</summary>
                    <ul className="mt-1 space-y-0.5">
                      {quality.factors.map((factor) => (
                        <li key={factor.label}>
                          {factor.label}: {factor.score === null ? "no data" : factor.score}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 italic">{quality.unmeasuredNote}</p>
                  </details>
                </td>
                <td className="px-4 py-4">
                  {stats.successRate === null ? <span className="text-muted-foreground">No runs yet</span> : `${stats.successRate}% (${stats.okRuns}/${stats.totalRuns})`}
                </td>
                <td className="px-4 py-4">
                  {stats.storiesPerMonth === null ? <span className="text-muted-foreground">—</span> : stats.storiesPerMonth}
                </td>
                <td className="px-4 py-4 text-xs text-muted-foreground">
                  {source.lastSuccessfulImportAt ? format(source.lastSuccessfulImportAt, "MMM d, yyyy") : "Never"}
                </td>
                <td className="px-4 py-4">
                  <form action={setSourceNeedsReview.bind(null, source.id)} className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <input type="checkbox" name="needsReview" value="true" defaultChecked={source.needsReview} />
                      Flag for review
                    </label>
                    <Input name="reviewNote" defaultValue={source.reviewNote ?? undefined} placeholder="Why?" className="h-8 text-xs" />
                    <Button type="submit" size="sm" variant="outline">Save</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
