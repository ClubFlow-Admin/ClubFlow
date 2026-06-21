import { createPerson } from "@/app/admin/people/actions";
import { AdminPersonForm } from "@/components/admin-person-form";
import { AdminTabs } from "@/components/admin-tabs";

export default function NewPersonPage() {
  return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">Intelligence Graph</div><h1 className="font-serif mt-1 text-4xl font-black">Add Person</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Add a club executive, superintendent, architect, or vendor leader for future profile pages and executive move history.</p></div><AdminPersonForm action={createPerson} /></main>;
}
