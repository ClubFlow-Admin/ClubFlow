import { NextResponse } from "next/server";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { runRssIngestion } from "@/lib/ingest";

export async function POST() {
  if (!(await isAdminSignedIn())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const summary = await runRssIngestion();
  return NextResponse.json(summary);
}
