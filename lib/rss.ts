export type IngestedFeedItem = {
  title: string;
  originalUrl: string;
  sourceName: string;
  publishedAt?: Date;
  excerpt?: string;
};

export async function ingestRssFeed(rssUrl: string): Promise<IngestedFeedItem[]> {
  void rssUrl;
  // Foundation hook for RSS ingestion. In production, add a parser such as rss-parser,
  // normalize source metadata here, and persist candidate articles as draft records.
  return [];
}
