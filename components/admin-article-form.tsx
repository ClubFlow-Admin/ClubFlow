import type { ArticleStatus, Category, MediaAsset, Source } from "@prisma/client";
import { AlertTriangle, Bot, CheckCircle2, Link2, PenLine } from "lucide-react";
import type * as React from "react";
import type { ArticleWithRelations } from "@/lib/articles";
import { AdminAiTextField } from "@/components/admin-ai-text-field";
import { AdminEntityTagging } from "@/components/admin-entity-tagging";
import { AdminKeyTakeawaysField } from "@/components/admin-key-takeaways-field";
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

function EditorSection({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-6">
      <div className="mb-4">
        <div className="text-[11px] font-black uppercase tracking-[.14em] text-primary">{eyebrow}</div>
        <h2 className="font-serif mt-1 text-xl font-black">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function AdminArticleForm({
  action,
  article,
  categories,
  lockedCategory,
  mediaAssets = [],
  sources,
  entityOptions,
  openAiConfigured
}: {
  action: (formData: FormData) => Promise<void>;
  article?: ArticleWithRelations;
  categories?: Category[];
  lockedCategory?: Category;
  mediaAssets?: MediaAsset[];
  sources: Source[];
  entityOptions: { clubs: { id: string; name: string }[]; companies: { id: string; name: string }[]; people: { id: string; firstName: string; lastName: string }[] };
  openAiConfigured: boolean;
}) {
  const publishedAt = article?.publishedAt.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="grid gap-6">
      {openAiConfigured ? null : (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>AI is not configured. Imported articles will remain short drafts using RSS excerpts.</span>
        </div>
      )}
      {article ? <AiProcessingStatus article={article} /> : null}

      <EditorSection eyebrow="Article" title="Headline & Publishing Details" description="Locked metadata that controls where and when this briefing runs.">
        <div className="grid gap-4">
          <AdminAiTextField id="title" name="title" label="Headline" defaultValue={article?.title} multiline={false} required actions={["improve_headline"]} articleTitle={article?.title} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sourceId">Source</Label>
              <select id="sourceId" name="sourceId" defaultValue={article?.sourceId} required className="h-10 rounded-md border bg-background px-3 text-sm">
                <option value="">Select source</option>
                {sources.map((source) => <option value={source.id} key={source.id}>{source.name}</option>)}
              </select>
            </div>
            {lockedCategory ? (
              <div className="grid gap-2">
                <Label>Locked Section</Label>
                <div className="flex h-10 items-center rounded-md border border-primary/30 bg-primary/10 px-3 text-sm font-black text-primary">{lockedCategory.name}</div>
                <input type="hidden" name="categoryId" value={lockedCategory.id} />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Category</Label>
                <select id="categoryId" name="categoryId" defaultValue={article?.categoryId} required className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Select category</option>
                  {(categories ?? []).map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={article?.status ?? "draft"} className="h-10 rounded-md border bg-background px-3 text-sm">
                {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
              </select>
            </div>
            <Field label="Publication Date" name="publishedAt" defaultValue={publishedAt} type="date" required />
          </div>
        </div>
      </EditorSection>

      <EditorSection eyebrow="Executive Summary" title="The full story at a glance" description="2-3 short paragraphs a senior reader can absorb in 30 seconds.">
        <AdminAiTextField
          id="aiSummary"
          name="aiSummary"
          label="Executive summary"
          defaultValue={article?.aiSummary}
          required
          rows={7}
          actions={["expand", "rewrite", "shorten", "improve_executive_summary"]}
          articleTitle={article?.title}
        />
      </EditorSection>

      <EditorSection eyebrow="What Happened" title="The factual account" description="Grounded strictly in source material — elaborate, never invent.">
        <AdminAiTextField
          id="aiWhatHappened"
          name="aiWhatHappened"
          label="What happened"
          defaultValue={article?.aiWhatHappened}
          rows={8}
          actions={["expand", "rewrite", "shorten"]}
          articleTitle={article?.title}
          placeholder="Generated automatically during RSS ingestion. Falls back to the original excerpt on the public page if left blank."
        />
      </EditorSection>

      <EditorSection eyebrow="Why It Matters" title="The analysis" description="Implications for executives, GMs, owners, developers, investors, architects, and operators — not a restatement of the news.">
        <AdminAiTextField
          id="aiWhyItMatters"
          name="aiWhyItMatters"
          label="Why it matters"
          defaultValue={article?.aiWhyItMatters}
          rows={8}
          actions={["expand", "rewrite", "shorten", "improve_why_it_matters"]}
          articleTitle={article?.title}
          placeholder="Generated automatically during RSS ingestion. Falls back to a default framing on the public page if left blank."
        />
      </EditorSection>

      <EditorSection eyebrow="Industry Context" title="Optional broader context" description="Comparable clubs, market trends, or capital context — leave blank if there's nothing meaningful to add.">
        <AdminAiTextField
          id="aiIndustryContext"
          name="aiIndustryContext"
          label="Industry context"
          defaultValue={article?.aiIndustryContext}
          rows={5}
          actions={["expand", "rewrite", "shorten"]}
          articleTitle={article?.title}
        />
      </EditorSection>

      <EditorSection eyebrow="Key Takeaways" title="Skimmable bullet points" description="3-5 concrete takeaways an executive could read in 10 seconds.">
        <AdminKeyTakeawaysField name="aiKeyTakeaways" defaultValue={article?.aiKeyTakeaways ?? []} />
      </EditorSection>

      <EditorSection eyebrow="Entity Tagging" title="Clubs, companies, and people" description="Connects this briefing into the Intelligence Graph for future profile pages and search.">
        <AdminEntityTagging
          clubs={entityOptions.clubs}
          companies={entityOptions.companies}
          people={entityOptions.people}
          selectedClubIds={article?.clubs.map((club) => club.id) ?? []}
          selectedCompanyIds={article?.companies.map((company) => company.id) ?? []}
          selectedPersonIds={article?.people.map((person) => person.id) ?? []}
        />
      </EditorSection>

      <EditorSection eyebrow="Article Metadata" title="Supporting details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Dek / Subtitle" name="dek" defaultValue={article?.dek ?? undefined} placeholder="One-sentence subtitle shown under the headline" />
          <Field label="Original URL" name="originalUrl" defaultValue={article?.originalUrl} type="url" required />
          <Field label="Author" name="author" defaultValue={article?.author ?? undefined} />
          <Field label="Club Name" name="clubName" defaultValue={article?.clubName ?? undefined} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" name="city" defaultValue={article?.city ?? undefined} />
            <Field label="State" name="state" defaultValue={article?.state ?? undefined} />
          </div>
          <Field label="Tags" name="tags" defaultValue={article?.tags.join(", ")} placeholder="governance, capital planning" />
          <div className="grid gap-2">
            <Label htmlFor="heroImageId">Lead Photo</Label>
            <select id="heroImageId" name="heroImageId" defaultValue={article?.heroImageId ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">Use category default</option>
              {mediaAssets.map((asset) => <option value={asset.id} key={asset.id}>{asset.title}</option>)}
            </select>
          </div>
          <Field label="Importance Score" name="importanceScore" type="number" min="0" max="100" defaultValue={String(article?.importanceScore ?? 50)} required />
        </div>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="originalExcerpt">Original RSS Excerpt</Label>
          <Textarea id="originalExcerpt" name="originalExcerpt" defaultValue={article?.originalExcerpt ?? undefined} rows={3} />
        </div>
      </EditorSection>

      <div className="sticky bottom-4 flex justify-end rounded-lg border bg-white/95 p-4 shadow-lg backdrop-blur">
        <Button type="submit" size="lg">{article ? "Update Article" : "Create Article"}</Button>
      </div>
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
