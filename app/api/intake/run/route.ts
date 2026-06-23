import { NextResponse } from "next/server";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { runIntake } from "@/lib/intake";

export async function POST() {
  if (!(await isAdminSignedIn())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const summary = await runIntake();
  return NextResponse.json(summary);
}
