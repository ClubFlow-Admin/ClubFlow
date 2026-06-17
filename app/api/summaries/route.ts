import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { summarizeClubStory } from "@/lib/openai";

const schema = z.object({
  title: z.string().min(3),
  excerpt: z.string().optional(),
  source: z.string().optional()
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const summary = await summarizeClubStory(parsed.data);
  return NextResponse.json({ summary });
}
