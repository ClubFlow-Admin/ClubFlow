import { ingestRssFeed, type IngestedFeedItem } from "@/lib/rss";
import type { Source } from "@prisma/client";

export type GoogleNewsFeedItem = IngestedFeedItem & { originalPublisherName?: string };

/**
 * Tier-3 fallback fetcher (per the approved tiered sourcing strategy): used only when a
 * source has no first-party feed. `source.rssUrl` holds the literal Google News query URL
 * (e.g. news.google.com/rss/search?q=%22Troon%22+golf) — confirmed real, working RSS
 * infrastructure, not a guessed/fabricated endpoint. Google News titles always end in
 * " - Publisher Name" (verified live); we split that off so the queue can show the true
 * original publisher and never misattribute the story to "Google News" or to the org being
 * monitored. The <link> itself is a Google redirect that still resolves correctly when a
 * human clicks it, so we store it as-is rather than risk an unreliable server-side
 * redirect resolution — originalPublisherName carries the true source-of-record instead.
 *
 * If a first-party feed becomes available later, just change the Source row's sourceType
 * to "rss"/etc and point rssUrl at the real feed — no code change needed, this fetcher
 * simply stops being selected by the registry in lib/intake.ts.
 */
export async function fetchViaGoogleNews(source: Source): Promise<GoogleNewsFeedItem[]> {
  if (!source.rssUrl) return [];
  const items = await ingestRssFeed(source.rssUrl, source.name);

  return items.map((item) => {
    const separatorIndex = item.title.lastIndexOf(" - ");
    if (separatorIndex === -1) return item;

    const title = item.title.slice(0, separatorIndex).trim();
    const originalPublisherName = item.title.slice(separatorIndex + 3).trim();
    if (!title || !originalPublisherName) return item;

    return { ...item, title, originalPublisherName };
  });
}

/** Builds a Google News query-feed URL for a given search phrase — used by seeding/admin tooling, not the fetcher itself. */
export function googleNewsQueryUrl(query: string) {
  const params = new URLSearchParams({ q: query, hl: "en-US", gl: "US", ceid: "US:en" });
  return `https://news.google.com/rss/search?${params.toString()}`;
}
