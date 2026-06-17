DO $$ BEGIN
  CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'reviewed', 'published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NewsletterFrequency" AS ENUM ('daily', 'weekly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Source" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "homepageUrl" TEXT,
  "rssUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "Article" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "originalUrl" TEXT NOT NULL UNIQUE,
  "author" TEXT,
  "publishedAt" TIMESTAMP(3) NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "clubName" TEXT,
  "city" TEXT,
  "state" TEXT,
  "originalExcerpt" TEXT,
  "aiSummary" TEXT NOT NULL,
  "importanceScore" INTEGER NOT NULL DEFAULT 50,
  "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "sourceId" TEXT NOT NULL REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "categoryId" TEXT NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "heroImageId" TEXT
);

CREATE TABLE IF NOT EXISTS "MediaAsset" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL UNIQUE,
  "altText" TEXT,
  "caption" TEXT,
  "credit" TEXT,
  "category" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "heroImageId" TEXT;

DO $$ BEGIN
  ALTER TABLE "Article"
    ADD CONSTRAINT "Article_heroImageId_fkey"
    FOREIGN KEY ("heroImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "frequency" "NewsletterFrequency" NOT NULL DEFAULT 'weekly',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "NewsletterIssue" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "frequency" "NewsletterFrequency" NOT NULL,
  "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "NewsletterStory" (
  "id" TEXT PRIMARY KEY,
  "issueId" TEXT NOT NULL REFERENCES "NewsletterIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "articleId" TEXT NOT NULL REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "shortSummary" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "NewsletterStory_issueId_articleId_key" UNIQUE ("issueId", "articleId")
);

CREATE TABLE IF NOT EXISTS "JobPosting" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "clubName" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "url" TEXT,
  "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "ExecutiveMove" (
  "id" TEXT PRIMARY KEY,
  "executive" TEXT NOT NULL,
  "newRole" TEXT NOT NULL,
  "previousRole" TEXT,
  "clubName" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "effectiveAt" TIMESTAMP(3),
  "notes" TEXT,
  "articleId" TEXT UNIQUE REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "DevelopmentProject" (
  "id" TEXT PRIMARY KEY,
  "clubName" TEXT NOT NULL,
  "projectName" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "budget" TEXT,
  "timeline" TEXT,
  "architect" TEXT,
  "status" TEXT,
  "description" TEXT,
  "articleId" TEXT UNIQUE REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "Article_categoryId_idx" ON "Article"("categoryId");
CREATE INDEX IF NOT EXISTS "Article_sourceId_idx" ON "Article"("sourceId");
CREATE INDEX IF NOT EXISTS "Article_heroImageId_idx" ON "Article"("heroImageId");
CREATE INDEX IF NOT EXISTS "Article_clubName_idx" ON "Article"("clubName");
CREATE INDEX IF NOT EXISTS "Article_city_state_idx" ON "Article"("city", "state");
CREATE INDEX IF NOT EXISTS "MediaAsset_category_idx" ON "MediaAsset"("category");
