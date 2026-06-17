import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ingestRssFeed } from "@/lib/rss";

const schema = z.object({
  rssUrl: z.string().url()
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "A valid rssUrl is required." }, { status: 400 });
  }

  const items = await ingestRssFeed(parsed.data.rssUrl);
  return NextResponse.json({
    imported: items.length,
    items,
    message: "RSS ingestion foundation is wired. Add rss-parser normalization to persist draft articles."
  });
}
