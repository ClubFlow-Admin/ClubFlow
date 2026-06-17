import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/articles";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const articles = await getArticles({
    category: searchParams.get("category") ?? undefined,
    query: searchParams.get("query") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    clubName: searchParams.get("clubName") ?? undefined,
    location: searchParams.get("location") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    status: "published"
  });

  return NextResponse.json({ articles });
}
