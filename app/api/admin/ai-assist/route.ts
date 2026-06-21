import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { articleAiActions, transformArticleText } from "@/lib/openai";

const schema = z.object({
  action: z.enum(articleAiActions),
  text: z.string().max(20_000),
  title: z.string().optional()
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid action and text are required." }, { status: 400 });
  }

  const result = await transformArticleText(parsed.data);
  if (!result) {
    return NextResponse.json(
      { error: "AI is not configured or the request failed. No changes were made." },
      { status: 502 }
    );
  }

  return NextResponse.json({ result });
}
