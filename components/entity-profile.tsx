import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Building2, MapPin, UserRoundPlus } from "lucide-react";
import type { EntityArticle, EntityDevelopmentProject, EntityExecutiveMove, TimelineEntry } from "@/lib/entities";

export type KeyFact = { label: string; value: string };

export type EntityProfileProps = {
  eyebrow: string;
  name: string;
  type: string;
  logoUrl?: string | null;
  location?: string | null;
  description?: string | null;
  tags: string[];
  keyFacts: KeyFact[];
  articles: EntityArticle[];
  moves: EntityExecutiveMove[];
  projects: EntityDevelopmentProject[];
  technology: EntityArticle[];
  deals: EntityArticle[];
  timeline: TimelineEntry[];
};

function EntityLogo({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  if (logoUrl) {
    return <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden border bg-white"><Image src={logoUrl} alt={name} fill unoptimized className="object-contain p-2" /></div>;
  }
  return <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center border bg-primary/5 text-2xl font-black text-primary">{name.charAt(0)}</div>;
}

function ArticleList({ items }: { items: EntityArticle[] }) {
  return (
    <div className="divide-y">
      {items.map((article) => (
        <Link key={article.id} href={`/articles/${article.slug}`} className="block py-3 no-underline first:pt-0 last:pb-0">
          <div className="text-[10px] font-black uppercase tracking-[.08em] text-primary">{article.category.name}</div>
          <h3 className="font-serif mt-1 text-base font-black leading-snug text-foreground transition hover:text-primary">{article.title}</h3>
          <time className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground" dateTime={article.publishedAt.toISOString()}>{format(article.publishedAt, "MMM d, yyyy")}</time>
        </Link>
      ))}
    </div>
  );
}

export function EntityProfile({ eyebrow, name, type, logoUrl, location, description, tags, keyFacts, articles, moves, projects, technology, deals, timeline }: EntityProfileProps) {
  const hasArticles = articles.length > 0;
  const hasMoves = moves.length > 0;
  const hasProjects = projects.length > 0;
  const hasTechnology = technology.length > 0;
  const hasDeals = deals.length > 0;
  const hasTimeline = timeline.length > 0;
  const hasIntelligence = hasArticles || hasMoves || hasProjects || hasTechnology || hasDeals;

  return (
    <main className="bg-background">
      <header className="border-b bg-white">
        <div className="container-shell py-10 sm:py-14">
          <div className="text-xs font-black uppercase tracking-[.18em] text-primary">{eyebrow}</div>
          <div className="mt-5 flex flex-wrap items-start gap-5">
            <EntityLogo name={name} logoUrl={logoUrl} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-3xl font-black leading-tight sm:text-4xl">{name}</h1>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-[.1em] bg-primary/10 text-primary">{type}</span>
              </div>
              {location ? <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{location}</div> : null}
              {description ? <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{description}</p> : null}
              {tags.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => <span key={tag} className="border bg-white px-2.5 py-1 text-xs font-bold text-muted-foreground">{tag}</span>)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="container-shell grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,720px)_280px] lg:justify-center lg:gap-14">
        <div className="mx-auto w-full max-w-[720px]">
          {!hasIntelligence ? (
            <div className="border bg-white p-8 text-center"><p className="text-sm leading-6 text-muted-foreground">ClubFlow hasn&apos;t linked any coverage to this profile yet. Related articles, executive moves, and capital projects will appear here as they&apos;re published.</p></div>
          ) : null}

          {hasMoves ? (
            <section className="mb-12">
              <div className="kicker">Related executive moves</div>
              <div className="mt-4 divide-y border bg-white px-5">
                {moves.map((move) => {
                  const content = (
                    <div className="py-3.5">
                      <div className="font-serif text-base font-black leading-snug">{move.executive}</div>
                      <div className="mt-1 text-xs font-bold text-primary">{move.newRole}{move.previousRole ? ` · formerly ${move.previousRole}` : ""}{move.clubName ? ` · ${move.clubName}` : ""}</div>
                      {move.effectiveAt ? <time className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground" dateTime={move.effectiveAt.toISOString()}>{format(move.effectiveAt, "MMM d, yyyy")}</time> : null}
                    </div>
                  );
                  return move.article ? <Link key={move.id} href={`/articles/${move.article.slug}`} className="block no-underline">{content}</Link> : <div key={move.id}>{content}</div>;
                })}
              </div>
            </section>
          ) : null}

          {hasProjects ? (
            <section className="mb-12">
              <div className="kicker">Related capital projects</div>
              <div className="mt-4 divide-y border bg-white px-5">
                {projects.map((project) => {
                  const content = (
                    <div className="py-3.5">
                      <div className="font-serif text-base font-black leading-snug">{project.projectName}</div>
                      <div className="mt-1 text-xs font-bold text-primary">{project.clubName}{project.budget ? ` · ${project.budget}` : ""}{project.timeline ? ` · ${project.timeline}` : ""}</div>
                    </div>
                  );
                  return project.article ? <Link key={project.id} href={`/articles/${project.article.slug}`} className="block no-underline">{content}</Link> : <div key={project.id}>{content}</div>;
                })}
              </div>
            </section>
          ) : null}

          {hasTechnology ? (
            <section className="mb-12">
              <div className="kicker">Related technology</div>
              <div className="mt-4 border bg-white px-5"><ArticleList items={technology} /></div>
            </section>
          ) : null}

          {hasDeals ? (
            <section className="mb-12">
              <div className="kicker">Related M&amp;A</div>
              <div className="mt-4 border bg-white px-5"><ArticleList items={deals} /></div>
            </section>
          ) : null}

          {hasArticles ? (
            <section className="mb-12">
              <div className="kicker">Related articles</div>
              <div className="mt-4 border bg-white px-5"><ArticleList items={articles} /></div>
            </section>
          ) : null}

          {hasTimeline ? (
            <section>
              <div className="kicker">Timeline</div>
              <ol className="mt-4 border-l-2 border-primary/20 pl-5">
                {timeline.map((entry, index) => (
                  <li key={index} className="relative pb-6 last:pb-0">
                    <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <time className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{format(entry.date, "MMM d, yyyy")} · {entry.label}</time>
                    {entry.href ? (
                      <Link href={entry.href} className="mt-1 block text-sm font-bold text-foreground no-underline hover:text-primary">{entry.detail}</Link>
                    ) : (
                      <p className="mt-1 text-sm font-bold text-foreground">{entry.detail}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        <aside className="flex h-fit flex-col gap-5 lg:sticky lg:top-5">
          <div className="border-t-4 border-primary bg-white p-5">
            <div className="kicker">Key facts</div>
            <dl className="mt-4 divide-y text-sm">
              {keyFacts.map((fact) => (
                <div key={fact.label} className="grid grid-cols-[110px_1fr] gap-3 py-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{fact.label}</dt>
                  <dd className="font-bold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-muted-foreground"><Building2 className="h-3.5 w-3.5" /> ClubFlow Entity Intelligence</div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Profiles are built entirely from ClubFlow&apos;s own coverage and tagging — every relationship shown here traces back to a published brief.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export function RelatedEntityChip({ href, icon: Icon = UserRoundPlus, label }: { href: string; icon?: typeof Building2; label: string }) {
  return <Link href={href} className="card-lift group flex items-center gap-2.5 border bg-white px-3.5 py-2.5 text-sm font-black no-underline"><Icon className="h-4 w-4 text-primary" />{label}<ArrowRight className="ml-auto h-3.5 w-3.5 text-primary opacity-0 transition group-hover:opacity-100" /></Link>;
}
