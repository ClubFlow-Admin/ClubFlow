"use client";

import type { ArticleStatus, Category, MediaAsset, Source } from "@prisma/client";
import { AlertTriangle, Bot, CheckCircle2, Circle, Eye, Link2, PenLine } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { ArticleWithRelations } from "@/lib/articles";
import { estimateReadingMinutes, isValidExternalSourceUrl } from "@/lib/utils";
import { AdminAiTextField } from "@/components/admin-ai-text-field";
import { AdminEntityTagging } from "@/components/admin-entity-tagging";
import { AdminKeyTakeawaysField } from "@/components/admin-key-takeaways-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormAction = (formData: FormData) => Promise<void>;

function readFormSnapshot(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    title: String(data.get("title") ?? ""),
    sourceId: String(data.get("sourceId") ?? ""),
    aiSummary: String(data.get("aiSummary") ?? ""),
    aiWhatHappened: String(data.get("aiWhatHappened") ?? ""),
    aiWhyItMatters: String(data.get("aiWhyItMatters") ?? ""),
    aiIndustryContext: String(data.get("aiIndustryContext") ?? ""),
    originalUrl: String(data.get("originalUrl") ?? ""),
    status: String(data.get("status") ?? "draft") as ArticleStatus,
    keyTakeaways: data.getAll("aiKeyTakeaways").map(String).filter((value) => value.trim().length > 0),
    clubIds: data.getAll("clubIds").map(String),
    companyIds: data.getAll("companyIds").map(String),
    personIds: data.getAll("personIds").map(String)
  };
}

type FormSnapshot = ReturnType<typeof readFormSnapshot>;

function ChecklistRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-bold ${done ? "text-emerald-700" : "text-muted-foreground"}`}>
      {done ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> : <Circle className="h-3.5 w-3.5 flex-shrink-0" />}
      {label}
    </div>
  );
}

function CompletionBar({ snapshot }: { snapshot: FormSnapshot }) {
  const checks = [
    { label: "Headline", done: snapshot.title.trim().length > 0 },
    { label: "Source", done: snapshot.sourceId.trim().length > 0 },
    { label: "Executive Summary", done: snapshot.aiSummary.trim().length >= 20 },
    { label: "What Happened", done: snapshot.aiWhatHappened.trim().length > 0 },
    { label: "Why It Matters", done: snapshot.aiWhyItMatters.trim().length > 0 },
    { label: "Key Takeaways", done: snapshot.keyTakeaways.length > 0 },
    { label: "Entities", done: snapshot.clubIds.length + snapshot.companyIds.length + snapshot.personIds.length > 0 },
    { label: "Source Link", done: isValidExternalSourceUrl(snapshot.originalUrl) }
  ];
  const doneCount = checks.filter((check) => check.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);

  return (
    <div className="sticky top-0 z-20 rounded-lg border bg-white/95 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-black uppercase tracking-[.1em] text-primary">Briefing completeness — {doneCount}/{checks.length}</div>
        <Badge className={snapshot.status === "published" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : snapshot.status === "reviewed" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700"}>
          {snapshot.status === "published" ? "Published" : snapshot.status === "reviewed" ? "Awaiting approval" : "Draft"}
        </Badge>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {checks.map((check) => <ChecklistRow key={check.label} done={check.done} label={check.label} />)}
      </div>
    </div>
  );
}

function WordCountPreview({ snapshot }: { snapshot: FormSnapshot }) {
  const combined = [snapshot.aiSummary, snapshot.aiWhatHappened, snapshot.aiWhyItMatters, snapshot.aiIndustryContext].filter(Boolean).join(" ");
  const wordCount = combined.trim().length ? combined.trim().split(/\s+/).length : 0;
  const minutes = estimateReadingMinutes(snapshot.aiSummary, snapshot.aiWhatHappened, snapshot.aiWhyItMatters, snapshot.aiIndustryContext);

  return (
    <div className="flex items-center gap-4 rounded-md border bg-muted/30 px-4 py-2.5 text-xs font-bold text-muted-foreground">
      <span>{wordCount} words</span>
      <span aria-hidden="true">·</span>
      <span>~{minutes} min read on the public page</span>
    </div>
  );
}

function LegalChecklistPanel({ articleId, snapshot }: { articleId?: string; snapshot: FormSnapshot }) {
  const storageKey = `clubflow-legal-checklist-${articleId ?? "new"}`;
  const [manual, setManual] = useState({ noFullCopy: false, aiReviewed: false });

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setManual(JSON.parse(stored));
    } catch {
      // localStorage unavailable — checklist simply won't persist across visits.
    }
  }, [storageKey]);

  function update(key: keyof typeof manual, value: boolean) {
    const next = { ...manual, [key]: value };
    setManual(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Non-fatal — this checklist is an editorial aid, not a record of truth.
    }
  }

  const sourceCredited = snapshot.sourceId.trim().length > 0;
  const sourceLinkPresent = isValidExternalSourceUrl(snapshot.originalUrl);

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50/50 p-4 text-sm">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> Source &amp; legal checklist</div>
      <div className="mt-3 grid gap-2.5">
        <ChecklistRow done={sourceCredited} label="Source credited" />
        <ChecklistRow done={sourceLinkPresent} label="Original source link present" />
        <label className="flex items-center gap-2 text-xs font-bold text-foreground">
          <input type="checkbox" checked={manual.noFullCopy} onChange={(event) => update("noFullCopy", event.target.checked)} />
          No full third-party article copied
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-foreground">
          <input type="checkbox" checked={manual.aiReviewed} onChange={(event) => update("aiReviewed", event.target.checked)} />
          AI fields reviewed by an editor
        </label>
      </div>
      <p className="mt-3 text-[11px] leading-4 text-amber-800/80">These confirmations are saved locally in your browser as an editorial aid — they are not stored on the article record.</p>
    </div>
  );
}

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
  continueAction,
  article,
  categories,
  lockedCategory,
  mediaAssets = [],
  sources,
  entityOptions,
  openAiConfigured
}: {
  action: FormAction;
  continueAction?: FormAction;
  article?: ArticleWithRelations;
  categories?: Category[];
  lockedCategory?: Category;
  mediaAssets?: MediaAsset[];
  sources: Source[];
  entityOptions: { clubs: { id: string; name: string }[]; companies: { id: string; name: string }[]; people: { id: string; firstName: string; lastName: string }[] };
  openAiConfigured: boolean;
}) {
  const publishedAt = article?.publishedAt.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10);
  const formRef = useRef<HTMLFormElement>(null);
  const [snapshot, setSnapshot] = useState<FormSnapshot>(() => ({
    title: article?.title ?? "",
    sourceId: article?.sourceId ?? "",
    aiSummary: article?.aiSummary ?? "",
    aiWhatHappened: article?.aiWhatHappened ?? "",
    aiWhyItMatters: article?.aiWhyItMatters ?? "",
    aiIndustryContext: article?.aiIndustryContext ?? "",
    originalUrl: article?.originalUrl ?? "",
    status: article?.status ?? "draft",
    keyTakeaways: article?.aiKeyTakeaways ?? [],
    clubIds: article?.clubs.map((club) => club.id) ?? [],
    companyIds: article?.companies.map((company) => company.id) ?? [],
    personIds: article?.people.map((person) => person.id) ?? []
  }));

  function refreshSnapshot(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    setSnapshot(readFormSnapshot(form));
  }

  const previewHref = useMemo(() => {
    if (!article) return null;
    return article.status === "published" ? `/articles/${article.slug}` : `/admin/preview/${article.id}`;
  }, [article]);

  const isPublished = snapshot.status === "published";

  return (
    <form ref={formRef} action={action} onInput={refreshSnapshot} onChange={refreshSnapshot} className="grid gap-6">
      <input type="hidden" name="status" defaultValue={article?.status ?? "draft"} />

      <CompletionBar snapshot={snapshot} />

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
            <Field label="Publication Date" name="publishedAt" defaultValue={publishedAt} type="date" required />
          </div>
        </div>
      </EditorSection>

      <WordCountPreview snapshot={snapshot} />

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
          placeholder={"Example: Harbor Point Club's board approved an $18M waterfront clubhouse renovation, funded through a member capital assessment and reserve draw, with construction beginning in spring 2027."}
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
          placeholder={"Example: The club's board voted 9-2 in favor of the renovation plan at its quarterly meeting. The project will replace the existing 1980s-era clubhouse with a larger facility including an expanded dining room, fitness center, and marina-facing terrace.\n\nFunding will come from a one-time $12,000 per-member capital assessment combined with $4M from the club's reserve fund. Generated automatically during RSS ingestion — falls back to the original excerpt on the public page if left blank."}
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
          placeholder={"Example: Waterfront clubhouse projects of this scale signal growing member willingness to fund major capital assessments, a benchmark other coastal clubs may reference when building their own renovation business cases. Generated automatically during RSS ingestion — falls back to a default framing on the public page if left blank."}
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
          placeholder={"Example: At least three other coastal clubs in the region have floated similar waterfront renovation plans in board materials over the past 18 months, though none have reached a member vote yet."}
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

      <LegalChecklistPanel articleId={article?.id} snapshot={snapshot} />

      <EditorSection eyebrow="Article Metadata" title="Supporting details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Dek / Subtitle" name="dek" defaultValue={article?.dek ?? undefined} placeholder="One-sentence subtitle shown under the headline" />
          <Field label="Original URL" name="originalUrl" defaultValue={article?.originalUrl} type="url" required placeholder="https://realsource.com/article — must be a real, reachable source" />
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

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-2 rounded-lg border bg-white/95 p-4 shadow-lg backdrop-blur">
        {previewHref ? (
          <Button type="button" variant="outline" onClick={() => window.open(previewHref, "_blank", "noopener,noreferrer")}>
            <Eye className="h-4 w-4" /> Preview Article
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled title="Save the article first to preview it">
            <Eye className="h-4 w-4" /> Preview Article
          </Button>
        )}
        <Button type="submit" name="status" value="draft" variant="outline">Save Draft</Button>
        {continueAction ? <Button type="submit" formAction={continueAction} variant="outline">Save &amp; Continue</Button> : null}
        <Button type="submit" name="status" value={isPublished ? "draft" : "published"}>{isPublished ? "Unpublish" : "Publish"}</Button>
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
