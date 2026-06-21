import { createClub } from "@/app/admin/clubs/actions";
import { AdminClubForm } from "@/components/admin-club-form";
import { AdminTabs } from "@/components/admin-tabs";

export default function NewClubPage() {
  return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">Intelligence Graph</div><h1 className="font-serif mt-1 text-4xl font-black">Add Club</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Add a private club, country club, resort, or golf community for future profile pages and article connections.</p></div><AdminClubForm action={createClub} /></main>;
}
