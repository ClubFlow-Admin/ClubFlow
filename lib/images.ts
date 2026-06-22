import type { ArticleWithRelations } from "@/lib/articles";
import { IMAGE_LIBRARY, imageUrlForSeed, type LibraryCategoryKey, type LibraryImage } from "@/lib/image-library";

const CATEGORY_SLUG_TO_LIBRARY_KEY: Record<string, LibraryCategoryKey> = {
  "industry-news": "industry",
  "developments-renovations": "club-developments",
  "executive-moves": "executive-moves",
  jobs: "jobs",
  technology: "technology",
  "mergers-acquisitions": "mergers-acquisitions",
  "capital-investments": "capital-investments",
  "rankings-data": "club-rankings",
  "best-practices": "clubopspro",
  clubopspro: "clubopspro"
};

export type ResolvedImage = { src: string; alt: string; credit: string | null };

type Pick<T extends ArticleWithRelations> = ResolvedImage & { article: T; libraryImage: LibraryImage | null; libraryKey: LibraryCategoryKey | null };

function hashToInt(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function libraryKeyForCategorySlug(categorySlug: string): LibraryCategoryKey {
  return CATEGORY_SLUG_TO_LIBRARY_KEY[categorySlug] ?? "industry";
}

/** Picks a deterministic-but-well-distributed placeholder for an article without its own photo. */
function pickPlaceholder(article: ArticleWithRelations, width: number, height: number): { libraryImage: LibraryImage; libraryKey: LibraryCategoryKey; src: string; alt: string; credit: string | null } {
  const libraryKey = libraryKeyForCategorySlug(article.category.slug);
  const bucket = IMAGE_LIBRARY[libraryKey];
  const index = hashToInt(article.id) % bucket.length;
  const libraryImage = bucket[index];
  return { libraryImage, libraryKey, src: imageUrlForSeed(libraryImage.seed, width, height), alt: libraryImage.alt, credit: libraryImage.credit };
}

/**
 * Resolves display images for a list of articles rendered in sequence (homepage rails, section
 * grids, search results). Real hero images always win; articles without one get a category
 * placeholder chosen deterministically by article id (stable across renders), then nudged forward
 * within the same category bucket whenever that would otherwise repeat the previous card's image.
 */
export function resolveArticleImages<T extends ArticleWithRelations>(articles: T[], width = 1200, height = 800): Array<ResolvedImage & { article: T }> {
  const picks: Array<Pick<T>> = articles.map((article) => {
    if (article.heroImage?.url) {
      return { article, src: article.heroImage.url, alt: article.heroImage.altText ?? article.title, credit: article.heroImage.credit ?? null, libraryImage: null, libraryKey: null };
    }
    const placeholder = pickPlaceholder(article, width, height);
    return { article, ...placeholder };
  });

  for (let index = 1; index < picks.length; index += 1) {
    const previous = picks[index - 1];
    const current = picks[index];
    if (!current.libraryImage || !previous.libraryImage || !current.libraryKey) continue;
    if (current.libraryImage.seed !== previous.libraryImage.seed) continue;
    const bucket = IMAGE_LIBRARY[current.libraryKey];
    if (bucket.length < 2) continue;
    const currentIndex = bucket.indexOf(current.libraryImage);
    const nextImage = bucket[(currentIndex + 1) % bucket.length];
    current.libraryImage = nextImage;
    current.src = imageUrlForSeed(nextImage.seed, width, height);
    current.alt = nextImage.alt;
    current.credit = nextImage.credit;
  }

  return picks;
}

/** Single-article convenience wrapper (article page hero, admin preview) — no adjacency to consider. */
export function imageForArticle(article: ArticleWithRelations, width = 1200, height = 800): ResolvedImage {
  return resolveArticleImages([article], width, height)[0];
}
