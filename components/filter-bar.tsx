import { Search } from "lucide-react";
import type { Category, Source } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  return (
    <form className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-6" action={action}>
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
  );
}
