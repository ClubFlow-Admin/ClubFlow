export const categoryNav = [
  { label: "Industry", href: "/industry" },
  { label: "Developments", href: "/developments" },
  { label: "Executive Moves", href: "/executive-moves" },
  { label: "Jobs", href: "/jobs" },
  { label: "Technology", href: "/technology" },
  { label: "M&A", href: "/mergers-acquisitions" },
  { label: "Capital Investments", href: "/capital-investments" },
  { label: "Club Rankings", href: "/club-rankings" },
  { label: "Podcasts", href: "/podcasts" },
  { label: "ClubOpsPro", href: "/clubopspro" }
];

export const sectionPages = {
  "industry-news": {
    title: "Industry News",
    href: "/industry-news",
    slug: "industry-news",
    eyebrow: "Market Watch",
    description:
      "Market, membership, governance, finance, ownership, and broader private club industry coverage."
  },
  developments: {
    title: "Club Developments & Renovations",
    href: "/developments",
    slug: "developments-renovations",
    eyebrow: "Capital Projects",
    description:
      "Clubhouse renovations, course improvements, amenity investments, marina upgrades, and resort club development."
  },
  "executive-moves": {
    title: "Executive Moves",
    href: "/executive-moves",
    slug: "executive-moves",
    eyebrow: "Leadership",
    description:
      "GM, COO, department head, chef, superintendent, board, and vendor leadership changes across the club industry."
  },
  technology: {
    title: "Technology",
    href: "/technology",
    slug: "technology",
    eyebrow: "Systems & Data",
    description:
      "Software, AI, member experience tools, payments, communications, analytics, and operating technology."
  },
  "mergers-acquisitions": {
    title: "Mergers & Acquisitions",
    href: "/mergers-acquisitions",
    slug: "mergers-acquisitions",
    eyebrow: "Deal Desk",
    description: "Ownership changes, management agreements, portfolio transactions, and consolidation across the club market."
  },
  "capital-investments": {
    title: "Capital Investments",
    href: "/capital-investments",
    slug: "capital-investments",
    eyebrow: "Capital Monitor",
    description: "Member-approved projects, reserve strategy, amenity spending, and the investments reshaping club assets."
  },
  "best-practices": {
    title: "Best Practices",
    href: "/best-practices",
    slug: "best-practices",
    eyebrow: "Operations",
    description:
      "Practical ideas for club leaders, department heads, consultants, and boards improving day-to-day execution."
  },
  "rankings-data": {
    title: "Rankings & Data",
    href: "/rankings-data",
    slug: "rankings-data",
    eyebrow: "Benchmarks",
    description:
      "Rankings, benchmarks, surveys, compensation signals, capital data, and performance intelligence."
  }
} as const;
