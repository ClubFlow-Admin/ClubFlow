import type { ArticleStatus, Category, MediaAsset, Source } from "@prisma/client";
import type * as React from "react";
import type { ArticleWithRelations } from "@/lib/articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const statuses: ArticleStatus[] = ["draft", "reviewed", "published"];

export function AdminArticleForm({
  action,
  article,
  categories,
  mediaAssets = [],
  sources
}: {
  action: (formData: FormData) => Promise<void>;
  article?: ArticleWithRelations;
  categories: Category[];
  mediaAssets?: MediaAsset[];
  sources: Source[];
}) {
  const publishedAt = article?.publishedAt.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="grid gap-5 rounded-lg border bg-white p-5">
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
        <div className="grid gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={article?.categoryId}
            required
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
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
        <Label htmlFor="aiSummary">AI Summary</Label>
        <Textarea id="aiSummary" name="aiSummary" defaultValue={article?.aiSummary} required />
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
