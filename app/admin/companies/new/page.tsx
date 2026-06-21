import { createCompany } from "@/app/admin/companies/actions";
import { AdminCompanyForm } from "@/components/admin-company-form";
import { AdminTabs } from "@/components/admin-tabs";

export default function NewCompanyPage() {
  return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">Intelligence Graph</div><h1 className="font-serif mt-1 text-4xl font-black">Add Company</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Add a club management company, technology vendor, or golf-industry firm for future profile pages and article connections.</p></div><AdminCompanyForm action={createCompany} /></main>;
}
