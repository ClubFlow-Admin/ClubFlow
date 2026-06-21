import { notFound } from "next/navigation";
import { updatePerson } from "@/app/admin/people/actions";
import { AdminPersonForm } from "@/components/admin-person-form";
import { AdminTabs } from "@/components/admin-tabs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) notFound();
  return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">Intelligence Graph</div><h1 className="font-serif mt-1 text-4xl font-black">Edit Person</h1><p className="mt-2 text-sm text-muted-foreground">Update person details without affecting existing article relationships.</p></div><AdminPersonForm action={updatePerson.bind(null, id)} person={person} /></main>;
}
