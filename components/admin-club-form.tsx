import type { Club } from "@prisma/client";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clubTypes, entityStatuses } from "@/lib/entity-options";

export function AdminClubForm({ action, club }: { action: (formData: FormData) => Promise<void>; club?: Club }) {
  return (
    <form action={action} className="grid gap-6 rounded-lg border bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Club name" name="name" defaultValue={club?.name} required />
        <Field label="Slug" name="slug" defaultValue={club?.slug} placeholder="auto-generated if blank" />
        <Select label="Club type" name="clubType" defaultValue={club?.clubType ?? ""} options={[{ value: "", label: "Unspecified" }, ...clubTypes]} />
        <Field label="Location" name="location" defaultValue={club?.location ?? undefined} placeholder="e.g. Cashiers, North Carolina" />
        <Field label="City" name="city" defaultValue={club?.city ?? undefined} />
        <Field label="State" name="state" defaultValue={club?.state ?? undefined} />
        <Field label="Country" name="country" defaultValue={club?.country ?? undefined} placeholder="United States" />
        <Field label="Website" name="website" defaultValue={club?.website ?? undefined} type="url" placeholder="https://example.com" />
        <Field label="Logo URL" name="logoUrl" defaultValue={club?.logoUrl ?? undefined} type="url" />
        <Field label="Founded year" name="foundedYear" defaultValue={club?.foundedYear ?? undefined} type="number" />
        <Field label="Holes" name="holes" defaultValue={club?.holes ?? undefined} type="number" />
        <Select label="Status" name="status" defaultValue={club?.status ?? "active"} options={entityStatuses} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={club?.description ?? undefined} placeholder="Editorial-safe overview of the club for future profile pages." />
      </div>

      <Button type="submit">{club ? "Update Club" : "Create Club"}</Button>
    </form>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: ReadonlyArray<{ value: string; label: string }> }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} defaultValue={defaultValue} className="h-10 rounded-md border bg-background px-3 text-sm">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
