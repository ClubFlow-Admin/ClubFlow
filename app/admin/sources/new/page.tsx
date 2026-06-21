import { createSource } from "@/app/admin/sources/actions";
import { AdminSourceForm } from "@/components/admin-source-form";
import { AdminTabs } from "@/components/admin-tabs";

export default function NewSourcePage() {
  return <main className="container-shell py-8"><AdminTabs /><div className="mb-6"><div className="text-xs font-bold uppercase tracking-[.14em] text-primary">Source Management</div><h1 className="font-serif mt-1 text-4xl font-black">Add Industry Source</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Add a golf, private-club, resort, development, or club-operations source for future monitoring and ingestion.</p></div><AdminSourceForm action={createSource} /></main>;
}
