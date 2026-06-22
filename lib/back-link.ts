import { categoryNav } from "@/lib/categories";

export type BackLink = { label: string; href: string };

const BACK_LINKS: Record<string, BackLink> = {
  home: { label: "Homepage", href: "/" },
  ...Object.fromEntries(categoryNav.map((item) => [item.href.slice(1), { label: item.label, href: item.href }]))
};

/** The `from` key for a route href, e.g. "/industry" -> "industry". Matches the keys in BACK_LINKS. */
export function fromKeyForHref(href: string) {
  return href.startsWith("/") ? href.slice(1) : href;
}

/**
 * Resolves the article page's "Back to X" link from a `from` query param (set when the user
 * navigated in from the homepage or a specific desk). Falls back to the article's own category
 * when there's no `from`, or it doesn't match a known section — e.g. on a direct visit.
 */
export function resolveBackLink(from: string | string[] | undefined, fallback: BackLink): BackLink {
  const key = Array.isArray(from) ? from[0] : from;
  if (key && BACK_LINKS[key]) return BACK_LINKS[key];
  return fallback;
}
