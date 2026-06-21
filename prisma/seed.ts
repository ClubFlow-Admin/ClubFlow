import { ArticleStatus, NewsletterFrequency, PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}
loadLocalEnv();
const prisma = new PrismaClient();

const categories = [
  ["Industry", "industry-news", "Membership, governance, finance, ownership, and industry-wide signals."],
  ["Developments", "developments-renovations", "Clubhouse, course, wellness, marina, and amenity development."],
  ["Executive Moves", "executive-moves", "Leadership appointments across private clubs and industry partners."],
  ["Jobs", "jobs", "Notable open roles and talent signals across private clubs."],
  ["Technology", "technology", "Software, data, AI, payments, communications, and operating technology."],
  ["Mergers & Acquisitions", "mergers-acquisitions", "Ownership changes, portfolio deals, and management agreements."],
  ["Capital Investments", "capital-investments", "Capital plans, reserve strategy, and major asset investments."],
  ["Rankings & Data", "rankings-data", "Lists, benchmarks, research, and performance intelligence."],
  ["Best Practices", "best-practices", "Archived operator resources; new consulting content lives at ClubOpsPro."],
  ["ClubOpsPro", "clubopspro", "Consulting, playbooks, SOPs, leadership resources, and implementation support."]
] as const;

const sources = [
  ["ClubFlow Intelligence Desk", "https://example.com/clubflow", null],
  ["Club Management Update", "https://example.com/cmu", "https://example.com/cmu/rss"],
  ["Private Club Insider", "https://example.com/pci", "https://example.com/pci/rss"],
  ["Golf Business Journal", "https://example.com/gbj", "https://example.com/gbj/rss"],
  ["Resort & Club Design", "https://example.com/rcd", "https://example.com/rcd/rss"],
  ["Hospitality Tech Ledger", "https://example.com/htl", "https://example.com/htl/rss"]
] as const;

function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
type StorySeed = { title: string; category: string; source?: string; club?: string; city?: string; state?: string; summary: string; score?: number };
const story = (title: string, category: string, summary: string, club?: string, city?: string, state?: string, score?: number): StorySeed => ({ title, category, summary, club, city, state, score });

