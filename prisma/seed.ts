import { PrismaClient, ArticleStatus, NewsletterFrequency } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  if (!existsSync(".env")) return;

  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

loadLocalEnv();

const prisma = new PrismaClient();

const categories = [
  ["Industry News", "industry-news", "Market, ownership, governance, and industry-wide updates."],
  ["Club Developments & Renovations", "developments-renovations", "Capital projects, clubhouse work, course improvements, and amenity investments."],
  ["Executive Moves", "executive-moves", "GM, COO, director, chef, superintendent, and board leadership updates."],
  ["Jobs", "jobs", "Hiring signals and notable open roles across private clubs."],
  ["Technology", "technology", "Software, data, AI, member experience, payments, and operational technology."],
  ["Best Practices", "best-practices", "Operational insights for leaders and department heads."],
  ["Rankings & Data", "rankings-data", "Lists, benchmarks, research, compensation, utilization, and performance data."]
] as const;

const sources = [
  ["Club Management Update", "https://example.com/cmu", "https://example.com/cmu/rss"],
  ["Private Club Insider", "https://example.com/pci", "https://example.com/pci/rss"],
  ["Golf Business Journal", "https://example.com/gbj", "https://example.com/gbj/rss"],
  ["Resort & Club Design", "https://example.com/rcd", "https://example.com/rcd/rss"],
  ["Hospitality Tech Ledger", "https://example.com/htl", "https://example.com/htl/rss"]
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const categoryRecords = await Promise.all(
    categories.map(([name, slug, description]) =>
      prisma.category.upsert({
        where: { slug },
        update: { name, description },
        create: { name, slug, description }
      })
    )
  );

  const sourceRecords = await Promise.all(
    sources.map(([name, homepageUrl, rssUrl]) =>
      prisma.source.upsert({
        where: { name },
        update: { homepageUrl, rssUrl },
        create: { name, homepageUrl, rssUrl }
      })
    )
  );

  const categoryBySlug = Object.fromEntries(categoryRecords.map((category) => [category.slug, category]));
  const sourceByName = Object.fromEntries(sourceRecords.map((source) => [source.name, source]));
  const mediaRecords = await Promise.all([
    prisma.mediaAsset.upsert({
      where: { url: "/images/clubhouse-hero.png" },
      update: {
        title: "Clubhouse Terrace",
        altText: "Private club clubhouse terrace at golden hour",
        category: "hero"
      },
      create: {
        title: "Clubhouse Terrace",
        url: "/images/clubhouse-hero.png",
        altText: "Private club clubhouse terrace at golden hour",
        category: "hero"
      }
    }),
    prisma.mediaAsset.upsert({
      where: { url: "/images/renovation-planning.png" },
      update: {
        title: "Renovation Planning",
        altText: "Private club renovation planning materials on a conference table",
        category: "renovation"
      },
      create: {
        title: "Renovation Planning",
        url: "/images/renovation-planning.png",
        altText: "Private club renovation planning materials on a conference table",
        category: "renovation"
      }
    }),
    prisma.mediaAsset.upsert({
      where: { url: "/images/club-tech-dashboard.png" },
      update: {
        title: "Club Technology Dashboard",
        altText: "Private club operations technology dashboard",
        category: "technology"
      },
      create: {
        title: "Club Technology Dashboard",
        url: "/images/club-tech-dashboard.png",
        altText: "Private club operations technology dashboard",
        category: "technology"
      }
    })
  ]);
  const mediaByCategory = Object.fromEntries(mediaRecords.map((asset) => [asset.category ?? "hero", asset]));

  const articles = [
    {
      title: "Harbor Point Club Approves $18M Waterfront Clubhouse Renovation",
      originalUrl: "https://example.com/articles/harbor-point-renovation",
      sourceName: "Resort & Club Design",
      author: "Mara Ellison",
      publishedAt: new Date("2026-06-13T14:00:00.000Z"),
      categorySlug: "developments-renovations",
      tags: ["clubhouse", "capital planning", "yacht clubs"],
      clubName: "Harbor Point Club",
      city: "Annapolis",
      state: "MD",
      originalExcerpt: "Members approved a multi-phase clubhouse refresh anchored by dining, locker room, and marina service upgrades.",
      aiSummary: "Harbor Point Club will begin an $18 million waterfront renovation focused on food and beverage capacity, locker rooms, and marina services. The project reflects continued member demand for upgraded casual dining and year-round social spaces.",
      importanceScore: 88,
      status: ArticleStatus.published,
      heroImageId: mediaByCategory.renovation.id
    },
    {
      title: "Private Clubs Expand Waitlists as Family Programming Drives Demand",
      originalUrl: "https://example.com/articles/family-programming-waitlists",
      sourceName: "Private Club Insider",
      author: "Darren Lowe",
      publishedAt: new Date("2026-06-11T11:30:00.000Z"),
      categorySlug: "industry-news",
      tags: ["membership", "family programming", "demand"],
      clubName: null,
      city: null,
      state: null,
      originalExcerpt: "Clubs with strong youth, wellness, and casual dining programs are reporting longer waitlists and higher retention.",
      aiSummary: "Demand remains strongest at clubs investing in family programming, wellness, and casual dining. Operators are using waitlist strategy, initiation pricing, and onboarding improvements to manage growth without eroding member experience.",
      importanceScore: 82,
      status: ArticleStatus.published,
      heroImageId: mediaByCategory.hero.id
    },
    {
      title: "Oak Ridge Country Club Names Dana Patel as Chief Operating Officer",
      originalUrl: "https://example.com/articles/oak-ridge-dana-patel",
      sourceName: "Club Management Update",
      author: "Staff Report",
      publishedAt: new Date("2026-06-10T15:45:00.000Z"),
      categorySlug: "executive-moves",
      tags: ["COO", "leadership", "governance"],
      clubName: "Oak Ridge Country Club",
      city: "Charlotte",
      state: "NC",
      originalExcerpt: "Patel joins Oak Ridge after leading member experience and strategic planning at two top-tier clubs in the Southeast.",
      aiSummary: "Oak Ridge Country Club appointed Dana Patel as COO, signaling a stronger focus on cross-department execution and member experience. Patel's background spans strategic planning, F&B modernization, and staff development.",
      importanceScore: 74,
      status: ArticleStatus.reviewed,
      heroImageId: mediaByCategory.technology.id
    },
    {
      title: "Clubs Test AI Concierge Tools for Dining, Events, and Member Requests",
      originalUrl: "https://example.com/articles/ai-concierge-clubs",
      sourceName: "Hospitality Tech Ledger",
      author: "Nina Brooks",
      publishedAt: new Date("2026-06-08T09:15:00.000Z"),
      categorySlug: "technology",
      tags: ["AI", "member experience", "concierge"],
      clubName: null,
      city: null,
      state: null,
      originalExcerpt: "Early pilots are focused on reservation questions, event discovery, and routing member requests to the right department.",
      aiSummary: "Several private clubs are piloting AI concierge systems to answer routine member questions and route service requests. The near-term opportunity is operational leverage, though clubs are moving carefully around tone, privacy, and escalation.",
      importanceScore: 79,
      status: ArticleStatus.published,
      heroImageId: mediaByCategory.technology.id
    },
    {
      title: "Benchmark: Clubs Increasing Capital Reserve Contributions for Course Infrastructure",
      originalUrl: "https://example.com/articles/capital-reserve-course-infrastructure",
      sourceName: "Golf Business Journal",
      author: "Elliot Chen",
      publishedAt: new Date("2026-06-05T13:20:00.000Z"),
      categorySlug: "rankings-data",
      tags: ["benchmarking", "capital reserve", "golf course"],
      clubName: null,
      city: null,
      state: null,
      originalExcerpt: "A new benchmark suggests clubs are raising annual reserve contributions to address irrigation, drainage, and bunker cycles.",
      aiSummary: "A new benchmark indicates clubs are increasing reserve contributions for course infrastructure, especially irrigation and drainage. Boards are treating long-cycle assets as a recurring governance priority rather than one-off campaign items.",
      importanceScore: 84,
      status: ArticleStatus.published,
      heroImageId: mediaByCategory.technology.id
    },
    {
      title: "How Leading Clubs Are Rebuilding Department Head Meetings",
      originalUrl: "https://example.com/articles/department-head-meetings",
      sourceName: "Club Management Update",
      author: "Leslie Grant",
      publishedAt: new Date("2026-06-03T10:00:00.000Z"),
      categorySlug: "best-practices",
      tags: ["operations", "leadership", "meetings"],
      clubName: null,
      city: null,
      state: null,
      originalExcerpt: "GMs are shortening updates, clarifying ownership, and tying weekly meetings to the member calendar.",
      aiSummary: "Clubs are shifting department head meetings away from round-robin updates and toward decisions, blockers, and member-facing execution. The strongest examples use tight agendas, shared dashboards, and clearer follow-through.",
      importanceScore: 70,
      status: ArticleStatus.draft,
      heroImageId: mediaByCategory.hero.id
    }
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { originalUrl: article.originalUrl },
      update: {
        title: article.title,
        slug: slugify(article.title),
        author: article.author,
        publishedAt: article.publishedAt,
        tags: article.tags,
        clubName: article.clubName,
        city: article.city,
        state: article.state,
        originalExcerpt: article.originalExcerpt,
        aiSummary: article.aiSummary,
        importanceScore: article.importanceScore,
        status: article.status,
        heroImageId: article.heroImageId,
        sourceId: sourceByName[article.sourceName].id,
        categoryId: categoryBySlug[article.categorySlug].id
      },
      create: {
        title: article.title,
        slug: slugify(article.title),
        originalUrl: article.originalUrl,
        author: article.author,
        publishedAt: article.publishedAt,
        tags: article.tags,
        clubName: article.clubName,
        city: article.city,
        state: article.state,
        originalExcerpt: article.originalExcerpt,
        aiSummary: article.aiSummary,
        importanceScore: article.importanceScore,
        status: article.status,
        heroImageId: article.heroImageId,
        sourceId: sourceByName[article.sourceName].id,
        categoryId: categoryBySlug[article.categorySlug].id
      }
    });
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: "gm@harborpoint.example" },
    update: { frequency: NewsletterFrequency.weekly },
    create: { email: "gm@harborpoint.example", frequency: NewsletterFrequency.weekly }
  });

  await prisma.jobPosting.createMany({
    data: [
      {
        title: "Director of Member Experience",
        clubName: "Summit Lake Club",
        city: "Denver",
        state: "CO",
        description: "Lead programming, communications, and member journey improvements for a growing four-season club."
      },
      {
        title: "Executive Chef",
        clubName: "The Crescent Club",
        city: "Naples",
        state: "FL",
        description: "Modernize dining operations across casual, banquet, and seasonal outlets."
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
