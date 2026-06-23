import Link from "next/link";
import { AlertTriangle, TrendingUp } from "lucide-react";
import type { NewsroomOpsSummary } from "@/lib/newsroom-ops";

export function AdminNewsroomOpsPanel({ summary }: { summary: NewsroomOpsSummary }) {
  return (
    <section className="mb-6 rounded-lg border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-black">Newsroom Operations</h2>
        <Link href="/admin/sources/health" className="text-xs font-bold text-primary no-underline">View Source Health Audit →</Link>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Operational visibility into the source network itself — separate from the editorial dashboard on the Intake Queue.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Stories This Week" value={summary.storiesThisWeek} />
        <Metric label="Stories This Month" value={summary.storiesThisMonth} />
        <Metric label="Avg Imports / Active Source" value={summary.averageImportsPerActiveSource} />
        <Metric label="Sources Failing Imports" value={summary.sourcesFailingImports.length} tone={summary.sourcesFailingImports.length > 0 ? "warn" : "ok"} />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Most Productive Sources
          </div>
          {summary.mostProductiveSources.length ? (
            <ol className="mt-2 space-y-1 text-sm">
              {summary.mostProductiveSources.map((source, index) => (
                <li key={source.name} className="flex items-center justify-between">
                  <span>{index + 1}. {source.name}</span>
                  <span className="font-black">{source.articlesTotal}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No sources have produced an approved article yet.</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" /> Sources Needing Attention
          </div>
          {summary.sourcesNeedingAttention.length ? (
            <ul className="mt-2 space-y-1 text-sm">
              {summary.sourcesNeedingAttention.slice(0, 6).map((entry) => (
                <li key={entry.name} className="flex items-center justify-between gap-2">
                  <span>{entry.name}</span>
                  <span className="text-xs text-muted-foreground">{entry.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Nothing needs attention right now.</p>
          )}
          {summary.sourcesNeedingAttention.length > 6 ? (
            <Link href="/admin/sources/health" className="mt-2 inline-block text-xs font-bold text-primary no-underline">
              +{summary.sourcesNeedingAttention.length - 6} more →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" }) {
  return (
    <div className={"rounded-md border p-3 " + (tone === "warn" && value > 0 ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50")}>
      <div className="number-tabular text-xl font-black">{value}</div>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
