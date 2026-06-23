"use client";

import { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Archive, Calendar, CheckCircle2, Pencil, RotateCcw, XCircle } from "lucide-react";
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
};

export function AdminIntakeRow({ item, categoryOptions }: Props) {
  const [editing, setEditing] = useState(false);
  const tier = importanceTier(item.suggestedImportance);

  return (
    <div className="grid gap-4 rounded-lg border bg-white p-5 md:grid-cols-[120px_1fr_auto]">
      <div className="overflow-hidden rounded-md bg-muted">
        {item.suggestedHeroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.suggestedHeroImageUrl} alt="" className="h-24 w-full object-cover" />
        ) : (
          <div className="flex h-24 w-full items-center justify-center text-[10px] font-bold uppercase text-muted-foreground">No Image</div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <span>{item.source.name}</span>
          <span>·</span>
          <span>{format(item.publishedAt, "MMM d, yyyy")}</span>
          <Badge className={tierBadgeClass(tier)}>{tier}</Badge>
          {item.duplicateConfidence >= 70 ? (
            <Badge className="border-amber-300 bg-amber-50 text-amber-800"><AlertTriangle className="mr-1 h-3 w-3" />Possible Duplicate ({item.duplicateConfidence}%)</Badge>
          ) : null}
        </div>

        {editing ? (
          <form
            action={async (formData) => {
              await updateIntakeItem(item.id, formData);
              setEditing(false);
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
                <select id={`category-${item.id}`} name="suggestedCategorySlug" defaultValue={item.suggestedCategorySlug ?? ""} className="h-10 rounded-md border bg-background px-3 text-sm">
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
              <Label htmlFor={`tags-${item.id}`}>Tags (comma separated)</Label>
              <Input id={`tags-${item.id}`} name="suggestedTags" defaultValue={item.suggestedTags.join(", ")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`summary-${item.id}`}>Executive summary</Label>
              <Textarea id={`summary-${item.id}`} name="executiveSummary" defaultValue={item.executiveSummary} rows={4} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save Changes</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="font-serif mt-2 text-xl font-black leading-tight">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.executiveSummary}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {item.suggestedTags.map((tag) => <Badge key={tag} className="border-slate-200 bg-white text-slate-700">{tag}</Badge>)}
              {item.suggestedCategorySlug ? <Badge className="border-primary/30 bg-primary/5 text-primary">{item.suggestedCategorySlug}</Badge> : <Badge className="border-amber-300 bg-amber-50 text-amber-800">No category</Badge>}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <Badge className="border-slate-200 bg-slate-50 text-slate-700 capitalize">{item.status}</Badge>

        {item.status === "pending" || item.status === "scheduled" ? (
          <>
            <form action={approveIntakeItem.bind(null, item.id)}>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="h-4 w-4" /> Approve</Button>
            </form>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing((value) => !value)}><Pencil className="h-4 w-4" /> Edit</Button>
            <form action={rejectIntakeItem.bind(null, item.id)}>
              <Button type="submit" size="sm" variant="ghost"><XCircle className="h-4 w-4" /> Reject</Button>
            </form>
            {item.status === "pending" ? (
              <form action={scheduleIntakeItem.bind(null, item.id)} className="flex items-end gap-2">
                <input type="datetime-local" name="scheduledFor" className="h-9 rounded-md border bg-background px-2 text-xs" required />
                <Button type="submit" size="sm" variant="ghost"><Calendar className="h-4 w-4" /> Schedule</Button>
              </form>
            ) : null}
            <form action={archiveIntakeItem.bind(null, item.id)}>
              <Button type="submit" size="sm" variant="ghost"><Archive className="h-4 w-4" /> Archive</Button>
            </form>
          </>
        ) : (
          <form action={restoreIntakeItem.bind(null, item.id)}>
            <Button type="submit" size="sm" variant="ghost"><RotateCcw className="h-4 w-4" /> Restore to Pending</Button>
          </form>
        )}
      </div>
    </div>
  );
}

function tierBadgeClass(tier: string) {
  if (tier === "Breaking") return "border-red-300 bg-red-50 text-red-800";
  if (tier === "Major") return "border-amber-300 bg-amber-50 text-amber-800";
  if (tier === "Important") return "border-blue-300 bg-blue-50 text-blue-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}