const stories: StorySeed[] = [
  story("Private Clubs Rework Waitlist Strategy as Family Demand Holds Firm", "industry-news", "Clubs are pairing longer waitlists with better onboarding, clearer legacy policies, and more deliberate capacity planning.", undefined, undefined, undefined, 92),
  story("Board Agendas Shift Toward Multi-Year Capital and Workforce Risk", "industry-news", "Governance calendars are moving beyond monthly financials to track asset cycles, leadership depth, and service capacity."),
  story("Wellness Becomes a Core Membership Driver, Not a Side Amenity", "industry-news", "Year-round wellness programming is changing space allocation, staffing plans, and how prospects evaluate club value."),
  story("Private Club Dining Mix Tilts Further Toward Casual and Social", "industry-news", "Operators are seeing the strongest utilization in flexible venues that support families, events, and spontaneous member use."),
  story("Clubs Test Flexible Membership Pathways for Emerging Affluent Households", "industry-news", "Pilot categories are designed to build future full members while protecting culture and long-term economics."),
  story("Insurance Renewals Put Greater Focus on Asset Documentation", "industry-news", "Clubs are tightening inventories, continuity plans, and risk controls ahead of increasingly detailed underwriting reviews."),
  story("Seasonal Staffing Plans Start Earlier as Talent Competition Persists", "industry-news", "Leading employers are compressing hiring timelines and investing more heavily in housing, onboarding, and retention."),
  story("Member Communication Teams Adopt Publisher-Style Editorial Calendars", "industry-news", "More clubs are organizing communications around member journeys and decisions instead of departmental announcements."),

  story("Harbor Point Approves $18M Waterfront Clubhouse Renewal", "developments-renovations", "A phased plan expands casual dining, refreshes locker rooms, and improves marina-facing member services.", "Harbor Point Club", "Annapolis", "MD", 95),
  story("Pine Valley Shores Breaks Ground on Four-Season Racquets Campus", "developments-renovations", "The new campus combines covered courts, social space, and flexible youth programming.", "Pine Valley Shores", "Charleston", "SC"),
  story("Northstar Club Unveils Mountain Wellness and Recovery Center", "developments-renovations", "The project adds movement studios, recovery suites, and an indoor-outdoor pool designed for year-round use.", "Northstar Club", "Park City", "UT"),
  story("Lakeview Country Club Begins Course Drainage Modernization", "developments-renovations", "A two-year infrastructure program targets playability, water management, and reduced weather disruption.", "Lakeview Country Club", "Madison", "WI"),
  story("The Crescent Club Plans New Family Commons", "developments-renovations", "Designs consolidate youth spaces, casual dining, and flexible event rooms around a central outdoor lawn.", "The Crescent Club", "Naples", "FL"),
  story("Summit Lake Club Advances Employee Housing Partnership", "developments-renovations", "The club is partnering locally on seasonal housing to improve recruiting stability and reduce commute strain.", "Summit Lake Club", "Denver", "CO"),
  story("Oak Ridge Reimagines Arrival, Valet, and Bag-Drop Experience", "developments-renovations", "The front-door project uses a single service plan to reduce congestion and create a warmer member welcome.", "Oak Ridge Country Club", "Charlotte", "NC"),
  story("Seabrook Yacht Club Adds Resilient Marina Infrastructure", "developments-renovations", "Upgraded utilities, docks, and storm protections are paired with an expanded waterfront gathering space.", "Seabrook Yacht Club", "Savannah", "GA"),

  story("Clubs Test AI Concierge Tools for Dining and Member Requests", "technology", "Early pilots answer routine questions and route requests while preserving human escalation and club-specific tone.", undefined, undefined, undefined, 90),
  story("Unified Member Profiles Move from Roadmap to Operating Priority", "technology", "Clubs are connecting reservations, preferences, communications, and service recovery into a more useful member view."),
  story("Mobile Credentials Expand Beyond Gate and Fitness Access", "technology", "New pilots use wallet-based credentials for events, amenities, guests, and frictionless member verification."),
  story("Finance Teams Automate Daily Revenue Reconciliation", "technology", "Integrations between point-of-sale, payments, and accounting systems are reducing manual work and exception risk."),
  story("Cybersecurity Tabletop Exercises Reach the Club Boardroom", "technology", "Clubs are rehearsing incident decisions with operators, technology partners, insurers, and board leadership."),
  story("Course Operations Dashboards Combine Labor, Weather, and Agronomy Data", "technology", "Superintendents are using integrated planning views to improve timing, communication, and resource allocation."),

  story("Heritage Leisure Acquires Three-Club Sunbelt Portfolio", "mergers-acquisitions", "The demo transaction expands Heritage Leisure into two new markets while retaining local club leadership.", undefined, undefined, undefined, 91),
  story("Member Group Completes Purchase of Lakeside Athletic Club", "mergers-acquisitions", "A member-led ownership transition pairs governance changes with a five-year facilities plan."),
  story("Fairway Hospitality Adds Coastal Club Management Agreement", "mergers-acquisitions", "The agreement covers operations, membership growth, food and beverage, and capital planning support."),
  story("Regional Racquet Operator Merges with Club Wellness Platform", "mergers-acquisitions", "The combination brings programming, staffing, and wellness services under one specialty platform."),
  story("Family Office Invests in Four-Season Destination Club", "mergers-acquisitions", "New capital is expected to fund lodging, outdoor recreation, and a broader year-round membership proposition."),

  story("Green Hills Members Approve $24M Campus Plan", "capital-investments", "The approved program spans irrigation, dining, aquatics, and long-cycle building systems.", "Green Hills Club", "Nashville", "TN", 94),
  story("Clubs Increase Annual Reserve Contributions for Course Infrastructure", "capital-investments", "Boards are treating irrigation, drainage, and bunker cycles as recurring portfolio obligations rather than one-off asks."),
  story("Metro City Club Funds $9M Vertical Transportation Upgrade", "capital-investments", "A multi-year elevator and building systems program reduces service risk in a historic urban clubhouse."),
  story("Desert Vista Commits to Water-Smart Landscape Conversion", "capital-investments", "The investment replaces high-input turf areas and expands smart irrigation controls across the property."),
  story("Bay Harbor Launches Member-Funded Marina Renewal", "capital-investments", "A targeted assessment will finance dock, utility, and resilience work while preserving operating reserves."),
  story("Westfield Club Builds Five-Year Technology Capital Plan", "capital-investments", "The roadmap coordinates network, security, member systems, and data investments instead of funding isolated tools.")
];

