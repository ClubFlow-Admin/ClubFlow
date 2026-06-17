import { ArticleStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3),
  originalUrl: z.string().url(),
  sourceId: z.string().min(1),
  categoryId: z.string().min(1),
  author: z.string().optional().nullable(),
  publishedAt: z.string(),
  tags: z.array(z.string()).default([]),
  clubName: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  originalExcerpt: z.string().optional().nullable(),
  aiSummary: z.string().min(10),
  importanceScore: z.number().int().min(0).max(100).default(50),
  status: z.nativeEnum(ArticleStatus).default("draft"),
  heroImageId: z.string().optional().nullable()
});

export async function GET() {
  const articles = await prisma.article.findMany({
    include: { category: true, source: true, heroImage: true },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  const body = schema.parse(await request.json());
  const article = await prisma.article.create({
    data: {
      ...body,
      slug: slugify(body.title),
      publishedAt: new Date(body.publishedAt)
    }
  });

  return NextResponse.json({ article }, { status: 201 });
}
