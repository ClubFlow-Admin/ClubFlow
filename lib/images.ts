import type { ArticleWithRelations } from "@/lib/articles";

export const photoAssets = {
  hero: "/images/clubhouse-hero.png",
  renovation: "/images/renovation-planning.png",
  technology: "/images/club-tech-dashboard.png"
};

export function imageForCategory(slug: string) {
  if (slug === "developments-renovations") return photoAssets.renovation;
  if (slug === "technology" || slug === "rankings-data" || slug === "executive-moves") return photoAssets.technology;
  return photoAssets.hero;
}

export function imageForArticle(article: ArticleWithRelations) {
  if (article.heroImage?.url) return article.heroImage.url;
  return imageForCategory(article.category.slug);
}
