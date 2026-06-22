import Link from "next/link";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import type { ArticleWithRelations } from "@/lib/articles";
import { importanceTier, type ImportanceTier } from "@/lib/importance";
import { estimateReadingMinutes } from "@/lib/utils";
import { whyItMattersFor } from "@/lib/why-it-matters";

const TIER_STYLE: Record<ImportanceTier, string> = {
  Breaking: "bg-rose-600/10 text-rose-700",
  Major: "bg-amber-500/15 text-amber-700",
  Important: "bg-primary/10 text-primary",
  Standard: "bg-muted text-muted-foreground",
  Brief: "bg-muted text-muted-foreground"
};

function oneSentenceSummary(article: ArticleWithRelations) {
  const source = article.dek || article.aiSummary;
  return source.split(/(?<=[.!?])\s+/)[0];
}

export function DailyBrief({ articles }: { articles: ArticleWithRelations[] }) {
  const stories = articles.slice(0, 5);
  if (!stories.length) return null;

  return (
    <section id="clubflow-daily" className="border-b bg-white">
      <div className="container-shell py-8 sm:py-10">
        <div className="flex items-baseline justify-between gap-4 border-b pb-4">
          <div>
            <div className="kicker">ClubFlow Daily</div>
            <h2 className="font-serif mt-1 text-2xl font-black sm:text-3xl">The five stories every club leader should know today.</h2>
          </div>
        </div>
        <ol className="divide-y">
          {stories.map((article, index) => {
            const tier = importanceTier(article.importanceScore);
            const readingMinutes = estimateReadingMinutes(article.aiSummary, article.aiWhatHappened, article.aiWhyItMatters, article.aiIndustryContext);
            return (
              <li key={article.id} className="grid grid-cols-[1.75rem_1fr] gap-4 py-4 sm:grid-cols-[2.25rem_1fr]">
                <span className="number-tabular pt-0.5 text-lg font-black text-muted-foreground/60">{index + 1}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[.08em]">
                    <span className={`px-2 py-0.5 ${TIER_STYLE[tier]}`}>{tier}</span>
                    <span className="text-muted-foreground">{article.category.name}</span>
                  </div>
                  <Link href={`/articles/${article.slug}?from=home`} className="no-underline">
                    <h3 className="font-serif mt-1.5 text-lg font-black leading-snug transition hover:text-primary sm:text-xl">{article.title}</h3>
                  </Link>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{oneSentenceSummary(article)}</p>
                  <div className="mt-2 border-l-2 border-primary/20 pl-3">
                    <div className="text-[10px] font-black uppercase tracking-[.08em] text-primary/70">Why it matters</div>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground/90">{whyItMattersFor(article)}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[.06em] text-muted-foreground">
                    <time dateTime={article.publishedAt.toISOString()}>{format(article.publishedAt, "MMM d, yyyy")}</time>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{readingMinutes} min</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