const jobs = [
  ["General Manager / COO", "Rivermark Club", "Richmond", "VA", "Lead strategy, culture, operations, and a multi-year campus plan."],
  ["Director of Member Experience", "Summit Lake Club", "Denver", "CO", "Own programming, communications, onboarding, and member journey improvement."],
  ["Executive Chef", "The Crescent Club", "Naples", "FL", "Modernize culinary operations across casual, banquet, and seasonal outlets."],
  ["Director of Finance", "Harbor Point Club", "Annapolis", "MD", "Lead planning, reporting, controls, and capital-project financial governance."],
  ["Golf Course Superintendent", "Lakeview Country Club", "Madison", "WI", "Guide agronomy and a multi-year drainage and infrastructure program."],
  ["Director of Racquets", "Pine Valley Shores", "Charleston", "SC", "Build programming and team systems for a new four-season campus."],
  ["Membership Director", "Northstar Club", "Park City", "UT", "Shape acquisition, onboarding, engagement, and retention strategy."],
  ["Director of Information Technology", "Westfield Club", "Westfield", "NJ", "Deliver security, infrastructure, integration, and member-facing systems."]
] as const;

const moves = [
  ["Dana Patel", "Chief Operating Officer", "Vice President, Member Experience", "Oak Ridge Country Club", "Charlotte", "NC"],
  ["Marcus Lee", "General Manager", "Assistant General Manager", "Seabrook Yacht Club", "Savannah", "GA"],
  ["Elena Ruiz", "Executive Chef", "Culinary Director", "Harbor Point Club", "Annapolis", "MD"],
  ["Thomas Bennett", "Director of Golf", "Head Golf Professional", "Green Hills Club", "Nashville", "TN"],
  ["Priya Nair", "Chief Financial Officer", "Controller", "Metro City Club", "Chicago", "IL"],
  ["Owen Wallace", "Golf Course Superintendent", "Senior Assistant Superintendent", "Lakeview Country Club", "Madison", "WI"],
  ["Camille Foster", "Director of Membership", "Membership & Communications Director", "Northstar Club", "Park City", "UT"],
  ["Jordan Kim", "Director of Technology", "IT Operations Manager", "Westfield Club", "Westfield", "NJ"]
] as const;

const developments = [
  ["Harbor Point Club", "Waterfront Clubhouse Renewal", "Annapolis", "MD", "$18M", "2026–2028", "Design", "Dining, locker rooms, and marina services."],
  ["Pine Valley Shores", "Four-Season Racquets Campus", "Charleston", "SC", "$12M", "2026–2027", "Construction", "Covered courts, social space, and youth programming."],
  ["Northstar Club", "Wellness and Recovery Center", "Park City", "UT", "$15M", "Opening 2027", "Construction", "Studios, recovery suites, and indoor-outdoor aquatics."],
  ["Lakeview Country Club", "Course Drainage Modernization", "Madison", "WI", "$6.5M", "2026–2028", "Active", "Drainage, water management, and playability work."],
  ["The Crescent Club", "Family Commons", "Naples", "FL", "$8M", "Planning", "Design", "Youth, casual dining, events, and outdoor gathering."],
  ["Oak Ridge Country Club", "Arrival Experience Redesign", "Charlotte", "NC", "$3.2M", "Opening 2027", "Planning", "Valet, bag drop, access, and member welcome."],
  ["Seabrook Yacht Club", "Resilient Marina Program", "Savannah", "GA", "$11M", "2026–2027", "Active", "Docks, utilities, resilience, and waterfront social space."],
  ["Desert Vista Club", "Water-Smart Landscape Conversion", "Scottsdale", "AZ", "$4.8M", "2026–2029", "Active", "Turf conversion and smart irrigation systems."]
] as const;

