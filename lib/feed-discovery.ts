import Parser from "rss-parser";

const CANDIDATE_PATHS = ["/feed/", "/feed", "/news/feed/", "/press/feed/", "/media/feed/", "/rss", "/rss.xml", "/feed.xml"];

const probeParser = new Parser({ timeout: 8_000 });

/**
 * Real, bounded verification (not a guess presented as fact) for whether a first-party
 * feed now exists at one of the common paths we already checked by hand for these sources
 * across the last two sprints. Tries each candidate path against the source's own
 * homepage and returns the first URL that parses as RSS/Atom with at least one item — or
 * null if none do. Never invents a URL outside this well-known, previously-used path set.
 * This only ever produces a *recommendation* (Source.firstPartyFeedCandidateUrl) — nothing
 * calls this and auto-switches a source's live feed.
 */
export async function discoverFirstPartyFeed(homepageUrl: string | null): Promise<string | null> {
  if (!homepageUrl) return null;

  let base: URL;
  try {
    base = new URL(homepageUrl);
  } catch {
    return null;
  }

  for (const path of CANDIDATE_PATHS) {
    const candidateUrl = new URL(path, base).toString();
    try {
      const feed = await probeParser.parseURL(candidateUrl);
      if (feed.items && feed.items.length > 0) {
        return candidateUrl;
      }
    } catch {
      // Expected for most paths (404, not XML, etc.) — keep trying the rest.
    }
  }

  return null;
}
