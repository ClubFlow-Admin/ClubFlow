import Link from "next/link";
import { Inbox } from "lucide-react";
import { AdminIntakeCard } from "@/components/admin-intake-card";
import { AdminIntakeDashboard } from "@/components/admin-intake-dashboard";
import { AdminTabs } from "@/components/admin-tabs";
import { adminSections } from "@/lib/admin-sections";
import { priorityGroup, priorityGroupOrder } from "@/lib/importance";
import { getIntakeDashboardStats } from "@/lib/intake-stats";
import { isOpenAIConfigured } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import type { IntakeItem, IntakeStatus, Source } from "@prisma/client";

export const dynamic = "force-dynamic";

const tabs: { value: IntakeStatus; label: string }[] = [
  { value: "pending", label: "Pending Review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" }
];

const categoryOptions = adminSections
  .filter((section) => section.kind === "article")
  .map((section) => ({ value: section.categorySlug, label: section.label }));

export default async function IntakeQueuePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: statusParam = "pending" } = await searchParams;
  const status = (tabs.some((tab) => tab.value === statusParam) ? statusParam : "pending") as IntakeStatus;

  const [items, counts, stats, aiConfigured] = await Promise.all([
    prisma.intakeItem.findMany({
      where: { status },
      include: { source: true },
      orderBy: status === "pending" ? [{ suggestedImportance: "desc" }, { publishedAt: "desc" }] : [{ updatedAt: "desc" }]
    }),
    prisma.intakeItem.groupBy({ by: ["status"], _count: true }),
    getIntakeDashboardStats(),
    isOpenAIConfigured()
  ]);

  const countFor = (value: IntakeStatus) => counts.find((entry) => entry.status === value)?._count ?? 0;
  const grouped = status === "pending" || status === "scheduled" ? groupByPriority(items) : null;

  return (
    <main className="container-shell py-8">
      <AdminTabs />

      <section className="mb-6 border bg-ink p-7 text-white">
        <div className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">ClubFlow Newsroom</div>
        <h1 className="font-serif mt-2 text-4xl font-black">Intake Queue</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
          Every story imported from a source lands here first. Nothing publishes automatically — approve a story to send it into the
          normal article editor as a draft, where it still requires a manual publish.
        </p>
        <p className="mt-4 text-sm text-white/70">
          No active sources to monitor yet, or want to pull in new stories right now? Manage feeds and run intake from{" "}
          <Link href="/admin/sources" className="font-bold text-emerald-300 underline">Admin → Sources</Link>.
        </p>
      </section>

      <AdminIntakeDashboard stats={stats} />

      <nav className="mb-5 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/intake?status=${tab.value}`}
            className={
              "rounded-md border px-3 py-2 text-sm font-bold no-underline " +
              (status === tab.value ? "border-primary bg-primary/10 text-primary" : "hover:border-primary hover:text-primary")
            }
          >
            {tab.label} ({countFor(tab.value)})
          </Link>
        ))}
      </nav>

      {grouped ? (
        <div className="grid gap-8">
          {priorityGroupOrder.map((group) => {
            const groupItems = grouped[group];
            if (!groupItems.length) return null;
            return (
              <section key={group}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="font-serif text-lg font-black">{group}</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">{groupItems.length}</span>
                </div>
                <div className="grid gap-4">
                  {groupItems.map((item) => (
                    <AdminIntakeCard key={item.id} item={item} categoryOptions={categoryOptions} aiConfigured={aiConfigured} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <AdminIntakeCard key={item.id} item={item} categoryOptions={categoryOptions} aiConfigured={aiConfigured} />
          ))}
        </div>
      )}

      {!items.length ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
          <div className="mt-3 font-serif text-xl font-black">Nothing here</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === "pending" ? "Run intake from Admin → Sources to pull in new stories." : `No items are currently ${status}.`}
          </p>
        </div>
      ) : null}
    </main>
  );
}

function groupByPriority(items: (IntakeItem & { source: Source })[]) {
  const buckets: Record<string, (IntakeItem & { source: Source })[]> = {};
  for (const group of priorityGroupOrder) buckets[group] = [];
  for (const item of items) buckets[priorityGroup(item.suggestedImportance)].push(item);
  return buckets;
}