const rankings = [
  ["Top Private Clubs to Watch", 1, "Northstar Club", "Park City", "UT", 94, "A four-season strategy connecting wellness, outdoor recreation, and modern member journeys."],
  ["Top Private Clubs to Watch", 2, "Harbor Point Club", "Annapolis", "MD", 91, "A disciplined waterfront renewal paired with strong member-service planning."],
  ["Best New Developments", 1, "Pine Valley Shores", "Charleston", "SC", 93, "A racquets campus designed as a social and family destination, not a single-use facility."],
  ["Best New Developments", 2, "The Crescent Club", "Naples", "FL", 89, "A flexible family commons concept built around changing patterns of club use."],
  ["Most Innovative Clubs", 1, "Westfield Club", "Westfield", "NJ", 95, "A coordinated approach to data, cyber risk, and member-facing technology investment."],
  ["Most Innovative Clubs", 2, "Desert Vista Club", "Scottsdale", "AZ", 92, "Water stewardship and landscape strategy embedded in the club's operating model."],
  ["Best Clubhouse Renovations", 1, "Harbor Point Club", "Annapolis", "MD", 94, "A phased plan that prioritizes member flow and high-use social spaces."],
  ["Best Clubhouse Renovations", 2, "Oak Ridge Country Club", "Charlotte", "NC", 90, "A tightly scoped arrival redesign with an outsized effect on service experience."],
  ["Top Technology Adopters", 1, "Westfield Club", "Westfield", "NJ", 96, "A five-year capital plan ties infrastructure, integration, security, and service together."],
  ["Top Technology Adopters", 2, "Metro City Club", "Chicago", "IL", 91, "Modern building systems and member platforms are being managed as one asset portfolio."]
] as const;

const podcasts = [
  ["Club Industry Brief", "The Five Signals Club Leaders Should Watch This Week", "A concise scan of member demand, capital activity, leadership moves, technology, and deals.", "12 min"],
  ["GM Conversations", "Building an Executive Team That Can Carry the Strategy", "A candid conversation with club leaders about delegation, accountability, and cross-functional execution.", "32 min"],
  ["Development Desk", "Why the Best Capital Plans Begin with Member Behavior", "Design and operations voices unpack how utilization data should shape scope before drawings begin.", "24 min"],
  ["ClubOpsPro Sessions", "The Weekly Operating Rhythm That Actually Works", "A practical session on meetings, dashboards, ownership, and follow-through across department heads.", "18 min"]
] as const;

