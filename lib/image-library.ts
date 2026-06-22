/**
 * Placeholder photography library.
 *
 * Every entry renders via Lorem Picsum (https://picsum.photos), a free placeholder-image
 * service built on Unsplash-licensed photography — no scraped or copyrighted images. Each
 * `seed` deterministically maps to one underlying photo, so the same seed always renders the
 * same image (good for caching) while still giving us a large, varied pool per category.
 *
 * This is intentionally a placeholder structure: when real, licensed/credited article photography
 * is available, set `Article.heroImageId` (via the admin editor) to a `MediaAsset` row — the
 * rendering logic in lib/images.ts already prefers a real heroImage over anything in this file,
 * so no rendering code needs to change later.
 */

export type LibraryImage = {
  seed: string;
  alt: string;
  credit: string | null;
};

export type LibraryCategoryKey =
  | "industry"
  | "club-developments"
  | "executive-moves"
  | "jobs"
  | "technology"
  | "mergers-acquisitions"
  | "capital-investments"
  | "club-rankings"
  | "podcasts"
  | "clubopspro";

const PLACEHOLDER_CREDIT = "Placeholder photography via Lorem Picsum (Unsplash-licensed) — pending licensed replacement";

function bucket(prefix: string, entries: Array<{ seed: string; alt: string }>): readonly LibraryImage[] {
  return entries.map(({ seed, alt }) => ({ seed: `clubflow-${prefix}-${seed}`, alt, credit: PLACEHOLDER_CREDIT }));
}

