"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Pencil,
  RotateCcw,
  Sparkles,
  XCircle
} from "lucide-react";
import {
  approveIntakeItem,
  archiveIntakeItem,
  rejectIntakeItem,
  restoreIntakeItem,
  scheduleIntakeItem,
  updateIntakeItem
} from "@/app/admin/intake/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { importanceTier } from "@/lib/importance";
import type { IntakeItem, Source } from "@prisma/client";

type Props = {
  item: IntakeItem & { source: Source };
  categoryOptions: { value: string; label: string }[];
  aiConfigured: boolean;
};

export function AdminIntakeCard({ item, categoryOptions, aiConfigured }: Props) {
  const [editing, setEditing] = useState(false);
  const tier = importanceTier(item.suggestedImportance);
  const isDuplicate = item.duplicateConfidence >= 70;
  const categoryLabel = categoryOptions.find((option) => option.value === item.suggestedCategorySlug)?.label;

  return (
    <article className="rounded-lg border bg-white shadow-sm">
      <div className="grid gap-5 p-5 md:grid-cols-[112px_1fr]">
        <div className="overflow-hidden rounded-md bg-muted">
          {item.suggestedHeroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.suggestedHeroImageUrl} alt="" className="h-28 w-full object-cover" />
          ) : (
            <div className="flex h-28 w-full items-center justify-center px-2 text-center text-[10px] font-bold uppercase text-muted-foreground">No Image</div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={tierBadgeClass(tier)}>{tier}</Badge>
            <Badge className="border-slate-200 bg-slate-50 capitalize text-slate-700">{item.status}</Badge>
            {isDuplicate ? (
              <Badge className="border-amber-300 bg-amber-50 text-amber-800">
                <AlertTriangle className="mr-1 h-3 w-3" /> Possible Duplicate · {item.duplicateConfidence}% confidence
              </Badge>
            ) : null}
          </div>

          {editing ? (
            <EditForm item={item} categoryOptions={categoryOptions} onDone={() => setEditing(false)} />
          ) : (
            <>
              <h3 className="font-serif mt-3 text-2xl font-black leading-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.executiveSummary}</p>
            </>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t pt-4 text-xs sm:grid-cols-4">
            <Meta label="Source" value={item.source.name} />
            <Meta
              label="Imported"
              value={formatDistanceToNow(item.createdAt, { addSuffix: true })}
              title={format(item.createdAt, "MMM d, yyyy, h:mm a")}
            />
            <Meta label="Published" value={format(item.publishedAt, "MMM d, yyyy")} />
            <Meta label="Category" value={categoryLabel ?? "Uncategorized"} />
          </dl>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <a
              href={item.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary"
            >
              Original Article <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {!editing ? (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.suggestedTags.length ? (
                item.suggestedTags.map((tag) => <Badge key={tag} className="border-slate-200 bg-white text-slate-700">{tag}</Badge>)
              ) : (
                <span className="text-xs text-muted-foreground">No entities matched yet.</span>
              )}
            </div>
          ) : null}

          <div className="mt-4 rounded-md border border-dashed bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide text-muted-foreground/80">
              <Sparkles className="h-3.5 w-3.5" /> Why This Was Flagged
            </div>
            {aiConfigured ? (
              <p className="mt-1">AI reasoning for this importance score will appear here once entity-level enrichment is wired up.</p>
            ) : (
              <p className="mt-1">
                OpenAI is not configured (<code>OPENAI_API_KEY</code>). Importance is a deterministic estimate from source priority and
                keyword signals — once configured, this section will show the AI&rsquo;s reasoning and detected entity confidence.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {item.status === "pending" || item.status === "scheduled" ? (
            <>
              <form action={approveIntakeItem.bind(null, item.id)}>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
              </form>
              <Button type="button" size="sm" variant="outline" onClick={() => setEditing((value) => !value)}>
                <Pencil className="h-4 w-4" /> {editing ? "Cancel Edit" : "Edit Before Approving"}
              </Button>
              <form action={rejectIntakeItem.bind(null, item.id)}>
                <Button type="submit" size="sm" variant="ghost">
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </form>
              <form action={archiveIntakeItem.bind(null, item.id)}>
                <Button type="submit" size="sm" variant="ghost">
                  <Archive className="h-4 w-4" /> Archive
                </Button>
              </form>
            </>
          ) : (
            <form action={restoreIntakeItem.bind(null, item.id)}>
              <Button type="submit" size="sm" variant="ghost">
                <RotateCcw className="h-4 w-4" /> Restore to Pending
              </Button>
            </form>
          )}
        </div>

        {item.status === "pending" ? (
          <form action={scheduleIntakeItem.bind(null, item.id)} className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <input type="datetime-local" name="scheduledFor" className="h-8 rounded-md border bg-background px-2 text-xs" required />
            <Button type="submit" size="sm" variant="ghost">
              <Calendar className="h-4 w-4" /> Schedule
            </Button>
          </form>
        ) : null}
      </div>
    </article>
  );
}

function EditForm({
  item,
  categoryOptions,
  onDone
}: {
  item: IntakeItem;
  categoryOptions: { value: string; label: string }[];
  onDone: () => void;
}) {
  return (
    <form
      action={async (formData) => {
        await updateIntakeItem(item.id, formData);
        onDone();
      }}
      className="mt-3 grid gap-3"
    >
      <div className="grid gap-2">
        <Label htmlFor={`title-${item.id}`}>Headline</Label>
        <Input id={`title-${item.id}`} name="title" defaultValue={item.title} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`category-${item.id}`}>Category</Label>
          <select
            id={`category-${item.id}`}
            name="suggestedCategorySlug"
            defaultValue={item.suggestedCategorySlug ?? ""}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="" disabled>Choose a category</option>
            {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`importance-${item.id}`}>Importance (0-100)</Label>
          <Input id={`importance-${item.id}`} name="suggestedImportance" type="number" min={0} max={100} defaultValue={item.suggestedImportance} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`tags-${item.id}`}>Tags / entities (comma separated)</Label>
        <Input id={`tags-${item.id}`} name="suggestedTags" defaultValue={item.suggestedTags.join(", ")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`summary-${item.id}`}>Executive summary</Label>
        <Textarea id={`summary-${item.id}`} name="executiveSummary" defaultValue={item.executiveSummary} rows={4} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save Changes</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

function Meta({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div title={title}>
      <dt className="font-bold uppercase tracking-wide text-muted-foreground/70">{label}</dt>
      <dd className="mt-0.5 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function tierBadgeClass(tier: string) {
  if (tier === "Breaking") return "border-red-300 bg-red-50 text-red-800";
  if (tier === "Major") return "border-amber-300 bg-amber-50 text-amber-800";
  if (tier === "Important") return "border-blue-300 bg-blue-50 text-blue-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}
