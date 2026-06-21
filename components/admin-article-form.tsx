import type { ArticleStatus, Category, MediaAsset, Source } from "@prisma/client";
import { Bot, CheckCircle2, Link2, PenLine } from "lucide-react";
import type * as React from "react";
import type { ArticleWithRelations } from "@/lib/articles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const statuses: ArticleStatus[] = ["draft", "reviewed", "published"];

function AiProcessingStatus({ article }: { article: ArticleWithRelations }) {
  const aiProcessed = Boolean(article.aiWhatHappened || article.aiWhyItMatters);
  const linkedEntities = [
    ...article.clubs.map((club) => club.name),
    ...article.companies.map((company) => company.name),
    ...article.people.map((person) => `${person.firstName} ${person.lastName}`)
  ];

  return (
    <div className="rounded-md border bg-muted/40 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {aiProcessed ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800"><Bot className="mr-1 h-3 w-3" /> AI processed</Badge>
        ) : (
          <Badge className="border-slate-200 bg-white text-slate-700"><Bot className="mr-1 h-3 w-3" /> Not AI processed</Badge>
        )}
        {article.status === "reviewed" ? (
          <Badge className="border-amber-200 bg-amber-50 text-amber-800"><PenLine className="mr-1 h-3 w-3" /> Awaiting human approval</Badge>
        ) : null}
        {article.status === "published" ? (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800"><CheckCircle2 className="mr-1 h-3 w-3" /> Published</Badge>
        ) : null}
        {aiProcessed ? <Badge className="border-slate-200 bg-white text-slate-700">AI summary available</Badge> : null}
      </div>
      <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Link2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        {linkedEntities.length ? <span><span className="font-semibold text-foreground">Linked entities:</span> {linkedEntities.join(", ")}</span> : <span>No clubs, companies, or people linked yet.</span>}
      </div>
    </div>
  );
}

export function AdminArticleForm({
  action,
  article,
  categories,
  lockedCategory,
  mediaAssets = [],
  sources
}: {
  action: (formData: FormData) => Promise<void>;
  article?: ArticleWithRelations;
  categories?: Category[];
  lockedCategory?: Category;
  mediaAssets?: MediaAsset[];
  sources: Source[];
}) {
  const publishedAt = article?.publishedAt.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="grid gap-5 rounded-lg border bg-white p-5">
      {article ? <AiProcessingStatus article={article} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" name="title" defaultValue={article?.title} required />
        <Field label="Original URL" name="originalUrl" defaultValue={article?.originalUrl} type="url" required />
        <div className="grid gap-2">
          <Label htmlFor="sourceId">Source</Label>
          <select
            id="sourceId"
            name="sourceId"
            defaultValue={article?.sourceId}
            required
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select source</option>
            {sources.map((source) => (
              <option value={source.id} key={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </div>
        {lockedCategory ? (
          <div className="grid gap-2">
            <Label>Locked Section</Label>
            <div className="flex h-10 items-center rounded-md border border-primary/30 bg-primary/10 px-3 text-sm font-black text-primary">{lockedCategory.name}</div>
            <input type="hidden" name="categoryId" value={lockedCategory.id} />
          </div>
        ) : <div className="grid gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={article?.categoryId}
            required
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select category</option>
            {(categories ?? []).map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>}
        <Field label="Author" name="author" defaultValue={article?.author ?? undefined} />
        <Field label="Published Date" name="publishedAt" defaultValue={publishedAt} type="date" required />
        <Field label="Club Name" name="clubName" defaultValue={article?.clubName ?? undefined} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" name="city" defaultValue={article?.city ?? undefined} />
          <Field label="State" name="state" defaultValue={article?.state ?? undefined} />
        </div>
        <Field label="Tags" name="tags" defaultValue={article?.tags.join(", ")} placeholder="governance, capital planning" />
        <div className="grid gap-2">
          <Label htmlFor="heroImageId">Lead Photo</Label>
          <select
            id="heroImageId"
            name="heroImageId"
            defaultValue={article?.heroImageId ?? ""}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Use category default</option>
            {mediaAssets.map((asset) => (
              <option value={asset.id} key={asset.id}>
                {asset.title}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Importance Score"
          name="importanceScore"
          type="number"
          min="0"
          max="100"
          defaultValue={String(article?.importanceScore ?? 50)}
          required
        />
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={article?.status ?? "draft"}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            {statuses.map((status) => (
              <option value={status} key={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="originalExcerpt">Original Excerpt</Label>
        <Textarea id="originalExcerpt" name="originalExcerpt" defaultValue={article?.originalExcerpt ?? undefined} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="aiSummary">AI Summary (Executive Summary)</Label>
        <Textarea id="aiSummary" name="aiSummary" defaultValue={article?.aiSummary} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="aiWhatHappened">AI: What Happened</Label>
        <Textarea id="aiWhatHappened" name="aiWhatHappened" defaultValue={article?.aiWhatHappened ?? undefined} placeholder="Generated automatically during RSS ingestion. Leave blank to fall back to the original excerpt." />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="aiWhyItMatters">AI: Why It Matters</Label>
        <Textarea id="aiWhyItMatters" name="aiWhyItMatters" defaultValue={article?.aiWhyItMatters ?? undefined} placeholder="Generated automatically during RSS ingestion. Leave blank to fall back to the default framing." />
      </div>
      <Button type="submit">{article ? "Update Article" : "Create Article"}</Button>
    </form>
  );
}

function Field({
  label,
  name,
  ...props
}: {
  label: string;
  name: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}
