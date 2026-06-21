import type { Person } from "@prisma/client";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { entityStatuses } from "@/lib/entity-options";

export function AdminPersonForm({ action, person }: { action: (formData: FormData) => Promise<void>; person?: Person }) {
  return (
    <form action={action} className="grid gap-6 rounded-lg border bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="First name" name="firstName" defaultValue={person?.firstName} required />
        <Field label="Last name" name="lastName" defaultValue={person?.lastName} required />
        <Field label="Slug" name="slug" defaultValue={person?.slug} placeholder="auto-generated if blank" />
        <Field label="Title" name="title" defaultValue={person?.title ?? undefined} placeholder="e.g. General Manager" />
        <Field label="Current organization" name="currentOrganization" defaultValue={person?.currentOrganization ?? undefined} />
        <Field label="LinkedIn URL" name="linkedInUrl" defaultValue={person?.linkedInUrl ?? undefined} type="url" />
        <Field label="Photo URL" name="photoUrl" defaultValue={person?.photoUrl ?? undefined} type="url" />
        <Select label="Status" name="status" defaultValue={person?.status ?? "active"} options={entityStatuses} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="biography">Biography</Label>
        <Textarea id="biography" name="biography" defaultValue={person?.biography ?? undefined} placeholder="Editorial-safe biography for future profile pages." />
      </div>

      <Button type="submit">{person ? "Update Person" : "Create Person"}</Button>
    </form>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: ReadonlyArray<{ value: string; label: string }> }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} defaultValue={defaultValue} className="h-10 rounded-md border bg-background px-3 text-sm">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
