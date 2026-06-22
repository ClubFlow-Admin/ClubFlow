import { Search } from "lucide-react";
import type { Category, Source } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const quickRanges = [
    { label: "All time", from: undefined },
    { label: "Past week", from: quickRangeFrom(7) },
    { label: "Past month", from: quickRangeFrom(30) },
    { label: "Past quarter", from: quickRangeFrom(90) }
  ];

  return (
    <div className="rounded-lg border bg-white p-4 sm:p-5">
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
        <div className="md:col-span-2">
          <label className="sr-only" htmlFor="query">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="query" name="query" defaultValue={defaults.query} placeholder="Search stories, clubs, tags" className="pl-9" />
          </div>
        </div>
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
        <Button type="submit" className="md:col-span-2">
          Apply Filters
        </Button>
      </form>
    </div>
  );
}
