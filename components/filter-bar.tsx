"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Category, Source } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FILTER_KEYS = ["category", "source", "clubName", "location", "from", "to"] as const;

function quickRangeFrom(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function FilterBar({
  categories,
  sources,
  defaults,
  action = "/"
}: {
  categories: Category[];
  sources: Source[];
  defaults: Record<string, string | undefined>;
  action?: string;
}) {
  const activeCount = FILTER_KEYS.filter((key) => defaults[key]).length;
  const [expanded, setExpanded] = useState(activeCount > 0);

  const quickRanges = [
    { label: "All time", from: undefined },
    { label: "Past week", from: quickRangeFrom(7) },
    { label: "Past month", from: quickRangeFrom(30) },
    { label: "Past quarter", from: quickRangeFrom(90) }
  ];

  return (
    <div className="rounded-lg border bg-white">
      <form className="flex flex-wrap items-center gap-3 p-4 sm:p-5" action={action}>
        {defaults.category ? <input type="hidden" name="category" value={defaults.category} /> : null}
        {defaults.source ? <input type="hidden" name="source" value={defaults.source} /> : null}
        {defaults.clubName ? <input type="hidden" name="clubName" value={defaults.clubName} /> : null}
        {defaults.location ? <input type="hidden" name="location" value={defaults.location} /> : null}
        {defaults.from ? <input type="hidden" name="from" value={defaults.from} /> : null}
        {defaults.to ? <input type="hidden" name="to" value={defaults.to} /> : null}
        <div className="relative min-w-[200px] flex-1">
          <label className="sr-only" htmlFor="query">Search</label>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input id="query" name="query" defaultValue={defaults.query} placeholder="Search stories, clubs, tags" className="pl-9" />
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="filter-panel"
          onClick={() => setExpanded((value) => !value)}
          className={`inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm font-bold transition ${expanded ? "border-primary text-primary" : "text-foreground hover:border-primary hover:text-primary"}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount ? <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-black text-white">{activeCount}</span> : null}
        </button>
        <Button type="submit" size="sm">Search</Button>
      </form>

      {expanded ? (
        <div id="filter-panel" className="border-t p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {quickRanges.map((range) => {
              const params = new URLSearchParams();
              if (defaults.query) params.set("query", defaults.query);
              if (defaults.category) params.set("category", defaults.category);
              if (defaults.source) params.set("source", defaults.source);
              if (range.from) params.set("from", range.from);
              const isActive = (defaults.from ?? "") === (range.from ?? "");
              return (
                <a
                  key={range.label}
                  href={`${action}?${params.toString()}`}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold no-underline transition ${isActive ? "border-primary bg-primary text-white" : "text-muted-foreground hover:border-primary hover:text-primary"}`}
                >
                  {range.label}
                </a>
              );
            })}
          </div>
          <form className="mt-4 grid gap-3 md:grid-cols-6" action={action}>
            {defaults.query ? <input type="hidden" name="query" value={defaults.query} /> : null}
            <select name="category" defaultValue={defaults.category ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">All categories</option>
              {categories.map((category) => (
                <option value={category.slug} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select name="source" defaultValue={defaults.source ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">All sources</option>
              {sources.map((source) => (
                <option value={source.name} key={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
            <Input name="clubName" defaultValue={defaults.clubName} placeholder="Club name" />
            <Input name="location" defaultValue={defaults.location} placeholder="City or state" />
            <Input name="from" type="date" defaultValue={defaults.from} />
            <Input name="to" type="date" defaultValue={defaults.to} />
            <div className="flex flex-wrap items-center gap-3 md:col-span-2">
              <Button type="submit">Apply Filters</Button>
              <a href={action} className="text-xs font-bold uppercase tracking-wide text-muted-foreground no-underline hover:text-primary">Clear Filters</a>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
