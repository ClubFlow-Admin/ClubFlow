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
  importanceScore: z.number().int().min(0).max(100),
  status: z.nativeEnum(ArticleStatus),
  heroImageId: z.string().optional().nullable()
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = schema.partial().parse(await request.json());
  const article = await prisma.article.update({
    where: { id },
    data: {
      ...body,
      slug: body.title ? slugify(body.title) : undefined,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined
    }
  });

  return NextResponse.json({ article });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
