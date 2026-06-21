import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Cpu,
  Edit,
  FileClock,
  Headphones,
  AlertTriangle,
  Landmark,
  Mail,
  Newspaper,
  PlusCircle,
  Sparkles,
  Trophy,
  UserRoundPlus
} from "lucide-react";
import type { ArticleStatus } from "@prisma/client";
import { AdminTabs } from "@/components/admin-tabs";
import { Badge } from "@/components/ui/badge";
import { adminEditHref, adminSections, articleAdminEditHref, type AdminSection } from "@/lib/admin-sections";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const icons = [Newspaper, Building2, UserRoundPlus, BriefcaseBusiness, Cpu, BarChart3, Landmark, Trophy, Headphones, Sparkles];

const quickActionIcons: Record<string, typeof Newspaper> = {
  industry: Newspaper,
  developments: Building2,
  "executive-moves": UserRoundPlus,
  jobs: BriefcaseBusiness,
  technology: Cpu,
  "mergers-acquisitions": Landmark,
  "capital-investments": BarChart3,
  "club-rankings": Trophy,
  podcasts: Headphones,
  clubopspro: Sparkles
};

async function sectionCounts(section: AdminSection) {
  if (section.kind === "article") return { total: await prisma.article.count({ where: { category: { slug: section.categorySlug } } }), published: await prisma.article.count({ where: { category: { slug: section.categorySlug }, status: "published" } }) };
  if (section.kind === "job") return { total: await prisma.jobPosting.count(), published: await prisma.jobPosting.count({ where: { status: "published" } }) };
  if (section.kind === "executiveMove") return { total: await prisma.executiveMove.count(), published: await prisma.executiveMove.count({ where: { status: "published" } }) };
  if (section.kind === "ranking") return { total: await prisma.rankingEntry.count(), published: await prisma.rankingEntry.count({ where: { status: "published" } }) };
  return { total: await prisma.podcastEpisode.count(), published: await prisma.podcastEpisode.count({ where: { status: "published" } }) };
}

async function articleCategoryCount(categorySlug: string) {
  return prisma.article.count({ where: { category: { slug: categorySlug } } });
}

const managedArticleCategorySlugs = adminSections
  .filter((section) => section.kind === "article")
  .map((section) => section.categorySlug);

function sectionLabelForCategory(categorySlug: string) {
  return adminSections.find((section) => section.kind === "article" && section.categorySlug === categorySlug)?.label;
}

