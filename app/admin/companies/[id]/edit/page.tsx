import { notFound } from "next/navigation";
import { updateCompany } from "@/app/admin/companies/actions";
import { AdminCompanyForm } from "@/components/admin-company-form";
import { AdminTabs } from "@/components/admin-tabs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();
  return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">Intelligence Graph</div><h1 className="font-serif mt-1 text-4xl font-black">Edit Company</h1><p className="mt-2 text-sm text-muted-foreground">Update company details without affecting existing article relationships.</p></div><AdminCompanyForm action={updateCompany.bind(null, id)} company={company} /></main>;
}
