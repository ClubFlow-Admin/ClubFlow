import { notFound } from "next/navigation";
import { updateSource } from "@/app/admin/sources/actions";
import { AdminSourceForm } from "@/components/admin-source-form";
import { AdminTabs } from "@/components/admin-tabs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditSourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const source = await prisma.source.findUnique({ where: { id } });
  if (!source) notFound();
  return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">Source Management</div><h1 className="font-serif mt-1 text-4xl font-black">Edit Source</h1><p className="mt-2 text-sm text-muted-foreground">Update monitoring metadata without affecting existing article relationships.</p></div><AdminSourceForm action={updateSource.bind(null, id)} source={source} /></main>;
}