export default async function AdminDashboard() {
  const [
    deskCounts,
    publishedStories,
    draftStories,
    reviewedStories,
    totalJobs,
    totalExecutiveMoves,
    totalDevelopments,
    totalTechnology,
    totalMergersAcquisitions,
    totalCapitalInvestments,
    totalRankingEntries,
    totalPodcastEpisodes,
    newsletterSubscribers,
    attentionJobs,
    attentionExecutiveMoves,
    attentionRankings,
    attentionPodcasts,
    recentArticles,
    recentJobs,
    recentExecutiveMoves,
    recentDevelopments,
    draftArticles,
    reviewedArticles,
    unmanagedArticles
  ] = await Promise.all([
    Promise.all(adminSections.map(sectionCounts)),
    prisma.article.count({ where: { status: "published" } }),
    prisma.article.count({ where: { status: "draft" } }),
    prisma.article.count({ where: { status: "reviewed" } }),
    prisma.jobPosting.count(),
    prisma.executiveMove.count(),
    articleCategoryCount("developments-renovations"),
    articleCategoryCount("technology"),
    articleCategoryCount("mergers-acquisitions"),
    articleCategoryCount("capital-investments"),
    prisma.rankingEntry.count(),
    prisma.podcastEpisode.count(),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.jobPosting.findMany({ where: { status: { not: "published" } }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.executiveMove.findMany({ where: { status: { not: "published" } }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.rankingEntry.findMany({ where: { status: { not: "published" } }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.podcastEpisode.findMany({ where: { status: { not: "published" } }, orderBy: { updatedAt: "desc" }, take: 6 }),
    prisma.article.findMany({
      where: { category: { slug: { in: managedArticleCategorySlugs } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { category: true }
    }),
    prisma.jobPosting.findMany({ orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.executiveMove.findMany({ orderBy: { updatedAt: "desc" }, take: 4 }),
    prisma.article.findMany({
      where: { category: { slug: "developments-renovations" } },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { category: true }
    }),
    prisma.article.findMany({
      where: { status: "draft", category: { slug: { in: managedArticleCategorySlugs } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { category: true }
    }),
    prisma.article.findMany({
      where: { status: "reviewed", category: { slug: { in: managedArticleCategorySlugs } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { category: true }
    }),
    prisma.article.findMany({
      where: { status: { in: ["draft", "reviewed"] }, category: { slug: { notIn: managedArticleCategorySlugs } } },
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { category: true }
    })
  ]);

  const deskTotal = deskCounts.reduce((sum, item) => sum + item.total, 0);
  const deskPublished = deskCounts.reduce((sum, item) => sum + item.published, 0);

  const statCards = [
    { label: "Published Stories", value: publishedStories, accent: "text-emerald-300" },
    { label: "Draft Stories", value: draftStories },
    { label: "Reviewed Stories", value: reviewedStories, accent: "text-amber-300" },
    { label: "Total Jobs", value: totalJobs },
    { label: "Executive Moves", value: totalExecutiveMoves },
    { label: "Development Stories", value: totalDevelopments },
    { label: "Technology Stories", value: totalTechnology },
    { label: "M&A Stories", value: totalMergersAcquisitions },
    { label: "Capital Investments", value: totalCapitalInvestments },
    { label: "Ranking Entries", value: totalRankingEntries },
    { label: "Podcast Episodes", value: totalPodcastEpisodes },
    { label: "Newsletter Subscribers", value: newsletterSubscribers, accent: "text-emerald-300" }
  ];

  type ActivityRow = { id: string; title: string; section: string; status: ArticleStatus; date: Date; href: string | undefined };

  const activity = [
    ...recentArticles.map((a) => ({
      id: a.id,
      title: a.title,
      section: sectionLabelForCategory(a.category.slug) ?? a.category.name,
      status: a.status,
      date: a.updatedAt,
      href: articleAdminEditHref(a.category.slug, a.id)
    })),
    ...recentJobs.map((j) => ({ id: j.id, title: j.title, section: "Jobs", status: j.status, date: j.updatedAt, href: adminEditHref("jobs", j.id) })),
    ...recentExecutiveMoves.map((e) => ({
      id: e.id,
      title: `${e.executive} — ${e.newRole}`,
      section: "Executive Moves",
      status: e.status,
      date: e.updatedAt,
      href: adminEditHref("executive-moves", e.id)
    })),
    ...recentDevelopments.map((d) => ({
      id: d.id,
      title: d.title,
      section: "Club Developments",
      status: d.status,
      date: d.updatedAt,
      href: articleAdminEditHref(d.category.slug, d.id)
    }))
  ]
    .filter((row): row is ActivityRow & { href: string } => Boolean(row.href))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  const needsAttention = [
    ...draftArticles.map((a) => ({ id: a.id, title: a.title, section: sectionLabelForCategory(a.category.slug)!, status: a.status, date: a.updatedAt, href: articleAdminEditHref(a.category.slug, a.id)! })),
    ...reviewedArticles.map((a) => ({ id: a.id, title: a.title, section: sectionLabelForCategory(a.category.slug)!, status: a.status, date: a.updatedAt, href: articleAdminEditHref(a.category.slug, a.id)! })),
    ...attentionJobs.map((item) => ({ id: item.id, title: item.title, section: "Jobs", status: item.status, date: item.updatedAt, href: adminEditHref("jobs", item.id)! })),
    ...attentionExecutiveMoves.map((item) => ({ id: item.id, title: `${item.executive} — ${item.newRole}`, section: "Executive Moves", status: item.status, date: item.updatedAt, href: adminEditHref("executive-moves", item.id)! })),
    ...attentionRankings.map((item) => ({ id: item.id, title: `#${item.rank} ${item.clubName}`, section: "Club Rankings", status: item.status, date: item.updatedAt, href: adminEditHref("club-rankings", item.id)! })),
    ...attentionPodcasts.map((item) => ({ id: item.id, title: item.title, section: "Podcasts", status: item.status, date: item.updatedAt, href: adminEditHref("podcasts", item.id)! }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

  return (
    <main className="container-shell py-8">
      <AdminTabs />

      <section className="mb-8 border bg-ink p-7 text-white">
        <div className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">ClubFlow Newsroom</div>
        <h1 className="font-serif mt-2 text-4xl font-black">Newsroom Dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
          Live publishing metrics across every desk. Each workspace stays locked to its public section so editors can move fast without
          risking a miscategorized story.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-px bg-white/15 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-ink p-4">
              <div className={`number-tabular text-2xl font-black ${stat.accent ?? ""}`}>{stat.value}</div>
              <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-2xl font-black">Quick Actions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {adminSections.map((section) => {
            const Icon = quickActionIcons[section.slug] ?? Newspaper;
            return (
              <Link
                key={section.slug}
                href={`/admin/${section.slug}/new`}
                className="intelligence-card group flex flex-col gap-3 p-4 no-underline hover:border-primary"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-black group-hover:text-primary">New {section.label}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mb-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <FileClock className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-2xl font-black">Recent Activity</h2>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={`${row.section}-${row.id}`} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-bold">{row.title}</div>
                      <div className="text-xs text-muted-foreground">{row.section}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{format(row.date, "MMM d, yyyy")}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={row.href} className="inline-flex items-center gap-1 text-xs font-bold text-primary no-underline">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {!activity.length ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      No recent activity yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="font-serif text-2xl font-black">Needs Attention</h2>
          </div>
          <div className="space-y-3">
            {needsAttention.map((row) => (
              <Link
                key={`${row.section}-${row.id}`}
                href={row.href}
                className="intelligence-card flex items-center justify-between gap-3 p-4 no-underline hover:border-primary"
              >
                <div>
                  <div className="text-sm font-bold">{row.title}</div>
                  <div className="text-xs text-muted-foreground">{row.section}</div>
                </div>
                <StatusBadge status={row.status} />
              </Link>
            ))}
            {unmanagedArticles.map((row) => (
              <div key={row.id} className="intelligence-card flex items-start gap-3 border-amber-200 bg-amber-50/50 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div>
                  <div className="text-sm font-bold">{row.title}</div>
                  <div className="mt-1 text-xs leading-5 text-amber-800">Legacy {row.category.name} article — no section editor is available. This item is intentionally not linked.</div>
                </div>
              </div>
            ))}
            {!needsAttention.length && !unmanagedArticles.length ? (
              <div className="intelligence-card p-6 text-center text-sm text-muted-foreground">All caught up — nothing waiting.</div>
            ) : null}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl font-black">Content Desks</h2>
          <div className="flex gap-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <span>{deskTotal} total</span>
            <span className="text-primary">{deskPublished} published</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section, index) => {
            const Icon = icons[index];
            const count = deskCounts[index];
            return (
              <Link key={section.slug} href={`/admin/${section.slug}`} className="group intelligence-card p-6 no-underline hover:border-primary">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <h3 className="font-serif mt-5 text-2xl font-black group-hover:text-primary">{section.label}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{section.description}</p>
                <div className="mt-5 flex gap-4 border-t pt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <span>{count.total} total</span>
                  <span className="text-primary">{count.published} published</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  const classes =
    status === "published"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "reviewed"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-slate-50 text-slate-700";
  return <Badge className={classes}>{status}</Badge>;
}
