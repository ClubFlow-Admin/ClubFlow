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
  "sourceType" TEXT NOT NULL DEFAULT 'other',
  "primaryCategory" TEXT,
  "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "priority" INTEGER NOT NULL DEFAULT 50,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastCheckedAt" TIMESTAMP(3),
  "lastSuccessfulImportAt" TIMESTAMP(3),
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
  "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
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
  "publishedAt" TIMESTAMP(3),
  "notes" TEXT,
  "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
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

CREATE TABLE IF NOT EXISTS "RankingEntry" (
  "id" TEXT PRIMARY KEY,
  "category" TEXT NOT NULL,
  "rank" INTEGER NOT NULL,
  "clubName" TEXT NOT NULL,
  "city" TEXT,
  "state" TEXT,
  "score" INTEGER,
  "rationale" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RankingEntry_category_clubName_key" UNIQUE ("category", "clubName")
);

CREATE TABLE IF NOT EXISTS "PodcastEpisode" (
  "id" TEXT PRIMARY KEY,
  "showName" TEXT NOT NULL,
  "title" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "duration" TEXT,
  "publishedAt" TIMESTAMP(3),
  "audioUrl" TEXT,
  "comingSoon" BOOLEAN NOT NULL DEFAULT true,
  "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL DEFAULT 'other';
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "primaryCategory" TEXT;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "priority" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "lastCheckedAt" TIMESTAMP(3);
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "lastSuccessfulImportAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "Article_categoryId_idx" ON "Article"("categoryId");
CREATE INDEX IF NOT EXISTS "Article_sourceId_idx" ON "Article"("sourceId");
CREATE INDEX IF NOT EXISTS "Article_heroImageId_idx" ON "Article"("heroImageId");
CREATE INDEX IF NOT EXISTS "Article_clubName_idx" ON "Article"("clubName");
CREATE INDEX IF NOT EXISTS "Article_city_state_idx" ON "Article"("city", "state");
CREATE INDEX IF NOT EXISTS "MediaAsset_category_idx" ON "MediaAsset"("category");
CREATE INDEX IF NOT EXISTS "Source_active_sourceType_idx" ON "Source"("active", "sourceType");
CREATE INDEX IF NOT EXISTS "Source_primaryCategory_idx" ON "Source"("primaryCategory");
CREATE UNIQUE INDEX IF NOT EXISTS "JobPosting_title_clubName_key" ON "JobPosting"("title", "clubName");
CREATE INDEX IF NOT EXISTS "RankingEntry_category_rank_idx" ON "RankingEntry"("category", "rank");

ALTER TABLE "JobPosting" ADD COLUMN IF NOT EXISTS "status" "ArticleStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "ExecutiveMove" ADD COLUMN IF NOT EXISTS "status" "ArticleStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "ExecutiveMove" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "RankingEntry" ADD COLUMN IF NOT EXISTS "status" "ArticleStatus" NOT NULL DEFAULT 'draft';
ALTER TABLE "RankingEntry" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "PodcastEpisode" ADD COLUMN IF NOT EXISTS "status" "ArticleStatus" NOT NULL DEFAULT 'draft';

DO $$ BEGIN
  CREATE TYPE "EntityStatus" AS ENUM ('active', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Club" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "location" TEXT,
  "city" TEXT,
  "state" TEXT,
  "country" TEXT,
  "clubType" TEXT,
  "website" TEXT,
  "logoUrl" TEXT,
  "description" TEXT,
  "foundedYear" INTEGER,
  "holes" INTEGER,
  "status" "EntityStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Company" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "industry" TEXT,
  "website" TEXT,
  "logoUrl" TEXT,
  "description" TEXT,
  "headquarters" TEXT,
  "status" "EntityStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Person" (
  "id" TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT,
  "biography" TEXT,
  "photoUrl" TEXT,
  "linkedInUrl" TEXT,
  "currentOrganization" TEXT,
  "status" "EntityStatus" NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "_ArticleToClub" (
  "A" TEXT NOT NULL REFERENCES "Article"("id") ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES "Club"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "_ArticleToClub_AB_unique" ON "_ArticleToClub"("A", "B");
CREATE INDEX IF NOT EXISTS "_ArticleToClub_B_index" ON "_ArticleToClub"("B");

CREATE TABLE IF NOT EXISTS "_ArticleToCompany" (
  "A" TEXT NOT NULL REFERENCES "Article"("id") ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "_ArticleToCompany_AB_unique" ON "_ArticleToCompany"("A", "B");
CREATE INDEX IF NOT EXISTS "_ArticleToCompany_B_index" ON "_ArticleToCompany"("B");

CREATE TABLE IF NOT EXISTS "_ArticleToPerson" (
  "A" TEXT NOT NULL REFERENCES "Article"("id") ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES "Person"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "_ArticleToPerson_AB_unique" ON "_ArticleToPerson"("A", "B");
CREATE INDEX IF NOT EXISTS "_ArticleToPerson_B_index" ON "_ArticleToPerson"("B");

CREATE INDEX IF NOT EXISTS "Club_status_idx" ON "Club"("status");
CREATE INDEX IF NOT EXISTS "Club_city_state_idx" ON "Club"("city", "state");
CREATE INDEX IF NOT EXISTS "Company_status_idx" ON "Company"("status");
CREATE INDEX IF NOT EXISTS "Company_industry_idx" ON "Company"("industry");
CREATE INDEX IF NOT EXISTS "Person_status_idx" ON "Person"("status");
CREATE INDEX IF NOT EXISTS "Person_lastName_firstName_idx" ON "Person"("lastName", "firstName");

ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "aiWhatHappened" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "aiWhyItMatters" TEXT;

ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "dek" TEXT;
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "aiKeyTakeaways" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "aiIndustryContext" TEXT;