async function main() {
  const categoryRecords = await Promise.all(categories.map(([name, slug, description]) => prisma.category.upsert({ where: { slug }, update: { name, description }, create: { name, slug, description } })));
  const sourceRecords = await Promise.all(sources.map(([name, homepageUrl, rssUrl]) => prisma.source.upsert({ where: { name }, update: { homepageUrl, rssUrl }, create: { name, homepageUrl, rssUrl } })));
  const categoryBySlug = Object.fromEntries(categoryRecords.map((record) => [record.slug, record]));
  const sourceByName = Object.fromEntries(sourceRecords.map((record) => [record.name, record]));
  const media = await Promise.all([
    ["Clubhouse Terrace", "/images/clubhouse-hero.png", "Private club clubhouse terrace at golden hour", "hero"],
    ["Renovation Planning", "/images/renovation-planning.png", "Private club renovation materials on a conference table", "renovation"],
    ["Club Technology Dashboard", "/images/club-tech-dashboard.png", "Private club operations technology dashboard", "technology"]
  ].map(([title, url, altText, category]) => prisma.mediaAsset.upsert({ where: { url }, update: { title, altText, category }, create: { title, url, altText, category } })));
  const imageByCategory = { hero: media[0].id, "industry-news": media[0].id, "developments-renovations": media[1].id, "capital-investments": media[1].id, technology: media[2].id, "mergers-acquisitions": media[0].id } as Record<string, string>;

  for (const [index, item] of stories.entries()) {
    const slug = slugify(item.title);
    const sourceName = item.source ?? (item.category === "technology" ? "Hospitality Tech Ledger" : item.category === "developments-renovations" ? "Resort & Club Design" : "ClubFlow Intelligence Desk");
    const data = { title: item.title, slug, author: "ClubFlow Research", publishedAt: new Date(Date.UTC(2026, 5, 20 - (index % 17), 13)), tags: [item.category, "demo intelligence"], clubName: item.club ?? null, city: item.city ?? null, state: item.state ?? null, originalExcerpt: item.summary, aiSummary: item.summary, importanceScore: item.score ?? 72 + (index % 17), status: ArticleStatus.published, sourceId: sourceByName[sourceName].id, categoryId: categoryBySlug[item.category].id, heroImageId: imageByCategory[item.category] ?? media[0].id };
    await prisma.article.upsert({ where: { originalUrl: `https://example.com/demo/${slug}` }, update: data, create: { ...data, originalUrl: `https://example.com/demo/${slug}` } });
  }

  for (const [title, clubName, city, state, description] of jobs) await prisma.jobPosting.upsert({ where: { title_clubName: { title, clubName } }, update: { city, state, description, status: ArticleStatus.published, url: `https://example.com/jobs/${slugify(`${clubName}-${title}`)}` }, create: { title, clubName, city, state, description, status: ArticleStatus.published, url: `https://example.com/jobs/${slugify(`${clubName}-${title}`)}` } });
  for (const [executive, newRole, previousRole, clubName, city, state] of moves) { const existing = await prisma.executiveMove.findFirst({ where: { executive, clubName } }); if (existing) await prisma.executiveMove.update({ where: { id: existing.id }, data: { newRole, previousRole, city, state, effectiveAt: new Date("2026-06-16"), publishedAt: new Date("2026-06-16"), status: ArticleStatus.published, notes: "Demo-safe leadership update prepared for the ClubFlow preview." } }); else await prisma.executiveMove.create({ data: { executive, newRole, previousRole, clubName, city, state, effectiveAt: new Date("2026-06-16"), publishedAt: new Date("2026-06-16"), status: ArticleStatus.published, notes: "Demo-safe leadership update prepared for the ClubFlow preview." } }); }
  for (const [clubName, projectName, city, state, budget, timeline, status, description] of developments) { const existing = await prisma.developmentProject.findFirst({ where: { clubName, projectName } }); const data = { city, state, budget, timeline, status, description, architect: "Project team to be announced" }; if (existing) await prisma.developmentProject.update({ where: { id: existing.id }, data }); else await prisma.developmentProject.create({ data: { clubName, projectName, ...data } }); }
  for (const [category, rank, clubName, city, state, score, rationale] of rankings) await prisma.rankingEntry.upsert({ where: { category_clubName: { category, clubName } }, update: { rank, city, state, score, rationale, publishedAt: new Date("2026-06-15"), status: ArticleStatus.published }, create: { category, rank, clubName, city, state, score, rationale, publishedAt: new Date("2026-06-15"), status: ArticleStatus.published } });
  for (const [showName, title, description, duration] of podcasts) await prisma.podcastEpisode.upsert({ where: { title }, update: { showName, description, duration, comingSoon: true, status: ArticleStatus.published }, create: { showName, title, description, duration, comingSoon: true, status: ArticleStatus.published } });
  await prisma.newsletterSubscriber.upsert({ where: { email: "gm@harborpoint.example" }, update: { frequency: NewsletterFrequency.weekly }, create: { email: "gm@harborpoint.example", frequency: NewsletterFrequency.weekly } });
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
