import { notFound } from "next/navigation";
import { updateClub } from "@/app/admin/clubs/actions";
import { AdminClubForm } from "@/components/admin-club-form";
import { AdminTabs } from "@/components/admin-tabs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) notFound();
  return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">Intelligence Graph</div><h1 className="font-serif mt-1 text-4xl font-black">Edit Club</h1><p className="mt-2 text-sm text-muted-foreground">Update club details without affecting existing article relationships.</p></div><AdminClubForm action={updateClub.bind(null, id)} club={club} /></main>;
}
