import Parser from "rss-parser";

export type IngestedFeedItem = {
  title: string;
  originalUrl: string;
  sourceName: string;
  publishedAt?: Date;
  excerpt?: string;
};

const parser = new Parser({ timeout: 15_000 });

export async function ingestRssFeed(rssUrl: string, sourceName: string): Promise<IngestedFeedItem[]> {
  const feed = await parser.parseURL(rssUrl);
  const items: IngestedFeedItem[] = [];

  for (const entry of feed.items ?? []) {
    const title = entry.title?.trim();
    const originalUrl = entry.link?.trim();
    if (!title || !originalUrl) continue;

    const rawExcerpt = entry.contentSnippet ?? entry.summary ?? entry.content ?? "";
    const excerpt = rawExcerpt.toString().trim().slice(0, 600) || undefined;
    const dateSource = entry.isoDate ?? entry.pubDate;
    const publishedAt = dateSource ? new Date(dateSource) : undefined;

    items.push({
      title,
      originalUrl,
      sourceName,
      publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : undefined,
      excerpt
    });
  }

  return items;
}
