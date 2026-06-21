import type { Source } from "@prisma/client";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sourceCategories, sourcePriorities, sourceTypes } from "@/lib/source-options";

function localDateTime(value?: Date | null) {
  if (!value) return undefined;
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

export function AdminSourceForm({ action, source }: { action: (formData: FormData) => Promise<void>; source?: Source }) {
  return (
    <form action={action} className="grid gap-6 rounded-lg border bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Source name" name="name" defaultValue={source?.name} required />
        <Field label="Website URL" name="homepageUrl" defaultValue={source?.homepageUrl ?? undefined} type="url" placeholder="https://example.com" />
        <Field label="RSS feed URL" name="rssUrl" defaultValue={source?.rssUrl ?? undefined} type="url" placeholder="https://example.com/feed" />
        <Select label="Source type" name="sourceType" defaultValue={source?.sourceType ?? "other"} options={sourceTypes} />
        <Select label="Primary category" name="primaryCategory" defaultValue={source?.primaryCategory ?? ""} options={[{ value: "", label: "Unassigned" }, ...sourceCategories]} />
        <Select label="Priority" name="priority" defaultValue={String(source?.priority ?? 50)} options={sourcePriorities.map((item) => ({ value: String(item.value), label: item.label }))} />
        <Field label="Last checked" name="lastCheckedAt" defaultValue={localDateTime(source?.lastCheckedAt)} type="datetime-local" />
        <Field label="Last successful import" name="lastSuccessfulImportAt" defaultValue={localDateTime(source?.lastSuccessfulImportAt)} type="datetime-local" />
      </div>

      <fieldset className="rounded-md border p-4">
        <legend className="px-2 text-sm font-black">Categories covered</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {sourceCategories.map((category) => (
            <label key={category.value} className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="categories" value={category.value} defaultChecked={source?.categories.includes(category.value)} />
              {category.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={source?.notes ?? undefined} placeholder="Coverage focus, feed quirks, editorial context, or import notes." />
      </div>

      <label className="flex items-center gap-2 rounded-md border bg-muted/40 p-3 text-sm font-bold">
        <input type="checkbox" name="active" value="true" defaultChecked={source?.active ?? true} />
        Active source
      </label>

      <Button type="submit">{source ? "Update Source" : "Create Source"}</Button>
    </form>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: ReadonlyArray<{ value: string; label: string }> }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} defaultValue={defaultValue} className="h-10 rounded-md border bg-background px-3 text-sm">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
