export const categoryNav = [
  { label: "Home Feed", href: "/" },
  { label: "Industry News", href: "/industry-news" },
  { label: "Developments", href: "/developments" },
  { label: "Executive Moves", href: "/executive-moves" },
  { label: "Jobs", href: "/jobs" },
  { label: "Technology", href: "/technology" },
  { label: "Best Practices", href: "/best-practices" },
  { label: "Rankings & Data", href: "/rankings-data" },
  { label: "Newsletter", href: "/newsletter" }
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
