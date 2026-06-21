import type { Company } from "@prisma/client";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { companyIndustries, entityStatuses } from "@/lib/entity-options";

export function AdminCompanyForm({ action, company }: { action: (formData: FormData) => Promise<void>; company?: Company }) {
  return (
    <form action={action} className="grid gap-6 rounded-lg border bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Company name" name="name" defaultValue={company?.name} required />
        <Field label="Slug" name="slug" defaultValue={company?.slug} placeholder="auto-generated if blank" />
        <Select label="Industry" name="industry" defaultValue={company?.industry ?? ""} options={[{ value: "", label: "Unspecified" }, ...companyIndustries]} />
        <Field label="Headquarters" name="headquarters" defaultValue={company?.headquarters ?? undefined} placeholder="e.g. Scottsdale, Arizona" />
        <Field label="Website" name="website" defaultValue={company?.website ?? undefined} type="url" placeholder="https://example.com" />
        <Field label="Logo URL" name="logoUrl" defaultValue={company?.logoUrl ?? undefined} type="url" />
        <Select label="Status" name="status" defaultValue={company?.status ?? "active"} options={entityStatuses} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={company?.description ?? undefined} placeholder="Editorial-safe overview of the company for future profile pages." />
      </div>

      <Button type="submit">{company ? "Update Company" : "Create Company"}</Button>
    </form>
  );
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;
}

function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: ReadonlyArray<{ value: string; label: string }> }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} defaultValue={defaultValue} className="h-10 rounded-md border bg-background px-3 text-sm">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