export const IMAGE_LIBRARY: Record<LibraryCategoryKey, readonly LibraryImage[]> = {
  industry: bucket("industry", [
    { seed: "01", alt: "Private golf clubhouse exterior at golden hour" },
    { seed: "02", alt: "Manicured fairway and green under morning light" },
    { seed: "03", alt: "Club dining room set for a member event" },
    { seed: "04", alt: "Aerial view of a private golf course and clubhouse" },
    { seed: "05", alt: "Board members in discussion at a private club" },
    { seed: "06", alt: "Clubhouse veranda overlooking the 18th green" },
    { seed: "07", alt: "Golf cart path winding through mature trees" },
    { seed: "08", alt: "Private club entrance gates and signage" },
    { seed: "09", alt: "Members walking the course at sunrise" }
  ]),
  "club-developments": bucket("developments", [
    { seed: "01", alt: "Architectural rendering of a new clubhouse" },
    { seed: "02", alt: "Construction site for a clubhouse renovation" },
    { seed: "03", alt: "Blueprints and materials on a planning table" },
    { seed: "04", alt: "New wellness center under construction at a resort club" },
    { seed: "05", alt: "Golf course irrigation and earthmoving work" },
    { seed: "06", alt: "Modern clubhouse architecture with glass facade" },
    { seed: "07", alt: "Marina and waterfront club amenity construction" },
    { seed: "08", alt: "Architect reviewing renovation plans on site" },
    { seed: "09", alt: "Newly completed resort clubhouse at dusk" }
  ]),
  "executive-moves": bucket("executives", [
    { seed: "01", alt: "Club general manager in a boardroom meeting" },
    { seed: "02", alt: "Executive portrait in business attire" },
    { seed: "03", alt: "Leadership team shaking hands after an appointment" },
    { seed: "04", alt: "Club superintendent reviewing course plans" },
    { seed: "05", alt: "Executive chef in a private club kitchen" },
    { seed: "06", alt: "New department head presenting to the board" },
    { seed: "07", alt: "Professional headshot setting for a leadership announcement" },
    { seed: "08", alt: "Club COO walking the grounds with staff" },
    { seed: "09", alt: "Executive team meeting around a conference table" }
  ]),
  jobs: bucket("jobs", [
    { seed: "01", alt: "Club staff onboarding and training session" },
    { seed: "02", alt: "Golf operations team preparing the course" },
    { seed: "03", alt: "Hospitality staff setting a formal dining room" },
    { seed: "04", alt: "Job candidate interview at a private club office" },
    { seed: "05", alt: "Club operations team reviewing a staffing schedule" },
    { seed: "06", alt: "Groundskeeping crew working on the course at dawn" },
    { seed: "07", alt: "Front-of-house staff greeting members" },
    { seed: "08", alt: "Career fair booth for hospitality and club roles" },
    { seed: "09", alt: "New hire shadowing a department head" }
  ]),
  technology: bucket("technology", [
    { seed: "01", alt: "Club operations dashboard on a laptop screen" },
    { seed: "02", alt: "Server room powering club management software" },
    { seed: "03", alt: "Tablet showing member experience app at a clubhouse" },
    { seed: "04", alt: "Point-of-sale technology at a club restaurant" },
    { seed: "05", alt: "Data analytics charts on a monitor" },
    { seed: "06", alt: "Smart irrigation control panel on a golf course" },
    { seed: "07", alt: "IT staff installing networking equipment at a club" },
    { seed: "08", alt: "Mobile app for club bookings displayed on a phone" },
    { seed: "09", alt: "Technology vendor presenting a product demo" }
  ]),
  "mergers-acquisitions": bucket("ma", [
    { seed: "01", alt: "Business handshake closing a club acquisition deal" },
    { seed: "02", alt: "Skyline view representing a club management company HQ" },
    { seed: "03", alt: "Contracts and pen on a deal-signing table" },
    { seed: "04", alt: "Investors reviewing a portfolio of golf properties" },
    { seed: "05", alt: "Corporate boardroom during a deal negotiation" },
    { seed: "06", alt: "Aerial view of multiple golf course properties" },
    { seed: "07", alt: "Two executives reviewing a term sheet" },
    { seed: "08", alt: "Press announcement of a club ownership transaction" },
    { seed: "09", alt: "Financial charts representing deal valuation" }
  ]),
  "capital-investments": bucket("capital", [
    { seed: "01", alt: "Capital reserve planning documents and laptop" },
    { seed: "02", alt: "New amenity construction funded by member capital" },
    { seed: "03", alt: "Financial planning meeting for a club capital project" },
    { seed: "04", alt: "Renovated clubhouse interior after capital investment" },
    { seed: "05", alt: "Investment committee reviewing budget charts" },
    { seed: "06", alt: "New pool and wellness amenity under construction" },
    { seed: "07", alt: "Capital project signage at a club construction site" },
    { seed: "08", alt: "Architect and board member reviewing a capital plan" },
    { seed: "09", alt: "Golf course capital improvement work in progress" }
  ]),
  "club-rankings": bucket("rankings", [
    { seed: "01", alt: "Trophy on display at a private golf club" },
    { seed: "02", alt: "Scenic signature hole at a top-ranked club" },
    { seed: "03", alt: "Awards wall inside a private clubhouse" },
    { seed: "04", alt: "Aerial view of an award-winning golf course layout" },
    { seed: "05", alt: "Leaderboard and scorecards at a club event" },
    { seed: "06", alt: "Pristine green and bunker at a ranked course" },
    { seed: "07", alt: "Clubhouse facade of a nationally ranked private club" },
    { seed: "08", alt: "Golfer walking a top-rated fairway at sunset" },
    { seed: "09", alt: "Ranking ceremony at an industry gathering" }
  ]),
  podcasts: bucket("podcasts", [
    { seed: "01", alt: "Podcast microphone and headphones in a studio" },
    { seed: "02", alt: "Two hosts recording an industry interview" },
    { seed: "03", alt: "Audio mixing board in a recording studio" },
    { seed: "04", alt: "Microphone setup for a club industry briefing" },
    { seed: "05", alt: "Host reviewing notes before a recording session" },
    { seed: "06", alt: "Studio headphones resting on a soundboard" },
    { seed: "07", alt: "Recording booth with acoustic paneling" },
    { seed: "08", alt: "Guest and host in conversation on-air" },
    { seed: "09", alt: "Podcast cover-art style studio lighting setup" }
  ]),
  clubopspro: bucket("clubopspro", [
    { seed: "01", alt: "Consultant presenting an operating playbook to a club team" },
    { seed: "02", alt: "Whiteboard session mapping a club operating system" },
    { seed: "03", alt: "Department heads in a strategy planning meeting" },
    { seed: "04", alt: "Binder of standard operating procedures on a desk" },
    { seed: "05", alt: "Coach reviewing performance dashboards with a GM" },
    { seed: "06", alt: "Team huddle before a club service shift" },
    { seed: "07", alt: "Implementation workshop with sticky notes on a wall" },
    { seed: "08", alt: "Leadership training session in a clubhouse meeting room" },
    { seed: "09", alt: "Consultant and GM walking the property together" }
  ])
};

export function imageUrlForSeed(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
