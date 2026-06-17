# ClubFlow

ClubFlow is an MVP private club industry news and intelligence platform. It aggregates and organizes stories for private clubs, country clubs, golf clubs, yacht clubs, city clubs, and resort clubs.

The MVP is intentionally manual-first: admins can add, review, edit, delete, and publish articles now, while the RSS ingestion and OpenAI summary hooks are ready for future automation.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- PostgreSQL
- Prisma
- OpenAI API summary endpoint

## Core Features

- Landing page and category-based news feed
- Article cards with source, date, category, AI summary, importance score, and read-more links
- Full article detail pages
- Newsletter signup storage
- Password-gated admin dashboard for manual story review and publishing
- Private backend workspace for sources, categories, media/photo records, and subscribers
- Draft, reviewed, and published workflow statuses
- Search and filters for category, source, club name, location, and date
- Database models for articles, media assets, sources, categories, subscribers, jobs, executive moves, development projects, and future newsletters
- RSS ingestion foundation at `/api/ingest/rss`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` in `.env` for your local PostgreSQL database.

   If you want a Docker-backed local database:

```bash
docker compose up -d
```

4. Run Prisma migration and generate the client:

```bash
npm run prisma:migrate
```

If Prisma's local schema engine fails in your environment, apply the equivalent bootstrap SQL directly:

```bash
npm run db:init:manual
```

5. Seed sample data:

```bash
npm run seed
```

6. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
DATABASE_URL="postgresql://clubflow:clubflow@localhost:5432/clubflow?schema=public"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_PASSWORD="clubflow-admin"
```

`OPENAI_API_KEY` is optional for local UI work. Without it, `/api/summaries` returns a configuration message instead of calling OpenAI.

`ADMIN_PASSWORD` protects every `/admin` route. In local development, the app falls back to `clubflow-admin` if the variable is not set. Set a real password before deploying.

## Useful Routes

- `/` - landing page and home feed
- `/articles/[slug]` - article detail page
- `/newsletter` - newsletter signup
- `/jobs` - job posting foundation
- `/admin` - private review dashboard
- `/admin/login` - admin sign-in
- `/admin/backend` - private backend workspace for sources, categories, photos, and subscribers
- `/admin/articles/new` - add an article
- `/admin/articles/[id]/edit` - edit an article
- `/api/articles` - published article JSON feed
- `/api/admin/articles` - admin article API
- `/api/newsletter` - newsletter signup API
- `/api/summaries` - OpenAI summary API
- `/api/ingest/rss` - RSS ingestion foundation

## Product Notes

ClubFlow is the news and intelligence platform. Club Ops Pro is reserved for future operating playbooks, courses, templates, and partner/resource placements. The UI includes Featured Resource areas where that brand can be promoted later without confusing ClubFlow's core editorial position.
