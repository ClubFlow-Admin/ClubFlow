"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IngestRunSummary } from "@/lib/ingest";

type IngestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: IngestRunSummary }
  | { status: "error"; message: string };

export function AdminIngestButton() {
  const [state, setState] = useState<IngestState>({ status: "idle" });

  async function runIngestion() {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/ingest/rss", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setState({ status: "error", message: data?.error ?? `Ingestion failed (${response.status}).` });
        return;
      }
      setState({ status: "success", summary: data as IngestRunSummary });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Ingestion request failed." });
    }
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <Button type="button" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={runIngestion} disabled={state.status === "loading"}>
        {state.status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {state.status === "loading" ? "Running Ingestion…" : "Run RSS Ingestion"}
      </Button>

      {state.status === "success" ? (
        <div className="w-full max-w-md rounded-md border border-emerald-300/40 bg-emerald-950/40 p-4 text-left text-xs text-white">
          <div className="flex items-center gap-2 font-black text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Ingestion complete — new items enter as drafts and are never auto-published.
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="Sources checked" value={state.summary.sourcesChecked} />
            <Stat label="Items found" value={state.summary.itemsFound} />
            <Stat label="Articles created" value={state.summary.articlesCreated} />
            <Stat label="Duplicates skipped" value={state.summary.duplicatesSkipped} />
            <Stat label="AI summaries generated" value={state.summary.aiSummariesGenerated} />
          </dl>
          {state.summary.sources.some((source) => source.status === "error" || source.error) ? (
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="font-bold uppercase tracking-wide text-white/60">Per-source notes</div>
              <ul className="mt-2 space-y-1">
                {state.summary.sources
                  .filter((source) => source.error)
                  .map((source) => (
                    <li key={source.sourceId} className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-300" />
                      <span><span className="font-semibold">{source.sourceName}:</span> {source.error}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="flex max-w-md items-start gap-2 rounded-md border border-red-300/40 bg-red-950/40 p-4 text-left text-xs text-white">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-300" />
          <span>{state.message}</span>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-white/50">{label}</dt>
      <dd className="number-tabular text-lg font-black">{value}</dd>
    </div>
  );
}
